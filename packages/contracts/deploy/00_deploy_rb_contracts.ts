import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  createDeleGatorClient,
  getDeleGatorEnvironment,
  Implementation,
} from "@codefi/delegator-core-viem";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat, linea, lineaSepolia, sepolia } from "viem/chains";

const BALLOON_COUNT = process.env.BALLOON_COUNT
  ? Number(process.env.BALLOON_COUNT)
  : 3;

const PRIZE_ETH = process.env.PRIZE_ETH ?? "0.0001";

// If not set, it uses the hardhat account 0 private key.
const deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY ??
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const getDelegatorEnv = (chainId: number) => {
  return getDeleGatorEnvironment(
    chainId === hardhat.id ? sepolia.id : chainId,
    "1.1.0",
  );
};

function getChainById(chainId?: number) {
  switch (chainId) {
    case hardhat.id:
      return hardhat;
    case sepolia.id:
      return sepolia;
    case lineaSepolia.id:
      return lineaSepolia;
    case linea.id:
      return linea;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

async function deployGatorAccount(hre: HardhatRuntimeEnvironment) {
  // @ts-expect-error - hre.network.config.url is a string
  const transport = http(hre.network.config.url);
  const chainId = hre.network.config.chainId ?? hardhat.id;
  const chain = getChainById(chainId);

  console.log(`Chain: ${chain.name} (${chain.id}) ID: ${chainId}`);
  console.log(`Transport: ${transport({ chain }).value?.url}`);

  const signatory = privateKeyToAccount(deployerPrivateKey as `0x${string}`);

  console.log(`Signatory: ${signatory.address}`);

  const gatorClient = createDeleGatorClient({
    transport,
    chain,
    account: {
      implementation: Implementation.Hybrid,
      deployParams: [signatory.address, [], [], []],
      deploySalt: `0x${Math.floor(Math.random() * 100000)}`,
      isAccountDeployed: false,
      signatory,
    },
    environment: getDelegatorEnv(chain.id),
  });

  const client = createWalletClient({
    chain,
    transport,
    account: signatory,
  });

  console.log("Sending transaction...");
  const hash = await client.sendTransaction({
    to: gatorClient.account.environment.SimpleFactory,
    data: gatorClient.account.factoryData,
  });

  const publicClient = await hre.viem.getPublicClient();

  console.log("Waiting for transaction to be mined...");
  await publicClient.waitForTransactionReceipt({ hash });

  console.log("Transaction mined!");
  const deployedGatorClient = gatorClient.toDeployedClient();
  console.log("Deployed client:", deployedGatorClient.account.address);

  return deployedGatorClient;
}

/**
 * Deploys Red Balloon contracts using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployRBContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const chainId = hre.network.config.chainId ?? hardhat.id;

  const balloons = [];

  for (let i = 0; i < BALLOON_COUNT; i++) {
    const gator = await deployGatorAccount(hre);

    const rb = await deploy(`RedBalloon${i}`, {
      contract: "RedBalloon",
      from: deployer,
      args: [gator.account.address, i],
      log: true,
      autoMine: true,
      deterministicDeployment: chainId === hardhat.id,
    });

    balloons.push(rb.address);
  }

  const th = await deploy("TreasureHunt", {
    from: deployer,
    args: [balloons],
    log: true,
    autoMine: true,
    value: parseEther(PRIZE_ETH).toString(),
    linkedData: {
      prizeEth: Number(PRIZE_ETH),
    },
    deterministicDeployment: chainId === hardhat.id,
  });

  // TODO: remove once done debugging
  const publicClient = await hre.viem.getPublicClient();
  const thBalloons = await publicClient.readContract({
    // @ts-ignore
    address: th.address,
    abi: th.abi,
    functionName: "getBalloons",
  });
  console.log(`Treasure Balloons:`, thBalloons);
  console.log(
    `Treasure Balance:`,
    await publicClient.getBalance({
      address: th.address as `0x${string}`,
    }),
  );
};

export default deployRBContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. hardhat deploy --tags RedBalloon
deployRBContracts.tags = ["RedBalloon"];
