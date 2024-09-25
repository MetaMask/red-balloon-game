import {
  balloons,
  delegations,
  offers,
  transactions,
  userBalloons,
  users,
  winners,
} from "@/server/db/schema";
import { type GenericContract } from "@/lib/contract";
import { BALLOON_CONTRACTS, BALLOON_COUNT, CHAIN } from "@/lib/constants";
import { generateUuids } from "@/lib/utils";
import { db } from "@/server/db";
import {
  type DelegationStruct,
  Implementation,
  ROOT_AUTHORITY,
  createDeleGatorClient,
  getDelegationHashOffchain,
} from "@codefi/delegator-core-viem";
import { type Hex, createPublicClient } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getDelegatorEnv } from "@/lib/delegator";

if (!process.env.DEPLOYER_PRIVATE_KEY || !(/0x[0-9a-fA-F]+/.test(process.env.DEPLOYER_PRIVATE_KEY))) {
  throw new Error("DEPLOYER_PRIVATE_KEY is not set or is invalid");
}
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;

const clearTables = async () => {
  /* eslint-disable drizzle/enforce-delete-with-where */
  await db.delete(winners);
  await db.delete(userBalloons);
  await db.delete(transactions);
  await db.delete(delegations);
  await db.delete(balloons);
  await db.delete(offers);
  await db.delete(users);
};

// create the initial Balloon Delegation that will be attached to physical red balloons
async function createInitialBalloonDelegation(
  balloonContract: GenericContract,
): Promise<{ delegation: DelegationStruct; pk: Hex }> {
  const signatory = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
  const publicClient = createPublicClient({
    chain: CHAIN,
  });
  const ownerGatorAddress = (await publicClient.readContract({
    address: balloonContract.address,
    abi: balloonContract.abi,
    functionName: "owner",
  })) as Hex;

  const ownerGator = createDeleGatorClient({
    chain: CHAIN,
    account: {
      implementation: Implementation.Hybrid,
      isAccountDeployed: true,
      signatory,
      address: ownerGatorAddress,
    },
    // this is only needed when developing locally
    environment: getDelegatorEnv(CHAIN.id),
  });

  const delegatePk = generatePrivateKey();
  const delegateAddress = privateKeyToAccount(delegatePk).address;

  // Encode the terms parameter.
  const caveats = ownerGator
    .createCaveatBuilder()
    .addCaveat("allowedTargets", [balloonContract.address])
    .addCaveat("allowedMethods", ["assignHolder(address)"])
    .build();

  const delegation = await ownerGator.signDelegation({
    delegator: ownerGator.account.address,
    delegate: delegateAddress,
    authority: ROOT_AUTHORITY,
    caveats,
    salt: 0n,
    signature: "0x",
  });

  return { delegation, pk: delegatePk };
}

const createInitialDelegations = () => {
  const delegations = BALLOON_CONTRACTS.map((contract) =>
    createInitialBalloonDelegation(contract),
  );
  return Promise.all(delegations);
};

export const seed = async () => {
  await clearTables();
  const deployerPk = DEPLOYER_PRIVATE_KEY;
  const balloonIds = generateUuids(BALLOON_COUNT);

  const signedDelegations = await createInitialDelegations();

  console.log("Creating main user...");

  const mainWallet = privateKeyToAccount(deployerPk);

  const [mainUser] = await db
    .insert(users)
    .values({
      username: "main",
      walletAddress: mainWallet.address,
      avatarUrl: "",
    })
    .returning({ id: users.id });

  if (!mainUser) throw new Error("Main user not found");

  console.log("Main user created!");
  console.table(mainUser);

  console.log("Creating offers...");

  const newOffers = await db
    .insert(offers)
    .values(
      Array.from({ length: BALLOON_COUNT }, () => ({
        createdBy: mainUser.id,
      })),
    )
    .returning({ id: offers.id });

  console.log("Offers created!");
  console.table(newOffers);

  if (newOffers.length !== BALLOON_COUNT) {
    throw new Error("Failed to create offers");
  }

  if (signedDelegations.length !== BALLOON_COUNT) {
    throw new Error("Failed to sign delegations");
  }

  console.log("Creating balloons...");

  const insertedBalloons = await db
    .insert(balloons)
    .values(
      newOffers.map(({ id: offerId }, index) => ({
        id: balloonIds[index],
        offerId,
        pk: signedDelegations[index]!.pk,
        index,
      })),
    )
    .returning({
      id: balloons.id,
      index: balloons.index,
      offerId: balloons.offerId,
    });

  console.log("Balloons created!");
  console.table(insertedBalloons);

  console.log("Creating delegations...");

  const dbDelegations = await db
    .insert(delegations)
    .values(
      signedDelegations.map(({ delegation: signedDelegation }, index) => {
        const balloon = insertedBalloons.find(
          (balloon) => balloon.index === index,
        );

        if (!balloon) {
          throw new Error("Balloon not found");
        }

        const { authority } = signedDelegation;

        return {
          delegation: signedDelegation,
          userId: mainUser.id,
          authority,
          balloonId: balloon.id,
          commission: 0,
          hash: getDelegationHashOffchain(signedDelegation),
          totalCommission: 0,
          hops: 0,
          offerId: balloon.offerId,
        };
      }),
    )
    .returning({ id: delegations.id, userId: delegations.userId });

  console.log("Delegations created!");
  console.table(dbDelegations);
};

seed()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
