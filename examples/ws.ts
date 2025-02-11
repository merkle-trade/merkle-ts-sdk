import { MerkleClient } from "@/client";
import { MerkleClientConfig } from "@/client/config";

// initialize clients

const merkle = new MerkleClient(await MerkleClientConfig.testnet());

// subscribe to price feed

const session = await merkle.connectWsApi();

console.log("Connected to Websocket API");

const priceFeed = session.subscribePriceFeed("BTC_USD");

console.log("Subscribed to price feed");

for await (const price of priceFeed) {
  console.log(price);
}
