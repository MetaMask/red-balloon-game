# 🎈 Red Balloon 🎈

> Demo project for the MetaMask Delegation Toolkit

This is a public demo project that showcases the [MetaMask Delegation Toolkit](https://metamask.io/developer/delegation-toolkit).
It contains the same game logic as the [Red Balloon Game](https://metamask.io/news/developers/how-the-red-balloon-game-utilized-the-metamask-delegation-toolkit-for-a-new) deployed at [EthCC](https://ethcc.io) '24 in Brussels.

## What's inside?

This project includes the following packages/apps:

## Apps and Packages

- `@rb/web`: a [Next.js](https://nextjs.org/) app that contains the game logic
- `@rb/contracts`: a [Hardhat](https://hardhat.org/) project that contains the smart contracts used in the game

## Requirements

- Node.js v20.x
- Docker Compose
- Bun

## Getting Started

The project is set up so you can run the game locally out of the box.

#### 1. Clone the repository

```bash
git clone --recursive https://github.com/MetaMask/demo-red-balloon.git
cd demo-red-balloon
```

#### 2. Install dependencies

```bash
bun install
```

> [!NOTE]
> You will need to populate the `bunfig.toml` file with your `@codefi` NPM token in order to install the `@codefi/delegator-core-viem` package.

#### 3. Setup environment variables

```bash
cp .env.example .env
```

> [!NOTE]
> Make sure to update the `.env` file with your `INFURA_API_KEY`, since we need it to fork the Sepolia network locally.

#### 4. Start local database

```bash
bun db:start
```

##### 4.1 Local database studio (optional)

```bash
bun db:studio
open https://local.drizzle.studio
```

#### 5. Start local chain, bundler and mock paymaster

```bash
bun chain:start
```

> [!NOTE]
> This step may take a while (~1 minute) to complete. Please wait before moving on to the next step.

> [!TIP]
> Otterscan (local block explorer) is available at http://localhost:5100

#### 6. Deploy contracts and seed database

```bash
bun seed
```

#### 7. Start the web app in development mode

```bash
bun dev
```

#### 8. Open the web app in your browser

```bash
open http://localhost:3000
```

## Deploying to Production

#### 1. Update the `.env` file

In order to deploy the game to production, you'll need to update the `.env` file with the desired values.

> [!WARNING]
> When deploying contracts to production, you'll need to ensure that the account tied to the `DEPLOYER_PRIVATE_KEY` has sufficient ETH to pay for the `PRIZE_ETH` plus gas costs.

#### 2. Deploy contracts

In order to deploy the contracts to a live network:

- Ensure that the target live network is configured in the `hardhat.config.ts` file.
- From the `packages/contracts` directory, run the following command:

```bash
bun deploy --network <network_name>
```

- The contracts addresses for `<network_name>` will be populated in the `apps/web/src/contracts/deployedContracts.ts` file.

> [!NOTE]
> Make sure the `NEXT_PUBLIC_CHAIN_ID` value in the `.env` file match the network you are deploying to.

#### 3. Seed database

From the `apps/web` directory, run the following command:

```bash
bun db:seed
```

#### 4. Deploy the web app

You can either run the web app locally against the production contracts and database, or deploy it to a hosting provider of your choice (e.b., Vercel, Netlify, etc.).

## References

- [MetaMask Delegation Toolkit](https://metamask.io/developer/delegation-toolkit)
- [Red Balloon Game](https://metamask.io/news/developers/how-the-red-balloon-game-utilized-the-metamask-delegation-toolkit-for-a-new)
- [EthCC](https://ethcc.io)
- [Hardhat](https://hardhat.org/)
- [Next.js](https://nextjs.org/)
