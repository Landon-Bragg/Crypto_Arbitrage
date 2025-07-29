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

interface BinanceTickerResponse {
  symbol: string;
  price: string;
}

interface GeminiTickerResponse {
  symbol: string;
  open: string;
  high: string;
  low: string;
  close: string;
  changes: string[];
  bid: string;
  ask: string;
}

class ExchangeService {
  private readonly KRAKEN_BASE_URL = 'https://api.kraken.com/0/public';
  private readonly COINBASE_BASE_URL = 'https://api.exchange.coinbase.com';
  private readonly BINANCE_BASE_URL = 'https://api.binance.us/api/v3';
  private readonly GEMINI_BASE_URL = 'https://api.gemini.com/v1';
  
  private readonly COIN_PAIRS = {
    'BTC': {
      kraken: 'XXBTZUSD',
      coinbase: 'BTC-USD',
      binance: 'BTCUSD',
      gemini: 'btcusd'
    },
    'ETH': {
      kraken: 'XETHZUSD',
      coinbase: 'ETH-USD',
      binance: 'ETHUSDT',
      gemini: 'ethusd'
    },
    'ADA': {
      kraken: 'ADAUSD',
      coinbase: 'ADA-USD',
      binance: 'ADAUSDT'
    },
    'SOL': {
      kraken: 'SOLUSD',
      coinbase: 'SOL-USD',
      binance: 'SOLUSDT'
    },
    'DOT': {
      kraken: 'DOTUSD',
      coinbase: 'DOT-USD',
      binance: 'DOTUSDT'
    },
    'LINK': {
      kraken: 'LINKUSD',
      coinbase: 'LINK-USD',
      binance: 'LINKUSDT'
    },
    'XRP': {
      kraken: 'XXRPZUSD',
      coinbase: 'XRP-USD',
      binance: 'XRPUSDT',
      gemini: 'xrpusd'
    },
    'ATOM': {
      kraken: 'ATOMUSD',
      coinbase: 'ATOM-USD',
      binance: 'ATOMUSDT'
    }
  } as const;

  async fetchKrakenPrices(): Promise<void> {
    try {
      // Filter out coins that don't have Kraken pairs
      const krakenPairs = Object.entries(this.COIN_PAIRS)
        .filter(([coin, pairs]) => 'kraken' in pairs)
        .map(([coin, pairs]) => (pairs as any).kraken)
        .join(',');
      
      if (!krakenPairs) {
        console.log('No Kraken pairs available to fetch');
        return;
      }

      const response = await axios.get<KrakenTickerResponse>(
        `${this.KRAKEN_BASE_URL}/Ticker?pair=${krakenPairs}`,
        { timeout: 10000 }
      );

      if (response.data.error && response.data.error.length > 0) {
        throw new Error(`Kraken API error: ${response.data.error.join(', ')}`);
      }

      for (const [coin, pairs] of Object.entries(this.COIN_PAIRS)) {
        if ('kraken' in pairs) {
          const tickerData = response.data.result[(pairs as any).kraken];
          if (tickerData && tickerData.c && tickerData.c[0]) {
            const price = parseFloat(tickerData.c[0]);
            
            await storage.createExchangePrice({
              exchange: 'Kraken',
              coin,
              price: price.toString(),
            });
          }
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

      const coins = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT'];
      const exchanges = ['Kraken', 'Coinbase', 'Binance', 'Gemini'];
      
      for (const coin of coins) {
        // Get all available prices for this coin
        const prices: { [exchange: string]: number } = {};
        
        for (const exchange of exchanges) {
          const priceData = await storage.getExchangePrice(exchange, coin);
          if (priceData) {
            prices[exchange] = parseFloat(priceData.price);
          }
        }

        // Generate all possible arbitrage pairs
        const availableExchanges = Object.keys(prices);
        if (availableExchanges.length < 2) continue;

        for (let i = 0; i < availableExchanges.length; i++) {
          for (let j = i + 1; j < availableExchanges.length; j++) {
            const exchange1 = availableExchanges[i];
            const exchange2 = availableExchanges[j];
            const price1 = prices[exchange1];
            const price2 = prices[exchange2];

            // Calculate spreads in both directions
            const spreads = [
              {
                buyExchange: exchange1,
                buyPrice: price1,
                sellExchange: exchange2,
                sellPrice: price2,
                spread: ((price2 - price1) / price1) * 100
              },
              {
                buyExchange: exchange2,
                buyPrice: price2,
                sellExchange: exchange1,
                sellPrice: price1,
                spread: ((price1 - price2) / price2) * 100
              }
            ];

            for (const opportunity of spreads) {
              // Only save opportunities with spread >= 0.1%
              if (opportunity.spread >= 0.1) {
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
      }
    } catch (error) {
      console.error('Error calculating arbitrage opportunities:', error);
      throw error;
    }
  }

  async fetchBinancePrices(): Promise<void> {
    try {
      const symbols = Object.values(this.COIN_PAIRS).map(p => p.binance).filter(Boolean);
      
      for (const [coin, pairs] of Object.entries(this.COIN_PAIRS)) {
        if (!pairs.binance) continue;
        
        const response = await axios.get<BinanceTickerResponse>(
          `${this.BINANCE_BASE_URL}/ticker/price?symbol=${pairs.binance}`,
          { timeout: 10000 }
        );

        if (response.data.price) {
          const price = parseFloat(response.data.price);
          
          await storage.createExchangePrice({
            exchange: 'Binance',
            coin,
            price: price.toString(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching Binance prices:', error);
      // Don't throw - let other exchanges continue working
    }
  }

  async fetchGeminiPrices(): Promise<void> {
    try {
      for (const [coin, pairs] of Object.entries(this.COIN_PAIRS)) {
        const geminiSymbol = (pairs as any).gemini;
        if (!geminiSymbol) continue;
        
        const response = await axios.get<GeminiTickerResponse>(
          `${this.GEMINI_BASE_URL}/pubticker/${geminiSymbol}`,
          { timeout: 10000 }
        );

        if (response.data.ask && response.data.bid) {
          // Use mid price between bid and ask
          const price = (parseFloat(response.data.ask) + parseFloat(response.data.bid)) / 2;
          
          await storage.createExchangePrice({
            exchange: 'Gemini',
            coin,
            price: price.toString(),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching Gemini prices:', error);
      // Don't throw - let other exchanges continue working
    }
  }

  async updateAllPrices(): Promise<void> {
    try {
      // Fetch prices from all exchanges concurrently
      await Promise.all([
        this.fetchKrakenPrices(),
        this.fetchCoinbasePrices(),
        this.fetchBinancePrices(),
        this.fetchGeminiPrices()
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
