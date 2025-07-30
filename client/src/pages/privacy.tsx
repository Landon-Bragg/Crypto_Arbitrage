
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-850 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Information We Collect</h3>
              <p>
                This application collects publicly available cryptocurrency price data from various exchanges 
                to provide arbitrage opportunities. We do not collect personal information from users.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Usage</h3>
              <p>
                The price data is used solely for calculating and displaying arbitrage opportunities. 
                No user behavior or personal data is tracked or stored.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Third-Party Services</h3>
              <p>
                We fetch data from public APIs of cryptocurrency exchanges including Kraken, Coinbase, 
                Binance US, and Gemini. Please refer to their respective privacy policies for more information.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Contact</h3>
              <p>
                If you have any questions about this privacy policy, please contact us at the 
                email address provided in our contact page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
