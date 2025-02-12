import type { Decimal } from "@/utils/decimal";

export type Hex = `0x${string}`;

export type MoveStructId = `0x${string}::${string}::${string}`;

export type TableHandle = { handle: Hex };

export type SimpleMap<K extends string, V> = Partial<{ [k in K]: V }>;

export type Coin<N = unknown> = { value: Decimal<N> };

export namespace AptosObject {
  export type TransferRef = { self: Hex };
  export type ExtendRef = { self: Hex };
  export type DeleteRef = { self: Hex };
}

export namespace Token {
  export type MutatorRef = { self: Hex };
  export type BurnRef = { inner: { vec: { self: Hex }[] }; self: { vec: [] } };
}

export namespace Royalty {
  export type MutatorRef = { inner: { self: Hex } };
}

export namespace Account {
  export type SignerCapability = { account: Hex };
}

export namespace Collection {
  export type MutatorRef = { self: Hex };
}

export * from "./trading";
export * from "./api";
