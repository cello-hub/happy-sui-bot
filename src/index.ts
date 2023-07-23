import { RideTheExternalTrend } from '@/strategies/ride_the_external_trend'
import { RideTheTrend } from '@/strategies/ride_the_trend'
import { TurbosPool } from '@/dexs/turbos/turbos'
import { coins, defaultAmount } from '@/constants'
import { CetusPool } from '@/dexs/cetus/cetus'
import { keypair } from '@/account'
import { HappyBot } from '@/happybot'
import { Arbitrage } from '@/strategies/arbitrage'
import { MarketDifference } from '@/strategies/market_difference'

const RIDE_THE_TREND_LIMIT = 1.000005
const ARBITRAGE_RELATIVE_LIMIT = 1.0001
const MARKET_DIFFERENCE_LIMIT = 1.01

const happyBot = new HappyBot(keypair)

const cetusUSDCtoSUI = new CetusPool(
  '0xcf994611fd4c48e277ce3ffd4d4364c914af2c3cbb05f7bf6facd371de688630',
  coins.USDC,
  coins.SUI
)
const cetusCETUStoSUI = new CetusPool(
  '0x2e041f3fd93646dcc877f783c1f2b7fa62d30271bdef1f21ef002cebf857bded',
  coins.CETUS,
  coins.SUI
)
const cetusUSDCtoCETUS = new CetusPool(
  '0x238f7e4648e62751de29c982cbf639b4225547c31db7bd866982d7d56fc2c7a8',
  coins.USDC,
  coins.CETUS
)

const turbosSUItoUSDC = new TurbosPool(
  '0x5eb2dfcdd1b15d2021328258f6d5ec081e9a0cdcfa9e13a0eaeb9b5f7505ca78',
  coins.SUI,
  coins.USDC,
  '0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1::fee3000bps::FEE3000BPS'
)
const cetusWBTCtoUSDC = new CetusPool(
  '0xaa57c66ba6ee8f2219376659f727f2b13d49ead66435aa99f57bb008a64a8042',
  coins.WBTC,
  coins.USDC
)

happyBot.addPool(cetusUSDCtoSUI)
happyBot.addPool(cetusCETUStoSUI)
happyBot.addPool(cetusUSDCtoCETUS)
happyBot.addPool(turbosSUItoUSDC)
happyBot.addPool(cetusWBTCtoUSDC)

happyBot.addStrategy(
  new RideTheTrend(
    cetusUSDCtoSUI.uri,
    5,
    10,
    [
      defaultAmount[cetusUSDCtoSUI.coinTypeA],
      defaultAmount[cetusUSDCtoSUI.coinTypeB]
    ],
    RIDE_THE_TREND_LIMIT,
    'RideTheTrend (USDC/SUI)'
  )
)
happyBot.addStrategy(
  new RideTheTrend(
    cetusCETUStoSUI.uri,
    5,
    10,
    [
      defaultAmount[cetusCETUStoSUI.coinTypeA],
      defaultAmount[cetusCETUStoSUI.coinTypeB]
    ],
    RIDE_THE_TREND_LIMIT,
    'RideTheTrend (CETUS/SUI)'
  )
)
happyBot.addStrategy(
  new RideTheTrend(
    cetusUSDCtoCETUS.uri,
    5,
    10,
    [
      defaultAmount[cetusUSDCtoCETUS.coinTypeA],
      defaultAmount[cetusUSDCtoCETUS.coinTypeB]
    ],
    RIDE_THE_TREND_LIMIT,
    'RideTheTrend (USDC/CETUS)'
  )
)

// Add triangular arbitrage strategy: USDC/SUI -> (CETUS/SUI)^-1 -> (USDC/CETUS)^-1.
happyBot.addStrategy(
  new Arbitrage(
    [
      {
        pool: turbosSUItoUSDC.uri,
        a2b: true
      },
      {
        pool: cetusUSDCtoCETUS.uri,
        a2b: true
      },
      {
        pool: cetusCETUStoSUI.uri,
        a2b: true
      }
    ],
    defaultAmount[coins.SUI],
    ARBITRAGE_RELATIVE_LIMIT,
    'Arbitrage: SUI -Turbos-> USDC -Cetus-> CETUS -Cetus-> SUI'
  )
)

happyBot.addStrategy(
  new Arbitrage(
    [
      {
        pool: turbosSUItoUSDC.uri,
        a2b: true
      },
      {
        pool: cetusUSDCtoSUI.uri,
        a2b: true
      }
    ],
    defaultAmount[coins.SUI],
    ARBITRAGE_RELATIVE_LIMIT,
    'Arbitrage: SUI -Turbos-> USDC -Cetus-> SUI'
  )
)

happyBot.addStrategy(
  new MarketDifference(
    cetusWBTCtoUSDC,
    'BinanceBTCtoUSDC',
    [defaultAmount[coins.WBTC], defaultAmount[coins.USDC]],
    MARKET_DIFFERENCE_LIMIT,
    'Market diff: (W)BTC/USDC, Binance vs CETUS'
  )
)

happyBot.addStrategy(
  new RideTheExternalTrend(
    cetusWBTCtoUSDC.uri,
    'BinanceBTCtoUSDC',
    5,
    10,
    [defaultAmount[coins.WBTC], defaultAmount[coins.USDC]],
    RIDE_THE_TREND_LIMIT,
    1.0001,
    'Ride external trend: (W)BTC/USDC, Binance vs CETUS'
  )
)

// Start the bot
happyBot.loop(3.6e6, 1000)
