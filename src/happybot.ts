import { CetusParams, SuiswapParams, TurbosParams } from '@/dexs/dexsParams'
import { Pool } from '@/dexs/pool'
import {
  JsonRpcProvider,
  Keypair,
  RawSigner,
  TransactionBlock,
  mainnetConnection
} from '@mysten/sui.js'
import { DataSource } from '@/data_sources/data_source'
import { CetusPool } from '@/dexs/cetus/cetus'
import { SuiswapPool } from '@/dexs/suiswap/suiswap'
import { TurbosPool } from '@/dexs/turbos/turbos'
import { Strategy } from '@/strategies/strategy'
import { logger } from '@/logger'
import { setTimeout } from 'timers/promises'

export class HappyBot {
  public dataSources: Record<string, DataSource> = {}

  public pools: Record<
    string,
    Pool<CetusParams | SuiswapParams | TurbosParams>
  > = {}

  public strategies: Record<string, Array<Strategy>> = {}

  private keypair: Keypair
  private provider: JsonRpcProvider
  private signer: RawSigner

  constructor(keypair: Keypair) {
    this.keypair = keypair
    this.provider = new JsonRpcProvider(mainnetConnection)
    this.signer = new RawSigner(this.keypair, this.provider)
  }

  async loop(duration: number, delay: number) {
    const startTime = new Date().getTime()
    const uniqueStrategies: Record<string, any> = {}

    for (const pool in this.strategies) {
      for (const strategy of this.strategies[pool]) {
        if (!uniqueStrategies.hasOwnProperty(strategy.uri)) {
          uniqueStrategies[strategy.uri] = strategy['parameters']
        }
      }
    }

    logger.info({ strategies: uniqueStrategies }, 'strategies')

    let transactionBlock: TransactionBlock = new TransactionBlock()

    while (new Date().getTime() - startTime < duration) {
      for (const uri in this.dataSources) {
        const dataSource = this.dataSources[uri]
        const data = await dataSource.getData()

        logger.info(
          {
            price: data
          },
          'price'
        )

        for (const strategy of this.strategies[uri]) {
          const tradeOrders = strategy.evaluate(data)
          transactionBlock = new TransactionBlock()

          for (const order of tradeOrders) {
            logger.info({ strategy: strategy.uri, decision: order }, 'order')
            const amountIn = Math.round(order.amountIn)
            const amountOut = Math.round(order.estimatedPrice * amountIn)
            const a2b: boolean = order.a2b
            const byAmountIn: boolean = true

            const slippage: number = 1 // TODO: Define this in a meaningful way. Perhaps by the strategies.

            if (this.pools[order.pool] instanceof CetusPool) {
              transactionBlock = await this.pools[
                order.pool
              ].createSwapTransaction(transactionBlock, {
                a2b,
                amountIn,
                amountOut,
                byAmountIn,
                slippage
              })
            } else if (this.pools[order.pool] instanceof SuiswapPool) {
              transactionBlock = await this.pools[
                order.pool
              ].createSwapTransaction(transactionBlock, {
                a2b,
                amountIn
              })
            } else if (this.pools[order.pool] instanceof TurbosPool) {
              transactionBlock = await this.pools[
                order.pool
              ].createSwapTransaction(transactionBlock, {
                a2b,
                amountIn,
                amountSpecifiedIsInput: true,
                slippage: 0
              })
            }
          }
          // Execute the transactions
          await this.executeTransactionBlock(transactionBlock, strategy)
        }
      }
      await setTimeout(delay)
    }
  }

  private async executeTransactionBlock(
    transactionBlock: TransactionBlock,
    strategy: Strategy
  ) {
    if (transactionBlock.blockData.transactions.length !== 0) {
      try {
        transactionBlock.setGasBudget(1500000000)
        const result = await this.signer.signAndExecuteTransactionBlock({
          transactionBlock,
          requestType: 'WaitForLocalExecution',
          options: {
            showObjectChanges: true,
            showEffects: true
          }
        })
        logger.info({ strategy: strategy, transaction: result }, 'transaction')
      } catch (e) {
        logger.error(e)
      }
    }
  }

  /** Add a strategy to this bot. The pools it subscribes to must have been added first. */
  addStrategy(strategy: Strategy) {
    for (const dataSource of strategy.subscribes_to()) {
      if (!this.dataSources.hasOwnProperty(dataSource)) {
        throw new Error(
          'Bot does not know the dataSource with address ' + dataSource
        )
      }
      this.strategies[dataSource].push(strategy)
    }
  }

  /** Add a new price data source for this bot to use */
  addDataSource(dataSource: DataSource) {
    if (this.dataSources.hasOwnProperty(dataSource.uri)) {
      throw new Error(
        'Data source ' + dataSource.uri + ' has already been added.'
      )
    }
    this.dataSources[dataSource.uri] = dataSource
    this.strategies[dataSource.uri] = []
  }

  /** Add a new pool for this bot to use for trading. */
  addPool(pool: Pool<CetusParams | SuiswapParams | TurbosParams>) {
    if (this.pools.hasOwnProperty(pool.uri)) {
      throw new Error('Pool ' + pool.uri + ' has already been added.')
    }
    this.pools[pool.uri] = pool
    this.addDataSource(pool)
  }
}
