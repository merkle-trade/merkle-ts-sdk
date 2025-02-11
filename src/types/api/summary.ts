import type { Hex, MoveStructId } from "@/types";

export type RawSummaryResponse = {
  hostAddress: Hex;
  lzBridgeAddress: Hex;
  collectionIds: {
    gear: Hex;
    userNameTicket: Hex;
  };
  liquidswapLp: Hex;
  liquidswapV05: Hex;
  merkleBridgeTools: Hex;
  multisigUtils: Hex;
  coins: SummaryCoin[];
  pairs: RawSummaryPair[];
  gasEstimates: {
    deprioritized: number;
    regular: number;
    prioritized: number;
  };
  prices: SummaryPrice[];
};

export namespace RawSummaryResponse {
  export function to(raw: RawSummaryResponse): Summary {
    return {
      ...raw,
      pairs: raw.pairs.map(RawSummaryPair.to),
    };
  }
}

export type Summary = Omit<RawSummaryResponse, "pairs"> & {
  pairs: SummaryPair[];
};

export type SummaryCoin = {
  id: string; // moon
  type: "fungible-asset" | "coin-store";
  coinType?: MoveStructId; // 0x123...abc::moon_coin::MoonCoin
  assetType?: Hex;
  name: string; // Moon Coin
  symbol: string; // MOON
  decimals: number; // 6
};

export type RawSummaryPair = {
  id: string; // BTC_USD
  name: string; // Bitcoin
  type: "crypto" | "forex" | "stable" | "commodity";
  pairType: MoveStructId; // 0x123...abc::pair_types::ETH_USD
  symbol: string; // BTC/USD
  symbolLong: string; // BTC / USD
  decimals: number;
  isMarketOpen: boolean;
  listingDate?: string; // date of listing, is null if listed
  visible?: boolean; // market list visible flag
};

export namespace RawSummaryPair {
  export function to(raw: RawSummaryPair): SummaryPair {
    return {
      ...raw,
      listingDate: raw.listingDate ? new Date(raw.listingDate) : undefined,
    };
  }
}

export type SummaryPair = Omit<RawSummaryPair, "listingDate"> & {
  listingDate?: Date;
};

export type SummaryPrice = {
  id: string; // BTC_USD
  price?: number; // 10000
  price24ago?: number;
};
