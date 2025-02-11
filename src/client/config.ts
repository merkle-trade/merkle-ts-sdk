import { AptosConfig, Network } from "@aptos-labs/ts-sdk";

import { getSummary } from "@/api/http";
import { MerkleConfig } from "@/config";
import type { Summary } from "@/types/api";

export type MerkleClientConfig = {
  merkleConfig: MerkleConfig;
  aptosConfig: AptosConfig;
  summary: Summary;
};

export namespace MerkleClientConfig {
  const MAINNET_DEPLOYER_ADDRESS =
    "0x5ae6789dd2fec1a9ec9cccfb3acaf12e93d432f0a3a42c92fe1a9d490b7bbc06";

  export const mainnet = async (config?: Partial<MerkleClientConfig>) => {
    const merkleConfig = config?.merkleConfig ?? MerkleConfig.MAINNET;
    const aptosConfig =
      config?.aptosConfig ?? new AptosConfig({ network: Network.MAINNET });
    const summary = config?.summary ?? (await getSummary({ merkleConfig }));

    if (summary.hostAddress !== MAINNET_DEPLOYER_ADDRESS) {
      throw new Error("Invalid deployer address");
    }

    return { merkleConfig, aptosConfig, summary } satisfies MerkleClientConfig;
  };

  export const testnet = async (config?: Partial<MerkleClientConfig>) => {
    const merkleConfig = config?.merkleConfig ?? MerkleConfig.TESTNET;
    const aptosConfig =
      config?.aptosConfig ?? new AptosConfig({ network: Network.TESTNET });
    const summary = config?.summary ?? (await getSummary({ merkleConfig }));

    return { merkleConfig, aptosConfig, summary } satisfies MerkleClientConfig;
  };
}
