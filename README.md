# Merkle Trade TypeScript SDK (Beta)

> **Note:** This SDK is in beta. We are actively refining its features, so there may be occasional changes or issues.

A TypeScript SDK for interacting with the Merkle Trade protocol on the Aptos blockchain. This SDK provides a simple interface for trading, managing positions while interacting with the Merkle Trade protocol.

**Join our Telegram Group:** [@merkle_trade_dev](https://t.me/merkle_trade_dev) for latest updates and Q&A.

## Features

- Transaction Payloads for trading
- Calculation utilities for trading
- Merkle APIs (positions, orders, etc.)
- Merkle Websocket APIs (price feeds, account updates)

## Installation

```bash
npm install @merkletrade/ts-sdk

// or

yarn add @merkletrade/ts-sdk

// or

pnpm add @merkletrade/ts-sdk
```

## Quick Start

```typescript
import { MerkleClient, MerkleClientConfig } from "@merkletrade/ts-sdk";
import { Aptos } from "@aptos-labs/ts-sdk";

// initialize clients

const merkle = new MerkleClient(await MerkleClientConfig.testnet());
const aptos = new Aptos(merkle.config.aptosConfig);

// initialize account (refer to Aptos docs)

const account = ...

// Place a market order

const order = await merkle.payloads.placeMarketOrder({
  pair: "BTC_USD",
  userAddress: account.accountAddress,
  sizeDelta: 300_000_000n, // 300 USDC
  collateralDelta: 5_000_000n, // 5 USDC
  isLong: true,
  isIncrease: true,
});

// submit transaction

const committedTransaction = await aptos.transaction.build
  .simple({ sender: account.accountAddress, data: payload })
  .then((transaction) =>
    aptos.signAndSubmitTransaction({ signer: account, transaction }),
  )
  .then(({ hash }) => aptos.waitForTransaction({ transactionHash: hash }));

console.log(committedTransaction);
console.log("Successfully placed order!");
```

## API Catalog

### Client Configuration

```typescript
const merkle = new MerkleClient(await MerkleClientConfig.mainnet());
const aptos = new Aptos(merkle.config.aptosConfig);
```

### Trading Payloads

- `placeMarketOrder`
- `placeLimitOrder`
- `cancelOrder`
- `updateTPSL`
- `testnetFaucet`

See [examples/place-order.ts](examples/place-order.ts) for basic usage.

### Merkle APIs

- `getSummary`
- `getPairInfo`
- `getAllPairInfos`
- `getPairState`
- `getAllPairStates`
- `getOrders`
- `getPositions`
- `getTradingHistory`
- `postFeepayer`

### Merkle Websocket APIs

Real-time price feeds and account updates (positions, orders) are available via websocket.

- `subscribePriceFeed`
- `subscribeAccountFeed`

See [examples/ws.ts](examples/ws.ts) for more details.

### Calculation Utilities

- `calcNewPrice`
- `calcPnlWithoutFee`
- `calcPriceImpact`
- `calcRolloverFee`
- `calcFundingRate`
- `calcAccFundingFeePerSize`
- `calcFundingFee`
- ...

See [src/calc/*](src/calc/) for more details.

### Aptos Helper Methods

- `getUsdcBalance`

## Environment
- [Mainnet](https://app.merkle.trade)
- [Testnet](https://app.testnet.merkle.trade)
