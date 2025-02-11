import { PRICE_MAX, PRICE_MIN } from "@/aptos/payloads";
import {
  PRECISION,
  type Timestamp,
  calcAccFundingFeePerSize,
  calcFundingFee,
  calcFundingRate,
  calcMakerTakerFee,
  calcPnlWithoutFee,
  calcPriceImpact,
  calcRolloverFee,
} from "@/calc/trading";
import type {
  Decimals,
  Order,
  PairInfo,
  PairState,
  Position,
} from "@/types/trading";
import {
  add,
  dec,
  dec0,
  div,
  fromNumber,
  gte,
  lte,
  mul,
  one,
  sub,
} from "@/utils/decimal";

type PriceImpactInfo = {
  price: Decimals.Price;
  priceImpact: Decimals.Price;
  priceImpactRatio: Decimals.Precision;
};

export const calcPriceImpactInfo = ({
  pairInfo,
  pairState,
  idxPrice,
  order,
}: {
  pairInfo: Pick<PairInfo, "skewFactor">;
  pairState: Pick<PairState, "longOpenInterest" | "shortOpenInterest">;
  idxPrice: Decimals.Price;
  order?: Pick<Order, "sizeDelta" | "isLong" | "isIncrease">;
}): PriceImpactInfo => {
  const price = calcPriceImpact({ pairInfo, pairState, idxPrice, order });
  const priceImpact = sub(price, idxPrice);
  const priceImpactRatio =
    idxPrice > 0n ? div(mul(priceImpact, PRECISION), idxPrice) : dec<6>(0n);
  return { price, priceImpact, priceImpactRatio };
};

export type FundingInfo = {
  currentFundingRate: Decimals.FundingPrecision;
  currentAccFundingFeePerSize: Decimals.FundingPrecision;
};

export const calcFundingInfo = ({
  pairInfo,
  pairState,
  timestampSec,
}: {
  pairInfo: Pick<PairInfo, "skewFactor" | "maxFundingVelocity">;
  pairState: Pick<
    PairState,
    | "longOpenInterest"
    | "shortOpenInterest"
    | "fundingRate"
    | "accFundingFeePerSize"
    | "lastAccrueTimestamp"
  >;
  timestampSec: Timestamp;
}): FundingInfo => {
  const timeDeltaSec = sub(
    dec0(timestampSec),
    dec0(BigInt(pairState.lastAccrueTimestamp)),
  );
  const currentFundingRate = calcFundingRate({
    pairInfo,
    pairState,
    timeDeltaSec,
  });
  const currentAccFundingFeePerSize = calcAccFundingFeePerSize({
    pairState,
    currentFundingRate,
    timeDeltaSec,
  });
  return {
    currentFundingRate,
    currentAccFundingFeePerSize,
  } satisfies FundingInfo;
};

export const calcAccRolloverFeePerCollateral = ({
  pairInfo: { rolloverFeePerTimestamp },
  pairState: { lastAccrueTimestamp, accRolloverFeePerCollateral },
  timestampSec,
}: {
  pairInfo: Pick<PairInfo, "rolloverFeePerTimestamp">;
  pairState: Pick<
    PairState,
    "lastAccrueTimestamp" | "accRolloverFeePerCollateral"
  >;
  timestampSec: Timestamp;
}): Decimals.FundingPrecision => {
  const deltaSec = sub(dec0(timestampSec), dec0(BigInt(lastAccrueTimestamp)));
  const currentAccRolloverFeePerCollateral = add(
    accRolloverFeePerCollateral,
    mul(deltaSec, rolloverFeePerTimestamp),
  );
  return currentAccRolloverFeePerCollateral;
};

export const calcExitFee = ({
  pairInfo,
  pairState,
  position: { size, isLong },
}: {
  pairInfo: Pick<PairInfo, "makerFee" | "takerFee">;
  pairState: Pick<PairState, "longOpenInterest" | "shortOpenInterest">;
  position: Pick<Position, "size" | "isLong">;
}): Decimals.Collateral =>
  calcMakerTakerFee({
    pairInfo,
    pairState,
    order: { sizeDelta: size, isLong: isLong, isIncrease: false },
  });

type PositionFees = {
  total: Decimals.Collateral;
  exitFee: Decimals.Collateral;
  rolloverFee: Decimals.Collateral;
  fundingFee: Decimals.Collateral;
};
export const calcPositionFees = ({
  pairInfo,
  pairState,
  position,
  timestampSec,
}: {
  pairInfo: Pick<
    PairInfo,
    | "skewFactor"
    | "maxFundingVelocity"
    | "rolloverFeePerTimestamp"
    | "makerFee"
    | "takerFee"
  >;
  pairState: Pick<
    PairState,
    | "longOpenInterest"
    | "shortOpenInterest"
    | "fundingRate"
    | "accFundingFeePerSize"
    | "accRolloverFeePerCollateral"
    | "lastAccrueTimestamp"
  >;
  position: Pick<
    Position,
    | "size"
    | "collateral"
    | "isLong"
    | "avgPrice"
    | "accFundingFeePerSize"
    | "accRolloverFeePerCollateral"
  >;
  timestampSec: Timestamp;
}): PositionFees => {
  const currentAccRolloverFeePerCollateral = calcAccRolloverFeePerCollateral({
    pairInfo,
    pairState,
    timestampSec,
  });
  const rolloverFee = calcRolloverFee({
    position,
    currentAccRolloverFeePerCollateral,
  });

  const { currentAccFundingFeePerSize } = calcFundingInfo({
    pairInfo,
    pairState,
    timestampSec,
  });
  const fundingFee = calcFundingFee({ position, currentAccFundingFeePerSize });
  const exitFee = calcExitFee({ pairInfo, pairState, position });

  const total = add(exitFee, add(fundingFee, rolloverFee));

  return { total, exitFee, fundingFee, rolloverFee } satisfies PositionFees;
};

type PnlInfo = {
  pnl: Decimals.Collateral;
  pnlRate: Decimals.Collateral;
  pnlWithFee: Decimals.Collateral;
  pnlWithFeeRate: Decimals.Collateral;
};

export const calcPnlInfo = ({
  position: { size, collateral, isLong, avgPrice },
  feesTotal,
  executePrice,
}: {
  position: Pick<Position, "size" | "collateral" | "isLong" | "avgPrice">;
  feesTotal: Decimals.Collateral;
  executePrice: Decimals.Price;
}): PnlInfo => {
  const pnl = calcPnlWithoutFee({
    position: { avgPrice, isLong },
    decreaseOrder: { sizeDelta: size },
    executePrice,
  });
  const pnlRate = div(mul(pnl, PRECISION), collateral);
  const pnlWithFee = sub(pnl, feesTotal);
  const pnlWithFeeRate = div(mul(pnlWithFee, PRECISION), collateral);

  return { pnl, pnlRate, pnlWithFee, pnlWithFeeRate } satisfies PnlInfo;
};

export const calcEntryByPaySize = (
  pay: Decimals.Collateral,
  leverage: number,
  isLong: boolean,
  pairInfo: PairInfo,
  pairState: PairState,
): {
  collateral: Decimals.Collateral;
  size: Decimals.Collateral;
  fee: Decimals.Collateral;
} => {
  if (pay === 0n)
    return {
      collateral: dec<6>(0n),
      size: dec<6>(0n),
      fee: dec<6>(0n),
    };
  const estSizePay = mul(pay, fromNumber(leverage, 0));
  const estEntryFee = calcMakerTakerFee({
    pairInfo,
    pairState,
    order: {
      sizeDelta: estSizePay,
      isLong: isLong,
      isIncrease: true,
    },
  });
  const estCollateral = sub(pay, estEntryFee);
  const estSizeFromEstCollateral = mul(estCollateral, fromNumber(leverage, 0));
  const predEntryFee = calcMakerTakerFee({
    pairInfo,
    pairState,
    order: {
      sizeDelta: estSizeFromEstCollateral,
      isLong: isLong,
      isIncrease: true,
    },
  });
  const predCollateral = sub(pay, predEntryFee);
  const predSize = mul(predCollateral, fromNumber(leverage, 0));

  return {
    collateral: pay,
    size: predSize,
    fee: predEntryFee,
  };
};

/**
 * Calculate the slippage applied price for orders
 *
 * @param markPrice - The mark price
 * @param isIncrease - Whether the order is an increase order
 * @param isLong - Whether the position is long
 * @param slippageBps - The slippage in basis points
 * @returns The slippage price
 */
export const calcSlippagePrice = (
  markPrice: Decimals.Price,
  isIncrease: boolean,
  isLong: boolean,
  slippageBps: Decimals.Bps, // 10000 = 100%, 0.5% = 50
): Decimals.Price => {
  const signed = (isIncrease: boolean, isLong: boolean) =>
    isIncrease ? (isLong ? 1n : -1n) : isLong ? -1n : 1n;
  const slippageFactor = dec<4>(
    one(4) + signed(isIncrease, isLong) * slippageBps,
  );
  const adjustedPrice = mul(markPrice, slippageFactor);
  const orderPrice = div(adjustedPrice, one(4));

  if (lte(orderPrice, PRICE_MIN)) return PRICE_MIN;
  if (gte(orderPrice, PRICE_MAX)) return PRICE_MAX;

  return orderPrice;
};
