import axios from 'axios';
import { storage } from '../storage';
import { InsertExchangePrice, InsertArbitrageOpportunity } from '@shared/schema';

interface KrakenTickerResponse {
  error: string[];
  result: {
    [pair: string]: {
      c: string[]; // last trade closed array
      v: string[]; // volume array
      p: string[]; // volume weighted average price array
      t: number[]; // number of trades array
      l: string[]; // low array
      h: string[]; // high array
      o: string; // today's opening price
    };
  };
}

interface CoinbaseTickerResponse {
  price: string;
  size: string;
  bid: string;
  ask: string;
  volume: string;
  time: string;
}

class ExchangeService {
  private readonly KRAKEN_BASE_URL = 'https://api.kraken.com/0/public';
  private readonly COINBASE_BASE_URL = 'https://api.exchange.coinbase.com';
  
  private readonly COIN_PAIRS = {
    'BTC': {
      kraken: 'XXBTZUSD',
      coinbase: 'BTC-USD'
    },
    'ETH': {
      kraken: 'XETHZUSD',
      coinbase: 'ETH-USD'
    }
  };

  async fetchKrakenPrices(): Promise<void> {
    try {
      const pairs = Object.values(this.COIN_PAIRS).map(p => p.kraken).join(',');
      const response = await axios.get<KrakenTickerResponse>(
        `${this.KRAKEN_BASE_URL}/Ticker?pair=${pairs}`,
        { timeout: 10000 }
      );

      if (response.data.error && response.data.error.length > 0) {
        throw new Error(`Kraken API error: ${response.data.error.join(', ')}`);
      }

      for (const [coin, pairs] of Object.entries(this.COIN_PAIRS)) {
        const tickerData = response.data.result[pairs.kraken];
        if (tickerData && tickerData.c && tickerData.c[0]) {
          const price = parseFloat(tickerData.c[0]);
          
          await storage.createExchangePrice({
            exchange: 'Kraken',
            coin,
            price: price.toString(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching Kraken prices:', error);
      throw error;
    }
  }

  async fetchCoinbasePrices(): Promise<void> {
    try {
      for (const [coin, pairs] of Object.entries(this.COIN_PAIRS)) {
        const response = await axios.get<CoinbaseTickerResponse>(
          `${this.COINBASE_BASE_URL}/products/${pairs.coinbase}/ticker`,
          { timeout: 10000 }
        );

        if (response.data.price) {
          const price = parseFloat(response.data.price);
          
          await storage.createExchangePrice({
            exchange: 'Coinbase',
            coin,
            price: price.toString(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching Coinbase prices:', error);
      throw error;
    }
  }

  async calculateArbitrageOpportunities(): Promise<void> {
    try {
      // Clear old opportunities first
      await storage.clearOldArbitrageOpportunities();

      const coins = ['BTC', 'ETH'];
      
      for (const coin of coins) {
        const krakenPrice = await storage.getExchangePrice('Kraken', coin);
        const coinbasePrice = await storage.getExchangePrice('Coinbase', coin);

        if (krakenPrice && coinbasePrice) {
          const kraken = parseFloat(krakenPrice.price);
          const coinbase = parseFloat(coinbasePrice.price);

          // Calculate spread in both directions
          const spreads = [
            {
              buyExchange: 'Kraken',
              buyPrice: kraken,
              sellExchange: 'Coinbase', 
              sellPrice: coinbase,
              spread: ((coinbase - kraken) / kraken) * 100
            },
            {
              buyExchange: 'Coinbase',
              buyPrice: coinbase,
              sellExchange: 'Kraken',
              sellPrice: kraken,
              spread: ((kraken - coinbase) / coinbase) * 100
            }
          ];

          for (const opportunity of spreads) {
            // Only save opportunities with spread >= 0.5%
            if (opportunity.spread >= 0.5) {
              await storage.createArbitrageOpportunity({
                coin,
                buyExchange: opportunity.buyExchange,
                buyPrice: opportunity.buyPrice.toString(),
                sellExchange: opportunity.sellExchange,
                sellPrice: opportunity.sellPrice.toString(),
                spread: opportunity.spread.toFixed(4),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating arbitrage opportunities:', error);
      throw error;
    }
  }

  async updateAllPrices(): Promise<void> {
    try {
      // Fetch prices from both exchanges concurrently
      await Promise.all([
        this.fetchKrakenPrices(),
        this.fetchCoinbasePrices()
      ]);

      // Calculate arbitrage opportunities
      await this.calculateArbitrageOpportunities();
    } catch (error) {
      console.error('Error updating prices:', error);
      throw error;
    }
  }
}

export const exchangeService = new ExchangeService();
