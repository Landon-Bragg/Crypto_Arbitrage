import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

interface AlertNotificationProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function AlertNotification({ show, message, onClose }: AlertNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 max-w-sm w-full bg-emerald-600 text-white rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-right-full">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-300" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            New arbitrage opportunity detected!
          </p>
          <p className="text-xs mt-1 text-emerald-100">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button 
            onClick={onClose}
            className="text-emerald-100 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
