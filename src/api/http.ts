import type { MerkleConfig } from "@/config";
import type { Hex } from "@/types";
import {
  type FeepayerResponse,
  RawOrder,
  RawPairInfoResponse,
  RawPairStateResponse,
  RawPosition,
  RawTradeHistory,
  type Summary,
  type TradeHistory,
} from "@/types/api";
import { RawSummaryResponse } from "@/types/api";
import type { Order, PairInfo, PairState, Position } from "@/types/trading";
import { version as VERSION } from "package.json";

/**
 * @description Get summary
 * @returns Summary
 */
export async function getSummary(args: {
  merkleConfig: MerkleConfig;
}): Promise<Summary> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<RawSummaryResponse>(
    `${baseURL}/v1/summary`,
    fetchFn,
  );
  return RawSummaryResponse.to(response);
}

/**
 * @description Get pair info
 * @param pairId - Pair ID example: `BTC_USD`
 * @returns Pair info
 */
export async function getPairInfo(args: {
  merkleConfig: MerkleConfig;
  pairId: string;
}): Promise<PairInfo> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<RawPairInfoResponse>(
    `${baseURL}/v1/indexer/trading/pairinfo/${args.pairId}`,
    fetchFn,
  );
  return RawPairInfoResponse.to(response);
}

/**
 * @description Get all pair info
 * @returns All pair info
 */
export async function getAllPairInfos(args: {
  merkleConfig: MerkleConfig;
}): Promise<PairInfo[]> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<RawPairInfoResponse[]>(
    `${baseURL}/v1/indexer/trading/pairinfo`,
    fetchFn,
  );
  return response.map(RawPairInfoResponse.to);
}

/**
 * @description Get pair state
 * @param pairId - Pair ID example: `BTC_USD`
 * @returns Pair state
 */
export async function getPairState(args: {
  merkleConfig: MerkleConfig;
  pairId: string;
}): Promise<PairState> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<RawPairStateResponse>(
    `${baseURL}/v1/indexer/trading/pairstate/${args.pairId}`,
    fetchFn,
  );
  return RawPairStateResponse.to(response);
}

/**
 * @description Get all pair state
 * @returns All pair state
 */
export async function getAllPairStates(args: {
  merkleConfig: MerkleConfig;
}): Promise<PairState[]> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<RawPairStateResponse[]>(
    `${baseURL}/v1/indexer/trading/pairstate`,
    fetchFn,
  );
  return response.map(RawPairStateResponse.to);
}

/**
 * @description Get orders
 * @param address - Address
 * @returns Orders
 */
export async function getOrders(args: {
  merkleConfig: MerkleConfig;
  address: Hex;
}): Promise<Order[]> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<RawOrder[]>(
    `${baseURL}/v1/indexer/trading/order/${args.address}`,
    fetchFn,
  );
  return response.map(RawOrder.to);
}

/**
 * @description Get positions
 * @param address - Address
 * @returns Positions
 */
export async function getPositions(args: {
  merkleConfig: MerkleConfig;
  address: Hex;
}): Promise<Position[]> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<RawPosition[]>(
    `${baseURL}/v1/indexer/trading/position/${args.address}`,
    fetchFn,
  );
  return response.map(RawPosition.to);
}

/**
 * @description Get trading history
 * @param address - Address
 * @returns Trading history
 */
export async function getTradingHistory(args: {
  merkleConfig: MerkleConfig;
  address: Hex;
}): Promise<TradeHistory[]> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await get<{ items: RawTradeHistory[] }>(
    `${baseURL}/v1/trade/${args.address}`,
    fetchFn,
  );
  return response.items.map(RawTradeHistory.to);
}

/**
 * @description Post feepayer
 * @param txHex - Transaction
 * @param senderAuthenticator - Sender authenticator
 * @returns Feepayer response
 */
export async function postFeepayer(args: {
  merkleConfig: MerkleConfig;
  txHex: string;
  senderAuthenticator: string;
}): Promise<FeepayerResponse> {
  const { fetchFn, baseURL } = args.merkleConfig;
  const response = await post<FeepayerResponse>(
    `${baseURL}/v1/feepayer/sendTransaction`,
    { tx: args.txHex, senderAuthenticator: args.senderAuthenticator },
    fetchFn,
  );
  return response;
}

const get = async <T>(
  url: string,
  fetchFn?: typeof fetch,
  options?: RequestInit,
): Promise<T> => fetchAPI(fetchFn ?? fetch, "GET", url, undefined, options);

const post = async <T>(
  url: string,
  body: Record<string, unknown>,
  fetchFn?: typeof fetch,
  options?: RequestInit,
): Promise<T> =>
  fetchAPI(fetchFn ?? fetch, "POST", url, body, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });

const fetchAPI = async <T>(
  fetchFn: typeof fetch,
  method: "GET" | "POST",
  url: string,
  body?: Record<string, unknown>,
  options?: RequestInit,
): Promise<T> => {
  const headers = {
    "Content-Type": "application/json",
    "x-merkle-client": `merkle-ts-sdk@${VERSION}`,
    ...options?.headers,
  };
  const response = await fetchFn(url, {
    ...options,
    headers,
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }
  const data = (await response.json()) as T;
  return data;
};
