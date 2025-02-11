import {
  Decimals,
  type Order,
  type PairInfo,
  type PairState,
  type Position,
} from "@/types/trading";
import {
  type Decimal,
  abs,
  add,
  avg,
  dec,
  dec0,
  div,
  min,
  mul,
  neg,
  one,
  sign,
  sub,
} from "@/utils/decimal";

const DAY_SECONDS = 86400n as Decimal<0>;

export const PRECISION = one(Decimals.PRECISION);
const FUNDING_PRECISION = one(Decimals.FUNDING_PRECISION);
const FUNDING_PADDING_PRECISION = one(11);

export type Timestamp = bigint | Decimal<0>;

//////////////////////////////////////////////////////
// Contract calc functions (trading-calc.move)
//////////////////////////////////////////////////////

/** Calculates new `avgPrice` for increased position */
export const calcNewPrice = ({
  position: { avgPrice, size },
  increaseOrder: { sizeDelta },
  price,
}: {
  position: Pick<Position, "avgPrice" | "size">;
  increaseOrder: Pick<Order, "sizeDelta">;
  price: Decimals.Price;
}): Decimals.Price => {
  if (size === 0n) return price;
  if (sizeDelta === 0n) return avgPrice;
  const padding = one(18);
  const newPrice = div(
    mul(add(size, sizeDelta), padding),
    add(div(mul(size, padding), avgPrice), div(mul(sizeDelta, padding), price)),
  );
  return newPrice;
};

export const calcPnlWithoutFee = ({
  position: { avgPrice, isLong },
  executePrice,
  decreaseOrder: { sizeDelta },
}: {
  position: Pick<Position, "avgPrice" | "isLong">;
  executePrice: Decimals.Price;
  decreaseOrder: Pick<Order, "sizeDelta">;
}): Decimals.Collateral => {
  if (avgPrice === executePrice) return dec(0n);
  const priceGap = sub(executePrice, avgPrice);
  const pnl = div(
    mul(div(mul(priceGap, PRECISION), avgPrice), sizeDelta),
    PRECISION,
  );
  return mul(pnl, one(0, isLong));
};

/**
 * Returns the estimated execute price for given order.
 * For current price, use `calcPriceInfo`
 * For price impact, use `calcPriceImpactInfo`
 **/
export const calcPriceImpact = ({
  pairInfo: { skewFactor },
  pairState: { longOpenInterest, shortOpenInterest },
  idxPrice,
  order: { sizeDelta, isLong, isIncrease } = {
    sizeDelta: dec(0n),
    isLong: true,
    isIncrease: true,
  },
}: {
  pairInfo: Pick<PairInfo, "skewFactor">;
  pairState: Pick<PairState, "longOpenInterest" | "shortOpenInterest">;
  idxPrice: Decimals.Price;
  order?: Pick<Order, "sizeDelta" | "isLong" | "isIncrease">;
}): Decimals.Price => {
  if (skewFactor === 0n) return idxPrice;

  const marketSkew = sub(longOpenInterest, shortOpenInterest);
  const price = add(idxPrice, div(mul(idxPrice, marketSkew), skewFactor));

  if (sizeDelta === 0n) return price;

  const newMarketSkew = add(
    marketSkew,
    mul(one(0, isLong === isIncrease), sizeDelta),
  );
  const newPrice = add(idxPrice, div(mul(idxPrice, newMarketSkew), skewFactor));

  const executePrice = avg(price, newPrice);
  return executePrice;
};

export const calcRolloverFee = ({
  position: { collateral, accRolloverFeePerCollateral: acc },
  currentAccRolloverFeePerCollateral: currentAcc,
}: {
  position: Pick<Position, "collateral" | "accRolloverFeePerCollateral">;
  currentAccRolloverFeePerCollateral: Decimals.FundingPrecision;
}): Decimals.Collateral =>
  div(mul(sub(currentAcc, acc), collateral), FUNDING_PRECISION);

export const calcFundingRate = ({
  pairInfo: { skewFactor, maxFundingVelocity },
  pairState: { longOpenInterest, shortOpenInterest, fundingRate },
  timeDeltaSec,
}: {
  pairInfo: Pick<PairInfo, "skewFactor" | "maxFundingVelocity">;
  pairState: Pick<
    PairState,
    "longOpenInterest" | "shortOpenInterest" | "fundingRate"
  >;
  timeDeltaSec: Timestamp;
}): Decimals.FundingPrecision => {
  const marketSkew = sub(longOpenInterest, shortOpenInterest);
  const skewRate = min(
    skewFactor === 0n
      ? (0n as typeof FUNDING_PADDING_PRECISION)
      : div(mul(marketSkew, FUNDING_PADDING_PRECISION), skewFactor),
    FUNDING_PADDING_PRECISION,
  );
  const velocity = div(
    mul(skewRate, maxFundingVelocity),
    FUNDING_PADDING_PRECISION,
  );
  const velocityTimeDelta = div(mul(velocity, dec0(timeDeltaSec)), DAY_SECONDS);
  const currentFundingRate = add(fundingRate, velocityTimeDelta);
  return currentFundingRate;
};

export const calcAccFundingFeePerSize = ({
  pairState: { fundingRate, accFundingFeePerSize },
  currentFundingRate,
  timeDeltaSec,
}: {
  pairState: Pick<PairState, "fundingRate" | "accFundingFeePerSize">;
  currentFundingRate: Decimals.FundingPrecision;
  timeDeltaSec: Timestamp;
}): Decimals.FundingPrecision => {
  const avgFundingRate = avg(fundingRate, currentFundingRate);
  const unrecordedFundingFeePerSize = div(
    mul(avgFundingRate, dec0(timeDeltaSec)),
    DAY_SECONDS,
  );
  const currentAccFundingFeePerSize = add(
    accFundingFeePerSize,
    unrecordedFundingFeePerSize,
  );
  return currentAccFundingFeePerSize;
};

/**
 * NOTE: positive funding fee means the user pays funding fee.
 * Different from contract `calc_funding_fee`, which returns the funding fee the user receives.
 */
export const calcFundingFee = ({
  position: { size, isLong, accFundingFeePerSize: acc },
  currentAccFundingFeePerSize: currentAcc,
}: {
  position: Pick<Position, "size" | "isLong" | "accFundingFeePerSize">;
  currentAccFundingFeePerSize: Decimals.FundingPrecision;
}): Decimals.Collateral => {
  const fundingFee = div(mul(size, sub(currentAcc, acc)), FUNDING_PRECISION);
  return isLong ? fundingFee : neg(fundingFee);
};

export const calcMakerTakerFee = ({
  pairInfo: { makerFee: makerRate, takerFee: takerRate },
  pairState: { longOpenInterest, shortOpenInterest },
  order: { sizeDelta, isLong, isIncrease },
}: {
  pairInfo: Pick<PairInfo, "makerFee" | "takerFee">;
  pairState: Pick<PairState, "longOpenInterest" | "shortOpenInterest">;
  order: Pick<Order, "sizeDelta" | "isLong" | "isIncrease">;
}): Decimals.Collateral => {
  const marketSkew = sub(longOpenInterest, shortOpenInterest);
  const nextMarketSkew = add(
    marketSkew,
    mul(one(0, isLong === isIncrease), sizeDelta),
  );
  if (sign(marketSkew) === sign(nextMarketSkew)) {
    const isTaker = (isLong === isIncrease) === marketSkew > 0n;
    return div(mul(sizeDelta, isTaker ? takerRate : makerRate), PRECISION);
  }

  const flippedTakerRate = div(
    mul(sub(sizeDelta, abs(marketSkew)), PRECISION),
    sizeDelta,
  );
  const flippedMakerRate = sub(PRECISION, flippedTakerRate);
  const takerFee = div(
    mul(div(mul(sizeDelta, flippedTakerRate), PRECISION), takerRate),
    PRECISION,
  );
  const makerFee = div(
    mul(div(mul(sizeDelta, flippedMakerRate), PRECISION), makerRate),
    PRECISION,
  );
  return add(takerFee, makerFee);
};
