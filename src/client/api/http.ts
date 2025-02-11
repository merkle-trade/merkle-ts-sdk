import {
  getAllPairInfos,
  getAllPairStates,
  getOrders,
  getPairInfo,
  getPairState,
  getPositions,
  getSummary,
  getTradingHistory,
  postFeepayer,
} from "@/api/http";
import type { MerkleClientConfig } from "@/client/config";
import type { Hex } from "@/types";
import type { FeepayerResponse, Summary, TradeHistory } from "@/types/api";
import type { Order, PairInfo, PairState, Position } from "@/types/trading";

export class APIClient {
  constructor(readonly config: MerkleClientConfig) {}

  /**
   * @description Get summary
   * @returns Summary
   */
  async getSummary(): Promise<Summary> {
    return getSummary(this.config);
  }

  /**
   * @description Get pair info
   * @param pairId - Pair ID example: `BTC_USD`
   * @returns Pair info
   */
  async getPairInfo(args: { pairId: string }): Promise<PairInfo> {
    return getPairInfo({ ...this.config, ...args });
  }

  /**
   * @description Get all pair info
   * @returns All pair info
   */
  async getAllPairInfos(): Promise<PairInfo[]> {
    return getAllPairInfos(this.config);
  }

  /**
   * @description Get pair state
   * @param pairId - Pair ID example: `BTC_USD`
   * @returns Pair state
   */
  async getPairState(args: { pairId: string }): Promise<PairState> {
    return getPairState({ ...this.config, ...args });
  }

  /**
   * @description Get all pair state
   * @returns All pair state
   */
  async getAllPairStates(): Promise<PairState[]> {
    return getAllPairStates(this.config);
  }

  /**
   * @description Get orders
   * @param address - Address
   * @returns Orders
   */
  async getOrders(args: { address: Hex }): Promise<Order[]> {
    return getOrders({ ...this.config, ...args });
  }

  /**
   * @description Get positions
   * @param address - Address
   * @returns Positions
   */
  async getPositions(args: { address: Hex }): Promise<Position[]> {
    return getPositions({ ...this.config, ...args });
  }

  /**
   * @description Get trading history
   * @param address - Address
   * @returns Trading history
   */
  async getTradingHistory(args: { address: Hex }): Promise<TradeHistory[]> {
    return getTradingHistory({ ...this.config, ...args });
  }

  /**
   * @description Post feepayer
   * @param txHex - Transaction
   * @param senderAuthenticator - Sender authenticator
   * @returns Feepayer response
   */
  async postFeepayer(args: {
    txHex: string;
    senderAuthenticator: string;
  }): Promise<FeepayerResponse> {
    return postFeepayer({ ...this.config, ...args });
  }
}
