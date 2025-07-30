import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ExchangePrice } from "@shared/schema";
import { SiBitcoin, SiEthereum, SiCardano, SiSolana, SiPolkadot, SiChainlink, SiRipple } from "react-icons/si";

// Define the coin order you want to display
const COIN_ORDER = [
  "BTC",
  "ETH",
  "ADA",
  "SOL",
  "DOT",
  "LINK",
  "XRP",
  "ATOM"
];

export function LivePrices() {
  const { data: prices = [], isLoading } = useQuery<ExchangePrice[]>({
    queryKey: ["/api/prices"],
    queryFn: async () => {
      const response = await fetch("/api/prices");
      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }
      return response.json();
    },
    refetchInterval: 5000, // 5 seconds
  });

  const getCoinIcon = (coin: string) => {
    switch (coin) {
      case 'BTC':
        return <SiBitcoin className="text-orange-500 text-lg" />;
      case 'ETH':
        return <SiEthereum className="text-blue-500 text-lg" />;
      case 'ADA':
        return <SiCardano className="text-blue-600 text-lg" />;
      case 'SOL':
        return <SiSolana className="text-purple-500 text-lg" />;
      case 'DOT':
        return <SiPolkadot className="text-pink-500 text-lg" />;
      case 'LINK':
        return <SiChainlink className="text-blue-400 text-lg" />;
      case 'XRP':
        return <SiRipple className="text-gray-400 text-lg" />;
      case 'ATOM':
        return <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>;
    }
  };

  const getExchangeBadgeColor = (exchange: string) => {
    switch (exchange) {
      case 'Kraken':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Coinbase':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Binance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Gemini':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 1000) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(num);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Group prices by coin
  const pricesByCoin = prices.reduce((acc, price) => {
    if (price.coin === "MATIC") return acc; 
    if (!acc[price.coin]) {
      acc[price.coin] = [];
    }
    acc[price.coin].push(price);
    return acc;
  }, {} as Record<string, ExchangePrice[]>);

  return (
    <Card className="bg-slate-850 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Live Exchange Prices
          </CardTitle>
          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Updating...</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {COIN_ORDER.filter(coin => pricesByCoin[coin]).length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            {isLoading ? "Loading prices..." : "No price data available"}
          </div>
        ) : (
          COIN_ORDER.filter(coin => pricesByCoin[coin]).map((coin) => (
            <div key={coin} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  {getCoinIcon(coin)}
                </div>
                <h3 className="text-lg font-semibold text-white">{coin}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {pricesByCoin[coin].map((price) => (
                  <div 
                    key={`${price.exchange}-${price.coin}`}
                    className="bg-slate-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getExchangeBadgeColor(price.exchange)}>
                        {price.exchange}
                      </Badge>
                    </div>
                    <div className="text-white font-mono text-lg font-semibold">
                      {formatPrice(price.price)}
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      {formatTimestamp(price.timestamp)}
                    </div>
                  </div>
                ))}
              </div>

              {pricesByCoin[coin].length >= 2 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="text-sm text-slate-400">
                    Spread: {(() => {
                      const pricesArr = pricesByCoin[coin].map(p => parseFloat(p.price));
                      const maxPrice = Math.max(...pricesArr);
                      const minPrice = Math.min(...pricesArr);
                      const spread = ((maxPrice - minPrice) / minPrice) * 100;
                      return (
                        <span className={spread >= 0.5 ? "text-emerald-400 font-semibold" : "text-slate-300"}>
                          {spread.toFixed(2)}%
                        </span>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}