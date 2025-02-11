import type * as tsa from "ts-arithmetic";
import type * as tf from "type-fest";

declare const __decimal: unique symbol;

export type Decimal<N extends Range | unknown> = bigint & {
  readonly [__decimal]: N;
};

export namespace Decimal {
  export type Of<T> = T extends Decimal<infer N> ? N : unknown;
}

type Range = tf.IntRange<0, 50>;

namespace Range {
  export type UnsafeAdd<A, B> = A extends number
    ? B extends number
      ? tf.Sum<A, B> extends Range
        ? tf.Sum<A, B>
        : unknown
      : unknown
    : unknown;

  export type UnsafeSub<A, B> = A extends number
    ? B extends number
      ? tf.Sum<A, tsa.Negate<B>> extends Range
        ? tf.Sum<A, tsa.Negate<B>>
        : unknown
      : unknown
    : unknown;
}

/** operations */

export function dec<N extends Range>(n: bigint): Decimal<N> {
  return n as Decimal<N>;
}

/** equivalent to `dec<0>` */
export function dec0(n: bigint): Decimal<0> {
  return n as Decimal<0>;
}

export function undec<N extends Range>(n: Decimal<N>): bigint {
  return n as bigint;
}

export function one<N extends Range>(
  decimals: N,
  isPositive?: boolean,
): Decimal<N> {
  const one0 = dec0(isPositive === undefined || isPositive ? 1n : -1n);
  return shift(one0, decimals) as Decimal<N>;
}

export function zero<N extends Range>() {
  return 0n as Decimal<N>;
}

export function sign<N extends Range>(n: Decimal<N>) {
  return (n > 0n ? 1n : -1n) as Decimal<N>;
}

export function neg<N extends Range>(n: Decimal<N>) {
  return -n as Decimal<N>;
}

export function shift<
  N extends Range,
  const S extends Range | tsa.Negate<Range>,
>(n: Decimal<N>, shiftBy: S) {
  if (shiftBy === 0) return n as Decimal<Range.UnsafeAdd<N, S>>;
  if (shiftBy > 0) {
    return (n * 10n ** BigInt(shiftBy)) as Decimal<Range.UnsafeAdd<N, S>>;
  }
  return (n / 10n ** BigInt(-shiftBy)) as Decimal<Range.UnsafeAdd<N, S>>;
}

export function add<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return (a + b) as Decimal<N>;
}

export function sub<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return (a - b) as Decimal<N>;
}

export function mul<A extends Range, B extends Range>(
  a: Decimal<A>,
  b: Decimal<B>,
): Decimal<Range.UnsafeAdd<A, B>> {
  return (a * b) as Decimal<Range.UnsafeAdd<A, B>>;
}

export function div<A extends Range, B extends Range>(
  a: Decimal<A>,
  b: Decimal<B>,
): Decimal<Range.UnsafeSub<A, B>> {
  return (a / b) as Decimal<Range.UnsafeSub<A, B>>;
}

export function gt<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return a > b;
}

export function gte<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return a >= b;
}

export function lt<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return a < b;
}

export function lte<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return a <= b;
}

export function min<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return a < b ? a : b;
}

export function max<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return a > b ? a : b;
}

export function abs<N extends Range>(n: Decimal<N>) {
  return (n < 0n ? -n : n) as Decimal<N>;
}

export function avg<N extends Range>(a: Decimal<N>, b: Decimal<NoInfer<N>>) {
  return div(add(a, b), dec(2n)) as Decimal<N>;
}

export function fromNumber<N extends Range>(n: number, decimals: N) {
  return BigInt(Math.floor(n * 10 ** decimals)) as Decimal<N>;
}

export function toNumber<N extends Range>(
  n: Decimal<N>,
  decimals: NoInfer<N>,
): number;
export function toNumber<N>(
  n: Decimal<N extends Range ? `decimals must be ${N}` : N>, // disallow Range (only for unknown)
  decimals: number,
): number;
export function toNumber<N extends Range>(n: Decimal<N>, decimals: NoInfer<N>) {
  return Number(n) / 10 ** decimals;
}

export function toFixed<N extends Range>(
  n: Decimal<N>,
  decimals: NoInfer<N>,
): string;
export function toFixed<N>(
  n: Decimal<N extends Range ? `decimals must be ${N}` : N>, // disallow Range (only for unknown)
  decimals: number,
): string;
export function toFixed(n: Decimal<Range | unknown>, decimals: number) {
  if (decimals === 0) return n.toString();
  const one = 10n ** BigInt(decimals);
  const absN = n < 0n ? -n : n;
  const sign = n < 0n ? "-" : "";
  const integer = (absN / one).toString();
  const fractional = (absN % one).toString().padStart(decimals, "0");
  return `${sign}${integer}.${fractional}`;
}
