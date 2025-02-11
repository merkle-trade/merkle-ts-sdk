import type { UserTransactionResponse } from "@aptos-labs/ts-sdk";

export type RawFeepayerResponse =
  | {
      tx: UserTransactionResponse;
      txHash: string;
      rateLimitRemaining: number;
    }
  | { error: string };

export type FeepayerResponse = RawFeepayerResponse;
