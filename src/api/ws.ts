import type { Hex } from "@/types";
import type { AccountFeed, PriceFeed } from "@/types/api/wsapi";

export type WSAPISessionConfig = {
  wsURL: string;
  WebSocketCtor?: new (
    url: string | URL,
    protocols?: string | string[],
  ) => WebSocket;
};

type SubscriptionController = Pick<
  ReadableStreamDefaultController,
  "enqueue" | "error"
>;

export class WSAPISession {
  private ws: WebSocket;
  private openPromise: Promise<void>;
  private subscriptions: { [key: string]: SubscriptionController[] };

  constructor(config: WSAPISessionConfig) {
    const WebSocketCtor = config.WebSocketCtor ?? WebSocket;
    this.ws = new WebSocketCtor(config.wsURL);
    this.openPromise = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve());
      this.ws.addEventListener("close", (e) =>
        reject(new Error(`WebSocket closed: ${e.reason}`)),
      );
    });
    this.ws.addEventListener("message", (e) => this.handleMessage(e));
    this.ws.addEventListener("close", (e) => this.handleClose(e));
    this.subscriptions = {};
  }

  async connect() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return this.openPromise;
  }

  disconnect() {
    this.ws.close();
  }

  private handleMessage(e: MessageEvent) {
    const data = JSON.parse(e.data) as {
      type: string;
      key: string;
      data: any;
    };
    const key = data.key;
    const controllers = (this.subscriptions[key] ??= []);
    for (const controller of controllers) {
      controller.enqueue(data.data);
    }
  }

  private handleClose(e: CloseEvent) {
    const controllers = Object.values(this.subscriptions).flat();
    for (const controller of controllers) {
      controller.error(new Error(`WebSocket closed: ${e.reason}`));
    }
    this.subscriptions = {};
  }

  subscribePriceFeed(pairId: string): AsyncIterable<PriceFeed> {
    return this.subscribe<PriceFeed>(`price:${pairId}`);
  }

  subscribeAccountFeed(account: Hex): AsyncIterable<AccountFeed> {
    return this.subscribe<AccountFeed>(`account:${account}:events`);
  }

  subscribe<T>(key: string): AsyncIterable<T> {
    const t = this;

    let ctlr: ReadableStreamDefaultController<T> | undefined;

    const stream = new ReadableStream({
      async start(controller) {
        ctlr = controller;
        t.ws.send(JSON.stringify({ type: "sub", key }));
        (t.subscriptions[key] ??= []).push(controller);
      },
      async cancel() {
        if (!ctlr) return;
        const controllers = t.subscriptions[key] ?? [];
        t.subscriptions[key] = controllers.filter((c) => c !== ctlr);
        if (controllers.length === 0) {
          t.ws.send(JSON.stringify({ type: "unsub", key }));
        }
        ctlr.close();
      },
    });
    return stream;
  }
}
