import { Investment } from '../models/Investment';

const BASE_URL = 'https://api.coingecko.com/api/v3';

interface CoinSearchResult {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}

interface CoinPrice {
  [key: string]: {
    brl: number;
    brl_24h_change: number;
    last_updated_at: number;
  };
}

// Cache simples em memória
const cache: {
  search: { [query: string]: { data: CoinSearchResult[], timestamp: number } };
  prices: { [ids: string]: { data: CoinPrice, timestamp: number } };
} = {
  search: {},
  prices: {}
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const CoinGeckoService = {
  async searchCoins(query: string): Promise<CoinSearchResult[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = query.toLowerCase();
    const cached = cache.search[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('CoinGecko API error');
      
      const data = await response.json();
      const coins = data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        thumb: coin.thumb
      }));

      cache.search[cacheKey] = { data: coins, timestamp: Date.now() };
      return coins;
    } catch (error) {
      console.error('Error searching coins:', error);
      return [];
    }
  },

  async getPrices(coinIds: string[]): Promise<CoinPrice> {
    if (coinIds.length === 0) return {};

    const idsString = coinIds.sort().join(',');
    const cached = cache.prices[idsString];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/simple/price?ids=${encodeURIComponent(idsString)}&vs_currencies=brl&include_24hr_change=true&include_last_updated_at=true`
      );
      
      if (!response.ok) throw new Error('CoinGecko API error');
      
      const data = await response.json();
      
      cache.prices[idsString] = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.error('Error fetching prices:', error);
      return {};
    }
  }
};
