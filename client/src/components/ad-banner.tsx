import { X, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AdBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold text-white">Unlock Premium Features</span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-blue-100">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>5x Faster Updates</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-red-400">⊘</span>
                <span>Ad-Free Experience</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📊</span>
                <span>Advanced Analytics</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            >
              Upgrade Now - $9.99/month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-blue-100 hover:text-white hover:bg-blue-700/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}