import type { AccountAddressInput } from "@aptos-labs/ts-sdk";

import {
  cancelOrder,
  placeLimitOrder,
  placeMarketOrder,
  testnetFaucetUSDC,
  updateTPSL,
} from "@/aptos/payloads";
import type { MerkleClientConfig } from "@/client/config";
import type { Hex } from "@/types";

export class MerklePayloadBuilder {
  constructor(readonly config: MerkleClientConfig) {}

  placeMarketOrder(args: {
    /** pair id or pair type */
    pair: string;
    userAddress: AccountAddressInput;
    sizeDelta: bigint;
    collateralDelta: bigint;
    slippage?: { markPrice: bigint; slippageBps: bigint };
    isLong: boolean;
    isIncrease: boolean;
    stopLossTriggerPrice?: bigint;
    takeProfitTriggerPrice?: bigint;
    canExecuteAbovePrice?: boolean;
    referrer?: AccountAddressInput;
  }) {
    return placeMarketOrder({ ...this.config, ...args });
  }

  placeLimitOrder(args: {
    /** pair id or pair type */
    pair: string;
    userAddress: AccountAddressInput;
    sizeDelta: bigint;
    collateralDelta: bigint;
    price: bigint;
    isLong: boolean;
    isIncrease: boolean;
    stopLossTriggerPrice?: bigint;
    takeProfitTriggerPrice?: bigint;
    canExecuteAbovePrice?: boolean;
    referrer?: AccountAddressInput;
  }) {
    return placeLimitOrder({ ...this.config, ...args });
  }

  cancelOrder(args: {
    /** pair id or pair type */
    pair: string;
    userAddress: Hex;
    orderId: bigint;
  }) {
    return cancelOrder({ ...this.config, ...args });
  }

  updateTPSL(args: {
    /** pair id or pair type */
    pair: string;
    userAddress: AccountAddressInput;
    isLong: boolean;
    stopLossTriggerPrice: bigint;
    takeProfitTriggerPrice: bigint;
  }) {
    return updateTPSL({ ...this.config, ...args });
  }

  testnetFaucetUSDC(args: { amount: bigint }) {
    return testnetFaucetUSDC({ ...this.config, ...args });
  }
}
