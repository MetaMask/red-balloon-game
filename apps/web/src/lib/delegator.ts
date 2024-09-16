import { stringify, parse, decodePacked } from "@/lib/utils";
import {
  createClient,
  encodeFunctionData,
  http,
  type Hex,
  type Address,
  encodePacked,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  createDelegation,
  createDeleGatorClient,
  getDelegationHashOffchain,
  Implementation,
  type DelegationStruct,
  type DeleGatorClient,
  type Redemption,
  type OptionalUserOpConfig,
  type UserOperationV07,
  SINGLE_DEFAULT_MODE,
  ROOT_AUTHORITY,
  encodeDelegations,
  createCaveatBuilder,
  getDeleGatorEnvironment,
} from "@codefi/delegator-core-viem";
import {
  ENTRYPOINT_ADDRESS_V07,
  type GetUserOperationReceiptReturnType,
  bundlerActions,
} from "permissionless";
import {
  pimlicoBundlerActions,
  pimlicoPaymasterActions,
} from "permissionless/actions/pimlico";
import {
  BALLOON_CONTRACTS,
  CHAIN,
  GAME_CONTRACT,
  PRIZE_WEI,
} from "@/lib/constants";
import { env } from "@/env";
import { hardhat, sepolia } from "viem/chains";

export { ROOT_AUTHORITY } from "@codefi/delegator-core-viem";

export type DelegationWithPk = {
  delegation: DelegationStruct;
  pk: Hex;
};

export type DelegationCommission = {
  beneficiary: Address;
  amount: bigint;
};

export type DelegationChains = Map<
  Address,
  {
    delegations: DelegationStruct[];
    leafPk: Hex;
  }
>;

type RedBalloonConstants = {
  gatorSalt: Hex;
  userOperationTimeout: number;
};

const delegatorConfig: RedBalloonConstants = {
  gatorSalt: "0x0",
  userOperationTimeout: 10_000,
};

export const getDelegatorEnv = (chainId: number) => {
  return getDeleGatorEnvironment(
    chainId === hardhat.id ? sepolia.id : chainId,
    "1.1.0",
  );
};

export const delegationToString = (delegation: DelegationStruct) => {
  return stringify(delegation);
};

export const delegationFromString = (delegation: string) => {
  return parse<DelegationStruct>(delegation);
};

/**
 * @description Redelegate a delegation to a new address, which creates a new delegation that uses `parent.delegation` as the authority.
 * @param parent The parent delegation that will be used as the authority for the new delegation.
 * @param to The address to which the delegation will be delegated.
 * @param commission The commission to be attached to the new delegation.
 * @returns The newly created `DelegationStruct`.
 */
export async function redelegate(
  parent: DelegationWithPk,
  to: Address,
  commission?: DelegationCommission,
): Promise<DelegationStruct> {
  const parentAccount = privateKeyToAccount(parent.pk);

  if (
    parentAccount.address.toLowerCase() !==
    parent.delegation.delegate.toLowerCase()
  ) {
    throw new Error("The delegate must match the from address");
  }

  const authority = getDelegationHashOffchain(parent.delegation);
  const delegatorClient = getDelegatorClientFromPk(parent.pk);

  // TODO: refactor once SDK supports passing options to client.createCaveatBuilder()
  const caveatBuilder = createCaveatBuilder(
    delegatorClient.account.environment,
    { allowEmptyCaveats: true },
  );

  // only add commission caveat, as this is a redelegation of a delegation that already enforces targets and methods
  if (commission?.amount) {
    caveatBuilder.addCaveat(
      "nativeTokenPayment",
      commission.beneficiary,
      commission.amount,
    );
  }

  const delegation = createDelegation(
    to,
    parentAccount.address,
    authority,
    caveatBuilder,
  );

  return delegatorClient.signDelegation(delegation);
}

/**
 * @description Claim the win.
 * @param chains The delegation chains that will be used to claim the win.
 * @param payoutAddress The winner's payout address, which will receive the prize (minus commissions).
 * @returns The user operation receipt.
 */
export async function claimWin(
  chains: DelegationChains,
  payoutAddress: Address,
) {
  const bundler = getBundlerClient();
  const paymaster = getPaymasterClient();

  const winnerGator = getDelegatorClientFromPk(generatePrivateKey());

  console.log("Finalizing delegation chains...");

  const { fast } = await bundler.getUserOperationGasPrice();

  console.log("fast:", fast);
  console.log("Creating userOp...");

  const userOp = await createUserOp(winnerGator, chains, payoutAddress, fast);

  console.log("Submitting userOp...");
  const receipt = await submitUserOp(userOp, winnerGator, bundler, paymaster);

  return receipt;
}

/**
 * @description Create a user operation that will be used to claim the win.
 * @param gator The winner DeleGator client.
 * @param chains The delegation chains that will be used to claim the win.
 * @param winnerAddress The winner's payout address, which will receive the prize (minus commissions).
 * @param options Optional user operation configuration.
 * @returns The user operation.
 */
const createUserOp = async (
  gator: DeleGatorClient,
  chains: DelegationChains,
  winnerAddress: Address,
  options?: OptionalUserOpConfig,
) => {
  const redemptions: Redemption[] = [];

  const redBalloonAbi = BALLOON_CONTRACTS[0]?.abi;
  if (!redBalloonAbi) {
    throw new Error("No RedBalloon abi");
  }

  // Create last delegation to winnerGator
  const finalChains = await finalizeDelegationChains(chains, gator);

  let totalCommissions = 0n;

  // Executions for calling assignHolder on each RedBalloon contract

  for (const [balloonAddress, { delegations }] of finalChains) {
    totalCommissions += await approveDelegationsPayment(gator, delegations);

    redemptions.push({
      permissionContext: delegations,
      executions: [
        {
          target: balloonAddress,
          callData: encodeFunctionData({
            abi: redBalloonAbi,
            functionName: "assignHolder",
            args: [gator.account.address],
          }),
          value: 0n,
        },
      ],
      mode: SINGLE_DEFAULT_MODE,
    });
  }

  // Execution for calling claimWin on the TreasureHunt contract
  redemptions.push({
    permissionContext: [],
    executions: [
      {
        target: GAME_CONTRACT.address,
        callData: encodeFunctionData({
          abi: GAME_CONTRACT.abi,
          functionName: "claimWin",
          args: [gator.account.address],
        }),
        value: 0n,
      },
    ],
    mode: SINGLE_DEFAULT_MODE,
  });

  // Execution for transferring the remaining funds to the claimer's address
  console.log("Creating redemption for remaining funds...", totalCommissions);
  redemptions.push({
    permissionContext: [],
    executions: [
      {
        target: winnerAddress,
        callData: "0x",
        value: PRIZE_WEI - totalCommissions,
      },
    ],
    mode: SINGLE_DEFAULT_MODE,
  });

  return gator.createRedeemDelegationsUserOp(redemptions, options);
};

/**
 * @description Submit a user operation to the bundler and paymaster.
 * @param userOp The user operation to be submitted.
 * @param gator The winner DeleGator client.
 * @param bundler The bundler client.
 * @param paymaster The paymaster client.
 * @returns The user operation receipt.
 */
const submitUserOp = async (
  userOp: UserOperationV07,
  gator: DeleGatorClient,
  bundler: ReturnType<typeof getBundlerClient>,
  paymaster: ReturnType<typeof getPaymasterClient>,
): Promise<GetUserOperationReceiptReturnType> => {
  console.log("Estimating useroperation gas...");

  const gasEstimate = await bundler.estimateUserOperationGas({
    userOperation: userOp,
  });
  console.log("Gas estimate:", gasEstimate);

  const sponsorship = await paymaster.sponsorUserOperation({
    userOperation: userOp,
  });

  const signedUserOperation = await gator.signUserOp({
    ...userOp,
    ...sponsorship,
  });

  const userOpHash = await bundler.sendUserOperation({
    userOperation: signedUserOperation,
  });

  const receipt = await bundler.waitForUserOperationReceipt({
    hash: userOpHash,
    timeout: delegatorConfig.userOperationTimeout,
  });

  if (!receipt.success) {
    throw new Error("UserOperation failed: " + receipt.reason);
  }

  console.log("UserOperation settled", {
    userOpHash,
    actualGasUsed: receipt.actualGasUsed,
  });

  return receipt;
};

/**
 * @description Approve the payment of delegations.
 * @param gator The winner DeleGator client.
 * @param delegations The delegations to be approved.
 * @returns The total commission in this delegation chain.
 */
const approveDelegationsPayment = async (
  gator: DeleGatorClient,
  delegations: DelegationStruct[],
) => {
  const ntpEnforcerAddress =
    gator.account.environment.caveatEnforcers.NativeTokenPaymentEnforcer!;
  let totalCommission = 0n;

  for (const delegation of delegations) {
    const paidCaveats = delegation.caveats.filter(
      (c) => c.enforcer === ntpEnforcerAddress,
    );

    for (const paidCaveat of paidCaveats) {
      const { terms } = paidCaveat;
      const [addr, commissionAmount] = decodePacked(terms, [
        "address",
        "uint256",
      ]);
      console.log(
        `Decoded commission amount: ${commissionAmount} for address: ${addr}`,
      );
      totalCommission += commissionAmount;

      // TODO: refactor once SDK supports passing options to client.createCaveatBuilder()
      const caveatBuilder = createCaveatBuilder(gator.account.environment, {
        allowEmptyCaveats: true,
      });

      const unsignedPaymentDelegation = createDelegation(
        ntpEnforcerAddress,
        gator.account.address,
        ROOT_AUTHORITY,
        caveatBuilder
          .addCaveat(
            "argsEqualityCheck",
            encodePacked(
              ["bytes32", "address"],
              [getDelegationHashOffchain(delegation), gator.account.address],
            ),
          )
          .addCaveat("nativeTokenTransferAmount", commissionAmount),
      );
      console.log("Creating payment delegation", {
        delegationHash: getDelegationHashOffchain(unsignedPaymentDelegation),
      });

      const paymentDelegation = await gator.signDelegation(
        unsignedPaymentDelegation,
      );

      const allowancePermissionsContext = encodeDelegations([
        paymentDelegation,
      ]);

      const paymentArgs = allowancePermissionsContext;

      paidCaveat.args = paymentArgs;
    }
  }

  return totalCommission;
};

/**
 * @description Finalize the delegation chains by creating a new delegation for each balloon which delegates to the winner's DeleGator account.
 * @param chains The delegation chains that will be used to claim the win.
 * @param gator The winner DeleGator client.
 * @returns The delegation chains with the new delegations.
 */
const finalizeDelegationChains = async (
  chains: DelegationChains,
  gator: DeleGatorClient,
) => {
  const finalChains: DelegationChains = new Map();

  for (const [balloonAddress, { delegations, leafPk }] of chains) {
    const leaf = delegations[0];
    if (!leaf) {
      throw new Error("No leaf delegation");
    }

    const delegationToGator = await redelegate(
      { delegation: leaf, pk: leafPk },
      gator.account.address,
    );
    finalChains.set(balloonAddress, {
      delegations: [delegationToGator, ...delegations],
      leafPk,
    });
  }

  return finalChains;
};

const getDelegatorClientFromPk = (pk: Hex) => {
  const account = privateKeyToAccount(pk);
  const chain = CHAIN;
  return createDeleGatorClient({
    transport: http(env.NEXT_PUBLIC_CHAIN_URL),
    chain,
    account: {
      implementation: Implementation.Hybrid,
      deployParams: [account.address, [], [], []],
      deploySalt: delegatorConfig.gatorSalt,
      signatory: account,
      isAccountDeployed: false,
    },
    // this is only needed when developing locally, since the DeleGator Toolkit
    // wouldn't know what environment to use for chain ID 31337
    environment: getDelegatorEnv(CHAIN.id),
  });
};

const getBundlerClient = () => {
  const bundler = createClient({
    transport: http(env.NEXT_PUBLIC_BUNDLER_URL),
    chain: CHAIN,
  })
    .extend(bundlerActions(ENTRYPOINT_ADDRESS_V07))
    .extend(pimlicoBundlerActions(ENTRYPOINT_ADDRESS_V07));

  return bundler;
};

const getPaymasterClient = () => {
  const paymaster = createClient({
    transport: http(env.NEXT_PUBLIC_PAYMASTER_URL),
    chain: CHAIN,
  }).extend(pimlicoPaymasterActions(ENTRYPOINT_ADDRESS_V07));

  return paymaster;
};
