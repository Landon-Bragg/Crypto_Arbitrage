import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArbitrageTable } from "@/components/arbitrage-table";
import { FilterSidebar } from "@/components/filter-sidebar";
import { AlertNotification } from "@/components/alert-notification";
import { LivePrices } from "@/components/live-prices";
import { UserMenu } from "@/components/user-menu";
import { ArbitrageOpportunity, Statistics } from "@shared/schema";
import { ChartLine } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState<string>("all");
  const [minSpread, setMinSpread] = useState<number>(0.1);
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");

  // Query for arbitrage opportunities
  const {
    data: opportunities = [],
    isLoading: isLoadingOpportunities,
    refetch: refetchOpportunities,
  } = useQuery<ArbitrageOpportunity[]>({
    queryKey: ["/api/arbitrage", selectedCoin, minSpread],
    queryFn: async () => {
      const params = new URLSearchParams({
        coin: selectedCoin,
        minSpread: minSpread.toString(),
      });
      const response = await fetch(`/api/arbitrage?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      return response.json();
    },
    refetchInterval: autoRefreshEnabled ? 5000 : false, // Always 5 seconds
  });

  // Query for statistics
  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["/api/statistics"],
    queryFn: async () => {
      const response = await fetch("/api/statistics");
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      return response.json();
    },
    refetchInterval: autoRefreshEnabled ? 5000 : false, // Always 5 seconds
  });

  // Update last update time
  useEffect(() => {
    if (!isLoadingOpportunities) {
      setLastUpdateTime(new Date().toLocaleTimeString());
    }
  }, [isLoadingOpportunities]);

  // Check for new high-value opportunities to show alerts
  useEffect(() => {
    if (alertsEnabled && opportunities.length > 0) {
      const highValueOpportunity = opportunities.find(
        op => parseFloat(op.spread) >= 2.0
      );
      if (highValueOpportunity) {
        const message = `${highValueOpportunity.coin} spread of ${parseFloat(highValueOpportunity.spread).toFixed(2)}% between ${highValueOpportunity.buyExchange} and ${highValueOpportunity.sellExchange}`;
        setAlertMessage(message);
        setShowAlert(true);
      }
    }
  }, [opportunities, alertsEnabled]);

  const handleManualRefresh = async () => {
    try {
      await fetch("/api/update-prices", { method: "POST" });
      await refetchOpportunities();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  const connectionStatus = isLoadingOpportunities ? "Updating..." : "Connected";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-850 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ChartLine className="text-white h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold text-white">CryptoArb</h1>
            <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full">
              LIVE
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-400">
              Last Update: <span className="text-slate-300">{lastUpdateTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isLoadingOpportunities 
                  ? "bg-yellow-400 animate-pulse" 
                  : "bg-emerald-400 animate-pulse"
              }`} />
              <span className="text-sm text-slate-300">{connectionStatus}</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              selectedCoin={selectedCoin}
              minSpread={minSpread}
              alertsEnabled={alertsEnabled}
              statistics={statistics || { activeOpportunities: 0, highestSpread: 0 }}
              isRefreshing={isLoadingOpportunities}
              onCoinChange={setSelectedCoin}
              onSpreadChange={setMinSpread}
              onAlertsToggle={setAlertsEnabled}
              onRefresh={handleManualRefresh}
            />
          </div>
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="opportunities" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="opportunities" className="data-[state=active]:bg-slate-700">
                  Arbitrage Opportunities
                </TabsTrigger>
                <TabsTrigger value="prices" className="data-[state=active]:bg-slate-700">
                  Live Exchange Prices
                </TabsTrigger>
              </TabsList>
              <TabsContent value="opportunities" className="mt-6">
                <ArbitrageTable
                  opportunities={opportunities}
                  isLoading={isLoadingOpportunities}
                  autoRefreshEnabled={autoRefreshEnabled}
                  onToggleAutoRefresh={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                />
              </TabsContent>
              <TabsContent value="prices" className="mt-6">
                <LivePrices />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {/* Alert Notification */}
      <AlertNotification
        show={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}
