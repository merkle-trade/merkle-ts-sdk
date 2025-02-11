export type MerkleConfig = {
  baseURL: string;
  wsURL: string;

  fetchFn?: typeof fetch;
  WebSocketCtor?: typeof WebSocket;
};

export namespace MerkleConfig {
  export const MAINNET = {
    baseURL: "https://api.merkle.trade",
    wsURL: "wss://api.merkle.trade/v1",
  } satisfies MerkleConfig;

  export const TESTNET = {
    baseURL: "https://api.testnet.merkle.trade",
    wsURL: "wss://api.testnet.merkle.trade/v1",
  } satisfies MerkleConfig;
}
