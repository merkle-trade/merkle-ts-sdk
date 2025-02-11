import type { Hex, MoveStructId, TableHandle } from "@/types";
import type {
  Order,
  PairInfo,
  PairState,
  Position,
  PositionEvent,
} from "@/types/trading";
import { dec } from "@/utils";

export type RawPairInfoResponse = {
  collateralType: MoveStructId;
  pairType: MoveStructId;
  executeTimeLimit: number;
  executionFee: string;
  liquidateThreshold: string;
  makerFee: string;
  maxFundingVelocity: string;
  maxLeverage: string;
  maxOpenInterest: string;
  maximumPositionCollateral: string;
  maximumProfit: string;
  minLeverage: string;
  minimumOrderCollateral: string;
  minimumPositionCollateral: string;
  minimumPositionSize: string;
  paused: boolean;
  rolloverFeePerTimestamp: string;
  skewFactor: string;
  takerFee: string;
  cooldownPeriodSecond: number;
  maximumSkewLimit: string;
  timestamp: string;
  timestampV1: string;
  timestampV2: string;
  version: number;
  versionV1: number;
  versionV2: number;
};

export namespace RawPairInfoResponse {
  export function to(raw: RawPairInfoResponse): PairInfo {
    return {
      ...raw,

      minLeverage: dec(BigInt(raw.minLeverage)),
      maxLeverage: dec(BigInt(raw.maxLeverage)),
      makerFee: dec(BigInt(raw.makerFee)),
      takerFee: dec(BigInt(raw.takerFee)),
      rolloverFeePerTimestamp: dec(BigInt(raw.rolloverFeePerTimestamp)),
      skewFactor: dec(BigInt(raw.skewFactor)),
      maxFundingVelocity: dec(BigInt(raw.maxFundingVelocity)),
      maxOpenInterest: dec(BigInt(raw.maxOpenInterest)),
      liquidateThreshold: dec(BigInt(raw.liquidateThreshold)),
      maximumProfit: dec(BigInt(raw.maximumProfit)),
      minimumOrderCollateral: dec(BigInt(raw.minimumOrderCollateral)),
      minimumPositionCollateral: dec(BigInt(raw.minimumPositionCollateral)),
      minimumPositionSize: dec(BigInt(raw.minimumPositionSize)),
      maximumPositionCollateral: dec(BigInt(raw.maximumPositionCollateral)),
      executionFee: dec(BigInt(raw.executionFee)),

      maximumSkewLimit: dec(BigInt(raw.maximumSkewLimit)),

      timestamp: new Date(raw.timestamp),
      timestampV1: new Date(raw.timestampV1),
      timestampV2: new Date(raw.timestampV2),
    };
  }
}

export type RawPairStateResponse = {
  version: number;
  timestamp: string;

  collateralType: MoveStructId;
  pairType: MoveStructId;

  nextOrderId: number;
  longOpenInterest: string;
  shortOpenInterest: string;
  fundingRate: string;
  accFundingFeePerSize: string;
  accRolloverFeePerCollateral: string;
  lastAccrueTimestamp: number;

  orders: TableHandle;
  longPositions: TableHandle;
  shortPositions: TableHandle;
};

export namespace RawPairStateResponse {
  export function to(raw: RawPairStateResponse): PairState {
    return {
      ...raw,
      timestamp: new Date(raw.timestamp),

      longOpenInterest: dec(BigInt(raw.longOpenInterest)),
      shortOpenInterest: dec(BigInt(raw.shortOpenInterest)),
      fundingRate: dec(BigInt(raw.fundingRate)),
      accFundingFeePerSize: dec(BigInt(raw.accFundingFeePerSize)),
      accRolloverFeePerCollateral: dec(BigInt(raw.accRolloverFeePerCollateral)),
    };
  }
}

export type RawTradeHistory = {
  version: number;
  type: MoveStructId;
  orderId: string;
  uid: string;

  address: Hex;
  eventType: PositionEvent.EventType;
  pairType: MoveStructId;
  collateralType: MoveStructId;

  isLong: boolean;
  leverage: string;
  price: string;
  originalSize: string;
  sizeDelta: string;
  originalCollateral: string;
  collateralDelta: string;
  isIncrease: boolean;

  pnlWithoutFee: string;
  entryExitFee: string;
  fundingFee: string;
  rolloverFee: string;

  longOpenInterest: string;
  shortOpenInterest: string;

  ts: string;
};

export namespace RawTradeHistory {
  export function to(raw: RawTradeHistory): TradeHistory {
    return {
      ...raw,
      version: +raw.version,
      orderId: +raw.orderId,
      uid: +raw.uid,
      ts: new Date(raw.ts),
    };
  }
}

export type TradeHistory = Omit<
  RawTradeHistory,
  "version" | "orderId" | "uid" | "ts"
> & {
  version: number;
  orderId: number;
  uid: number;
  ts: Date;
};

export type RawPosition = {
  version: number;
  timestamp: string;

  pairType: MoveStructId;
  collateralType: MoveStructId;
  isLong: boolean;
  user: Hex;

  uid: number;
  size: string;
  collateral: string;
  avgPrice: string;
  lastExecuteTimestamp: number;
  accRolloverFeePerCollateral: string;
  accFundingFeePerSize: string;
  stopLossTriggerPrice: string;
  takeProfitTriggerPrice: string;
};

export namespace RawPosition {
  export function to(raw: RawPosition): Position {
    return {
      ...raw,
      timestamp: new Date(raw.timestamp),

      size: dec(BigInt(raw.size)),
      collateral: dec(BigInt(raw.collateral)),
      avgPrice: dec(BigInt(raw.avgPrice)),
      accRolloverFeePerCollateral: dec(BigInt(raw.accRolloverFeePerCollateral)),
      accFundingFeePerSize: dec(BigInt(raw.accFundingFeePerSize)),
      stopLossTriggerPrice: dec(BigInt(raw.stopLossTriggerPrice)),
      takeProfitTriggerPrice: dec(BigInt(raw.takeProfitTriggerPrice)),
    };
  }
}

export type RawOrder = {
  version: number;
  timestamp: string;

  pairType: MoveStructId;
  collateralType: MoveStructId;
  orderId: number;

  /** @deprecated */
  uid: number;
  user: Hex;
  sizeDelta: string;
  collateralDelta: string;
  price: string;
  isLong: boolean;
  isIncrease: boolean;
  isMarket: boolean;
  canExecuteAbovePrice: boolean;
  stopLossTriggerPrice: string;
  takeProfitTriggerPrice: string;
  createdTimestamp: number;
};

export namespace RawOrder {
  export function to(raw: RawOrder): Order {
    return {
      ...raw,
      timestamp: new Date(raw.timestamp),

      sizeDelta: dec(BigInt(raw.sizeDelta)),
      collateralDelta: dec(BigInt(raw.collateralDelta)),
      price: dec(BigInt(raw.price)),

      stopLossTriggerPrice: dec(BigInt(raw.stopLossTriggerPrice)),
      takeProfitTriggerPrice: dec(BigInt(raw.takeProfitTriggerPrice)),
    };
  }
}
