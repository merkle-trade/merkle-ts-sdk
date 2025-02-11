import type {
  CancelOrderEvent,
  PlaceOrderEvent,
  PositionEvent,
} from "@/types/trading";

export type PriceFeed = {
  type: "sub";
  key: string;
  data: { pair: string; price: string; ts: string };
};

export type AccountFeed = {
  type: "sub";
  key: string;
  data: AccountFeedData;
};

export type AccountFeedData = (
  | PositionEvent
  | CancelOrderEvent
  | PlaceOrderEvent
) & {
  eventKey: "PlaceOrderEvent" | "CancelOrderEvent" | "PositionEvent";
};
