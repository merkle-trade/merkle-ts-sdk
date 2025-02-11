import { MerkleClient } from "@/client";
import { MerkleClientConfig } from "@/client/config";
import { sleep } from "@/utils";
import {
  Account,
  Aptos,
  Ed25519PrivateKey,
  type InputEntryFunctionData,
  PrivateKey,
  PrivateKeyVariants,
} from "@aptos-labs/ts-sdk";

// initialize clients

const merkle = new MerkleClient(await MerkleClientConfig.testnet());
const aptos = new Aptos(merkle.config.aptosConfig);

// initialize account

const PRIVATE_KEY = "your-private-key";

const account = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(
    PrivateKey.formatPrivateKey(PRIVATE_KEY, PrivateKeyVariants.Ed25519),
  ),
});

// get usdc balance

const faucetPayload = merkle.payloads.testnetFaucetUSDC({
  amount: 10_000_000n,
});
const faucetTx = await sendTransaction(faucetPayload);
console.log(`Successfully claimed testnet USDC (tx hash: ${faucetTx.hash})`);

const usdcBalance = await merkle.getUsdcBalance({
  accountAddress: account.accountAddress,
});

console.log(`USDC Balance: ${Number(usdcBalance) / 1e6} USDC`);

// place order

const openPayload = merkle.payloads.placeMarketOrder({
  pair: "BTC_USD",
  userAddress: account.accountAddress,
  sizeDelta: 300_000_000n,
  collateralDelta: 5_000_000n,
  isLong: true,
  isIncrease: true,
});

const openTx = await sendTransaction(openPayload);

console.log(`Successfully placed open order (tx hash: ${openTx.hash})`);

await sleep(2_000);

// get list of open positions & find BTC_USD position

const positions = await merkle.getPositions({
  address: account.accountAddress.toString(),
});

console.log("Open positions", positions);

const position = positions.find((position) =>
  position.pairType.endsWith("BTC_USD"),
);
if (!position) {
  throw new Error("BTC_USD position not found");
}

// close position

const closePayload = merkle.payloads.placeMarketOrder({
  pair: "BTC_USD",
  userAddress: account.accountAddress,
  sizeDelta: position.size,
  collateralDelta: position.collateral,
  isLong: position.isLong,
  isIncrease: false,
});

const closeTx = await sendTransaction(closePayload);

console.log(`Successfully placed close order (tx hash: ${closeTx.hash})`);

// util

async function sendTransaction(payload: InputEntryFunctionData) {
  const transaction = await aptos.transaction.build.simple({
    sender: account.accountAddress,
    data: payload,
  });
  const { hash } = await aptos.signAndSubmitTransaction({
    signer: account,
    transaction,
  });
  return await aptos.waitForTransaction({ transactionHash: hash });
}
