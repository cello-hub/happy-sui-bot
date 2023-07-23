export const coins = {
  SUI: '0x2::sui::SUI',
  USDC: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
  CETUS:
    '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
  CETUS0:
    '0x6864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS',
  BRT: '0x5580c843b6290acb2dbc7d5bf8ab995d4d4b6ba107e2a283b4d481aab1564d68::brt::BRT',
  WETH: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN',
  TOCE: '0xd2013e206f7983f06132d5b61f7c577638ff63171221f4f600a98863febdfb47::toce::TOCE',
  USDT: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
  WBTC: '0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881::coin::COIN'
}

const defaultAmount: Record<string, number> = {}
defaultAmount[coins.SUI] = 1_000_000_000
defaultAmount[coins.USDC] = 1_000_000
defaultAmount[coins.CETUS] = 15_000_000_000
defaultAmount[coins.CETUS0] = 15_000_000_000
defaultAmount[coins.BRT] = 150_000_000_000_000
defaultAmount[coins.WETH] = 100_000
defaultAmount[coins.TOCE] = 100_000_000_000
defaultAmount[coins.USDT] = 1_000_000
defaultAmount[coins.WBTC] = 3_000

export { defaultAmount }

// A conservative upper limit on the max gas price per transaction block in SUI
export const MAX_GAS_PRICE_PER_TRANSACTION = 4_400_000
