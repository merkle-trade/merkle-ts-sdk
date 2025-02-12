import type {
  CancelOrderEvent,
  PlaceOrderEvent,
  PositionEvent,
} from "@/types/trading";

export type PriceFeed = { pair: string; price: string; ts: number };

export type AccountFeed = (
  | PositionEvent
  | CancelOrderEvent
  | PlaceOrderEvent
) & {
  eventKey: "PlaceOrderEvent" | "CancelOrderEvent" | "PositionEvent";
};
