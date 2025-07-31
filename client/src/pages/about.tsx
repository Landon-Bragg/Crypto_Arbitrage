
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="bg-slate-850 border-slate-700">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white">
              About Crypto Arbitrage Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-6">
            <div>
              <p className="text-lg leading-relaxed">
                Our cryptocurrency arbitrage tracker helps traders identify price differences across 
                major exchanges in real-time, enabling profitable trading opportunities through 
                price discrepancies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                  <h3 className="text-lg font-semibold text-white">Real-Time Tracking</h3>
                </div>
                <p className="text-sm">
                  Monitor live price feeds from Kraken, Coinbase, Binance US, and Gemini 
                  with updates every 15 seconds.
                </p>
              </div>
              
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">Advanced Filtering</h3>
                </div>
                <p className="text-sm">
                  Filter opportunities by cryptocurrency type, minimum spread percentage, 
                  and preferred exchanges.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-purple-500" />
                  <h3 className="text-lg font-semibold text-white">Secure & Private</h3>
                </div>
                <p className="text-sm">
                  No personal data collection, no account required. All data comes from 
                  public exchange APIs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-850 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Supported Cryptocurrencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-orange-600 hover:bg-orange-700">Bitcoin (BTC)</Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700">Ethereum (ETH)</Badge>
              <Badge className="bg-green-600 hover:bg-green-700">Cardano (ADA)</Badge>
              <Badge className="bg-purple-600 hover:bg-purple-700">Solana (SOL)</Badge>
              <Badge className="bg-pink-600 hover:bg-pink-700">Polkadot (DOT)</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-850 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">
              Supported Exchanges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="font-medium text-white">Kraken</span>
                <Badge className="bg-indigo-600">API Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="font-medium text-white">Coinbase</span>
                <Badge className="bg-indigo-600">API Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="font-medium text-white">Binance US</span>
                <Badge className="bg-indigo-600">API Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="font-medium text-white">Gemini</span>
                <Badge className="bg-indigo-600">API Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
