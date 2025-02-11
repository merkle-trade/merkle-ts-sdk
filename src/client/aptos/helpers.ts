import type { AccountAddressInput } from "@aptos-labs/ts-sdk";

import { getUsdcBalance } from "@/aptos/helpers";
import type { MerkleClientConfig } from "@/client/config";
import type { Decimals } from "@/types";

export class AptosHelpers {
  constructor(readonly config: MerkleClientConfig) {}

  async getUsdcBalance(args: {
    accountAddress: AccountAddressInput;
  }): Promise<Decimals.Collateral> {
    return getUsdcBalance({ ...this.config, ...args });
  }
}
