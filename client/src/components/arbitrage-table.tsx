import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ArbitrageOpportunity } from "@shared/schema";
import { SiBitcoin } from "react-icons/si";
import { SiEthereum } from "react-icons/si";

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
  isLoading: boolean;
  autoRefreshEnabled: boolean;
  onToggleAutoRefresh: () => void;
}

export function ArbitrageTable({
  opportunities,
  isLoading,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}: ArbitrageTableProps) {
  // Deduplicate opportunities by coin, buyExchange, sellExchange
  const uniqueOpportunities = Object.values(
    opportunities.reduce<Record<string, ArbitrageOpportunity>>((acc, opp) => {
      const key = `${opp.coin}_${opp.buyExchange}_${opp.sellExchange}`;
      // Keep the latest opportunity by timestamp
      if (!acc[key] || new Date(opp.timestamp) > new Date(acc[key].timestamp)) {
        acc[key] = opp;
      }
      return acc;
    }, {})
  );

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

  const getCoinName = (coin: string) => {
    switch (coin) {
      case 'BTC':
        return 'Bitcoin';
      case 'ETH':
        return 'Ethereum';
      case 'ADA':
        return 'Cardano';
      case 'SOL':
        return 'Solana';
      case 'DOT':
        return 'Polkadot';
      case 'LINK':
        return 'Chainlink';
      default:
        return coin;
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

  const getSpreadBadgeColor = (spread: number) => {
    if (spread >= 2.0) return 'bg-emerald-100 text-emerald-800';
    if (spread >= 1.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(num);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card className="bg-slate-850 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-white">
            Arbitrage Opportunities
          </CardTitle>
          <div className="flex items-center space-x-4">
            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
            <div className="text-sm text-slate-400">
              {opportunities.length} opportunities found
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Coin</TableHead>
                <TableHead className="text-slate-300">Buy Exchange</TableHead>
                <TableHead className="text-slate-300">Buy Price</TableHead>
                <TableHead className="text-slate-300">Sell Exchange</TableHead>
                <TableHead className="text-slate-300">Sell Price</TableHead>
                <TableHead className="text-slate-300">Spread %</TableHead>
                <TableHead className="text-slate-300">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                    {isLoading ? "Loading opportunities..." : "No arbitrage opportunities found"}
                  </TableCell>
                </TableRow>
              ) : (
                uniqueOpportunities.map((opportunity) => (
                  <TableRow 
                    key={opportunity.id} 
                    className="border-slate-700 hover:bg-slate-800 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          {getCoinIcon(opportunity.coin)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {opportunity.coin}
                          </div>
                          <div className="text-xs text-slate-400">
                            {getCoinName(opportunity.coin)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getExchangeBadgeColor(opportunity.buyExchange)}>
                        {opportunity.buyExchange}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      {formatPrice(opportunity.buyPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getExchangeBadgeColor(opportunity.sellExchange)}>
                        {opportunity.sellExchange}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      {formatPrice(opportunity.sellPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSpreadBadgeColor(parseFloat(opportunity.spread))}>
                        +{parseFloat(opportunity.spread).toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 font-mono">
                      {formatTimestamp(opportunity.timestamp)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing all opportunities
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Auto-refresh:</span>
            <Button
              size="sm"
              onClick={onToggleAutoRefresh}
              className={`px-3 py-1 text-sm font-medium ${
                autoRefreshEnabled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {autoRefreshEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
