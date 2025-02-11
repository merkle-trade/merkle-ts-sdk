import {
  AccountAddress,
  type AccountAddressInput,
  Aptos,
  type AptosConfig,
} from "@aptos-labs/ts-sdk";

import type { Decimals } from "@/types";
import type { Summary } from "@/types/api";
import { raise } from "@/utils";
import * as decimals from "@/utils/decimal";

export async function getUsdcBalance(args: {
  aptosConfig: AptosConfig;
  summary: Summary;
  accountAddress: AccountAddressInput;
}): Promise<Decimals.Collateral> {
  const aptos = new Aptos(args.aptosConfig);
  const usdc = args.summary.coins.find((coin) => coin.id === "usdc") ?? raise();

  const balances = await aptos.getCurrentFungibleAssetBalances({
    options: {
      where: {
        owner_address: {
          _eq: AccountAddress.from(args.accountAddress).toStringLong(),
        },
        asset_type: { _eq: usdc.assetType },
      },
    },
  });

  if (balances.length === 0) return decimals.dec<6>(0n);
  return decimals.dec<6>(BigInt(balances[0].amount));
}
