import {
  AccountAddress,
  type AccountAddressInput,
  type EntryFunctionABI,
  type InputEntryFunctionData,
  type MoveFunction,
  type TypeTag,
  findFirstNonSignerArg,
  parseTypeTag,
} from "@aptos-labs/ts-sdk";

import { calcSlippagePrice } from "@/calc/trading-utils";
import type { Decimals, Hex } from "@/types";
import type { Summary } from "@/types/api";
import { raise } from "@/utils";
import * as decimals from "@/utils/decimal";

export const PRICE_MAX = (2n ** 64n - 1n) as Decimals.Price;
export const PRICE_MIN = 1n as Decimals.Price;

export function placeMarketOrder(args: {
  summary: Summary;
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
  const price = args.slippage
    ? calcSlippagePrice(
        args.slippage.markPrice as Decimals.Price,
        args.isIncrease,
        args.isLong,
        decimals.dec<4>(args.slippage.slippageBps),
      )
    : undefined;
  return placeOrderV3({ ...args, price, isMarket: true });
}

export function placeLimitOrder(args: {
  summary: Summary;
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
  return placeOrderV3({ ...args, isMarket: false });
}

function placeOrderV3(args: {
  summary: Summary;
  /** pair id or pair type */
  pair: string;
  collateralType?: string;
  userAddress: AccountAddressInput;
  sizeDelta: bigint;
  collateralDelta: bigint;
  /** if not provided, order will be market order without slippage */
  price?: bigint;
  isLong: boolean;
  isIncrease: boolean;
  isMarket: boolean;
  stopLossTriggerPrice?: bigint;
  takeProfitTriggerPrice?: bigint;
  canExecuteAbovePrice?: boolean;
  referrer?: AccountAddressInput;
}) {
  const merkleContract = args.summary.hostAddress;
  const pairType = resolvePairType(args.pair, merkleContract);
  const collateralType = usdcCollateralType(args.summary);

  return {
    function: `${merkleContract}::managed_trading::place_order_v3`,
    typeArguments: [pairType, collateralType],
    functionArguments: [
      args.userAddress,
      args.sizeDelta,
      args.collateralDelta,
      args.price ?? (args.isLong ? PRICE_MAX : PRICE_MIN),
      args.isLong,
      args.isIncrease,
      args.isMarket,
      args.stopLossTriggerPrice ?? (args.isLong ? PRICE_MIN : PRICE_MAX),
      args.takeProfitTriggerPrice ?? (args.isLong ? PRICE_MAX : PRICE_MIN),
      args.canExecuteAbovePrice ?? !args.isLong,
      args.referrer ?? AccountAddress.ZERO,
    ],
    abi: parseAbi({
      generic_type_params: [{ constraints: [] }, { constraints: [] }],
      params: [
        "&signer",
        "address",
        "u64",
        "u64",
        "u64",
        "bool",
        "bool",
        "bool",
        "u64",
        "u64",
        "bool",
        "address",
      ],
    }),
  } satisfies InputEntryFunctionData;
}

export function cancelOrder(args: {
  summary: Summary;
  /** pair id or pair type */
  pair: string;
  userAddress: Hex;
  orderId: bigint;
}) {
  const merkleContract = args.summary.hostAddress;
  const pairType = resolvePairType(args.pair, merkleContract);
  const collateralType = usdcCollateralType(args.summary);

  return {
    function: `${merkleContract}::managed_trading::cancel_order_v3`,
    typeArguments: [pairType, collateralType],
    functionArguments: [args.userAddress, args.orderId],
    abi: parseAbi({
      generic_type_params: [{ constraints: [] }, { constraints: [] }],
      params: ["&signer", "address", "u64"],
    }),
  } satisfies InputEntryFunctionData;
}

export function updateTPSL(args: {
  summary: Summary;
  /** pair id or pair type */
  pair: string;
  userAddress: AccountAddressInput;
  isLong: boolean;
  stopLossTriggerPrice: bigint;
  takeProfitTriggerPrice: bigint;
}) {
  const merkleContract = args.summary.hostAddress;
  const pairType = resolvePairType(args.pair, merkleContract);
  const collateralType = usdcCollateralType(args.summary);

  return {
    function: `${merkleContract}::managed_trading::update_tpsl_v3`,
    typeArguments: [pairType, collateralType],
    functionArguments: [
      args.userAddress,
      args.isLong,
      args.stopLossTriggerPrice,
      args.takeProfitTriggerPrice,
    ],
    abi: parseAbi({
      generic_type_params: [{ constraints: [] }, { constraints: [] }],
      params: ["&signer", "address", "bool", "u64", "u64"],
    }),
  } satisfies InputEntryFunctionData;
}

export function testnetFaucetUSDC(args: { summary: Summary; amount: bigint }) {
  const merkleContract = args.summary.hostAddress;
  return {
    function: `${merkleContract}::test_trading::faucet_native_usdc`,
    functionArguments: [args.amount],
  } satisfies InputEntryFunctionData;
}

function resolvePairType(pairIdOrType: string, merkleContract: string) {
  if (pairIdOrType.includes("::")) return pairIdOrType;
  return `${merkleContract}::pair_types::${pairIdOrType}`;
}

function usdcCollateralType(summary: Summary) {
  return summary.coins.find((coin) => coin.id === "usdc")?.coinType ?? raise();
}

type FunctionAbi = Pick<MoveFunction, "generic_type_params" | "params">;

const parseAbi = (functionAbi: FunctionAbi) => {
  const numSigners = findFirstNonSignerArg(functionAbi as MoveFunction);
  const params: TypeTag[] = functionAbi.params
    .slice(numSigners)
    .map((param) => parseTypeTag(param, { allowGenerics: true }));
  const entryFunctionAbi: EntryFunctionABI = {
    typeParameters: functionAbi.generic_type_params,
    parameters: params,
    signers: numSigners,
  };
  return entryFunctionAbi;
};
