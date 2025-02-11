import type { Simplify } from "type-fest";

import type { Hex, MoveStructId, TableHandle } from "@/types";
import type { Decimal } from "@/utils/decimal";

export namespace Decimals {
  export const COLLATERAL = 6;
  export const PRICE = 10;
  export const BPS = 4;
  export const PRECISION = 6;
  export const FUNDING_PRECISION = 8;

  export type Collateral = Decimal<typeof Decimals.COLLATERAL>;
  export type Price = Decimal<typeof Decimals.PRICE>;
  export type Bps = Decimal<typeof Decimals.BPS>;
  export type Precision = Decimal<typeof Decimals.PRECISION>;
  export type FundingPrecision = Decimal<typeof Decimals.FUNDING_PRECISION>;

  export type APT = Decimal<8>;
}

export type Order = {
  version: number;
  timestamp: Date;

  pairType: MoveStructId;
  collateralType: MoveStructId;
  orderId: number;

  /** @deprecated */ uid: number;
  user: Hex;
  sizeDelta: Decimals.Collateral;
  collateralDelta: Decimals.Collateral;
  price: Decimals.Price;
  isLong: boolean;
  isIncrease: boolean;
  isMarket: boolean;
  canExecuteAbovePrice: boolean;
  stopLossTriggerPrice: Decimals.Price;
  takeProfitTriggerPrice: Decimals.Price;
  createdTimestamp: number;
};

export type Position = {
  version: number;
  timestamp: Date;

  pairType: MoveStructId;
  collateralType: MoveStructId;
  isLong: boolean;
  user: Hex;

  uid: number;
  size: Decimals.Collateral;
  collateral: Decimals.Collateral;
  avgPrice: Decimals.Price;
  lastExecuteTimestamp: number;
  accRolloverFeePerCollateral: Decimals.FundingPrecision;
  /** cumulative funding rate per size */
  accFundingFeePerSize: Decimals.FundingPrecision;
  stopLossTriggerPrice: Decimals.Price;
  takeProfitTriggerPrice: Decimals.Price;
};

export type PairInfo = Simplify<
  { version: number; timestamp: Date } & PairInfo.V1 & PairInfo.V2
>;

export namespace PairInfo {
  export type V1 = {
    versionV1: number;
    timestampV1: Date;

    pairType: MoveStructId;
    collateralType: MoveStructId;

    paused: boolean;
    minLeverage: Decimals.Precision;
    maxLeverage: Decimals.Precision;
    makerFee: Decimals.Collateral;
    takerFee: Decimals.Collateral;
    rolloverFeePerTimestamp: Decimals.FundingPrecision;
    skewFactor: Decimals.Collateral;
    maxFundingVelocity: Decimals.FundingPrecision;
    maxOpenInterest: Decimals.Collateral;
    executeTimeLimit: number;
    liquidateThreshold: Decimals.Bps;
    maximumProfit: Decimals.Bps;
    minimumOrderCollateral: Decimals.Collateral;
    minimumPositionCollateral: Decimals.Collateral;
    minimumPositionSize: Decimals.Collateral;
    maximumPositionCollateral: Decimals.Collateral;
    executionFee: Decimals.APT;
  };

  export type V2 = {
    versionV2: number;
    timestampV2: Date;

    pairType: MoveStructId;
    collateralType: MoveStructId;

    maximumSkewLimit: Decimals.Collateral;
    cooldownPeriodSecond: number;
  };

  export const mergeVersions = (v1: V1, v2: V2): PairInfo => ({
    version: Math.max(v1.versionV1, v2.versionV2),
    timestamp: new Date(
      Math.max(v1.timestampV1.getTime(), v2.timestampV2.getTime()),
    ),
    ...v1,
    ...v2,
  });
}

export type PairState = {
  version: number;
  timestamp: Date;

  pairType: MoveStructId;
  collateralType: MoveStructId;

  nextOrderId: number;
  longOpenInterest: Decimals.Collateral;
  shortOpenInterest: Decimals.Collateral;
  fundingRate: Decimals.FundingPrecision;
  accFundingFeePerSize: Decimals.FundingPrecision;
  accRolloverFeePerCollateral: Decimals.FundingPrecision;
  lastAccrueTimestamp: number;

  // table handles
  orders: TableHandle;
  longPositions: TableHandle;
  shortPositions: TableHandle;
};

export type PlaceOrderEvent = {
  version: number;
  timestamp: Date;
  eventIndex: number;

  /** @deprecated always 0 */ uid: number;
  pairType: MoveStructId;
  collateralType: MoveStructId;
  user: Hex;
  orderId: number;
  sizeDelta: Decimals.Collateral;
  collateralDelta: Decimals.Collateral;
  price: Decimals.Price;
  isLong: boolean;
  isIncrease: boolean;
  isMarket: boolean;
};

export type CancelOrderEvent = {
  version: number;
  timestamp: Date;
  eventIndex: number;

  uid: number;
  eventType: CancelOrderEvent.EventType;
  pairType: MoveStructId;
  collateralType: MoveStructId;
  user: Hex;
  orderId: number;
  sizeDelta: Decimals.Collateral;
  collateralDelta: Decimals.Collateral;
  price: Decimals.Price;
  isLong: boolean;
  isIncrease: boolean;
  isMarket: boolean;
};

export namespace CancelOrderEvent {
  export const eventTypes = [
    "cancel_order_by_user",
    "cancel_order_max_leverage",
    "cancel_order_under_min_leverage",
    "cancel_order_unexecutable_market_order",
    "cancel_order_not_enough_collateral",
    "cancel_order_not_enough_size",
    "cancel_order_expired",
    "cancel_order_over_max_interest",
    "cancel_order_over_max_collateral",
    "cancel_order_over_max_skew_limit",
  ] as const;
  export type EventType = (typeof eventTypes)[number];
}

export type PositionEvent = {
  version: number;
  timestamp: Date;
  eventIndex: number;

  uid: number;
  eventType: PositionEvent.EventType;
  pairType: MoveStructId;
  collateralType: MoveStructId;
  user: Hex;
  orderId: number;
  isLong: boolean;
  price: Decimals.Price;
  originalSize: Decimals.Collateral;
  sizeDelta: Decimals.Collateral;
  originalCollateral: Decimals.Collateral;
  collateralDelta: Decimals.Collateral;
  isIncrease: boolean;
  isPartial: boolean;
  pnlWithoutFee: Decimals.Collateral;
  isProfit: boolean;
  entryExitFee: Decimals.Collateral;
  fundingFee: Decimals.Collateral;
  rolloverFee: Decimals.Collateral;
  longOpenInterest: Decimals.Collateral;
  shortOpenInterest: Decimals.Collateral;
};

export namespace PositionEvent {
  export const eventTypes = [
    "position_open",
    "position_update",
    "position_close",
    "position_liquidate",
    "position_take_profit",
    "position_stop_loss",
  ];
  export type EventType = (typeof eventTypes)[number];
}

export type UpdateTPSLEvent = {
  version: number;
  timestamp: Date;
  eventIndex: number;

  uid: number;
  pairType: MoveStructId;
  collateralType: MoveStructId;
  user: Hex;
  isLong: boolean;
  takeProfitTriggerPrice: Decimals.Price;
  stopLossTriggerPrice: Decimals.Price;
};
