import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw } from "lucide-react";
import { Statistics } from "@shared/schema";

interface FilterSidebarProps {
  selectedCoin: string;
  minSpread: number;
  alertsEnabled: boolean;
  statistics: Statistics;
  isRefreshing: boolean;
  onCoinChange: (coin: string) => void;
  onSpreadChange: (spread: number) => void;
  onAlertsToggle: (enabled: boolean) => void;
  onRefresh: () => void;
}

export function FilterSidebar({
  selectedCoin,
  minSpread,
  alertsEnabled,
  statistics,
  isRefreshing,
  onCoinChange,
  onSpreadChange,
  onAlertsToggle,
  onRefresh,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coin Filter */}
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2 block">
              Cryptocurrency
            </Label>
            <Select value={selectedCoin} onValueChange={onCoinChange}>
              <SelectTrigger className="bg-slate-750 border-slate-600 text-white focus:ring-emerald-500 focus:border-emerald-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-750 border-slate-600">
                <SelectItem value="all">All Coins</SelectItem>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="ADA">Cardano (ADA)</SelectItem>
                <SelectItem value="SOL">Solana (SOL)</SelectItem>
                <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
                <SelectItem value="LINK">Chainlink (LINK)</SelectItem>
                <SelectItem value="MATIC">Polygon (MATIC)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Minimum Spread Filter */}
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2 block">
              Minimum Spread %
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={minSpread}
              onChange={(e) => onSpreadChange(parseFloat(e.target.value) || 0)}
              className="bg-slate-750 border-slate-600 text-white focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Exchange Filter */}
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2 block">
              Exchanges
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="kraken" 
                  checked={true} 
                  disabled
                  className="border-slate-600 text-emerald-500"
                />
                <Label htmlFor="kraken" className="text-sm text-slate-300">Kraken</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="coinbase" 
                  checked={true} 
                  disabled
                  className="border-slate-600 text-emerald-500"
                />
                <Label htmlFor="coinbase" className="text-sm text-slate-300">Coinbase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="binance" 
                  checked={true} 
                  disabled
                  className="border-slate-600 text-emerald-500"
                />
                <Label htmlFor="binance" className="text-sm text-slate-300">Binance US</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gemini" 
                  checked={true} 
                  disabled
                  className="border-slate-600 text-emerald-500"
                />
                <Label htmlFor="gemini" className="text-sm text-slate-300">Gemini</Label>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-2 block">
              Alert Settings
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alerts"
                checked={alertsEnabled}
                onCheckedChange={onAlertsToggle}
                className="border-slate-600 text-emerald-500"
              />
              <Label htmlFor="alerts" className="text-sm text-slate-300">Enable alerts</Label>
            </div>
          </div>

          {/* Refresh Control */}
          <Button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </CardContent>
      </Card>

      {/* Statistics Panel */}
      <Card className="bg-slate-850 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Opportunities:</span>
              <span className="text-emerald-400 font-semibold">
                {statistics.activeOpportunities}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Highest Spread:</span>
              <span className="text-emerald-400 font-semibold">
                {statistics.highestSpread.toFixed(2)}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Last Alert:</span>
              <span className="text-slate-300">
                {statistics.lastAlertTime || 'None'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
