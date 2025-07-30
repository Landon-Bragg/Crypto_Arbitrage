import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ExchangePrice } from "@shared/schema";
import { SiBitcoin, SiEthereum } from "react-icons/si";

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
        return <div className="w-4 h-4 bg-blue-600 rounded-full"></div>;
      case 'SOL':
        return <div className="w-4 h-4 bg-purple-500 rounded-full"></div>;
      case 'DOT':
        return <div className="w-4 h-4 bg-pink-500 rounded-full"></div>;
      case 'LINK':
        return <div className="w-4 h-4 bg-blue-400 rounded-full"></div>;
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
        {Object.keys(pricesByCoin).length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            {isLoading ? "Loading prices..." : "No price data available"}
          </div>
        ) : (
          Object.entries(pricesByCoin).map(([coin, coinPrices]) => (
            <div key={coin} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  {getCoinIcon(coin)}
                </div>
                <h3 className="text-lg font-semibold text-white">{coin}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {coinPrices.map((price) => (
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

              {coinPrices.length >= 2 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="text-sm text-slate-400">
                    Spread: {(() => {
                      const prices = coinPrices.map(p => parseFloat(p.price));
                      const maxPrice = Math.max(...prices);
                      const minPrice = Math.min(...prices);
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