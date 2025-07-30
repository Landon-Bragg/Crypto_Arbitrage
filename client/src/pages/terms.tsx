
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-850 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Acceptance of Terms</h3>
              <p>
                By using this cryptocurrency arbitrage tracker, you agree to be bound by these terms of service.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Service Description</h3>
              <p>
                This service provides information about potential arbitrage opportunities between different 
                cryptocurrency exchanges. The data is for informational purposes only.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Disclaimer</h3>
              <p>
                The information provided is not financial advice. Cryptocurrency trading involves significant 
                risk and you should conduct your own research before making any trading decisions. Price data 
                may be delayed or inaccurate.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Limitation of Liability</h3>
              <p>
                We are not responsible for any losses or damages that may result from using this service. 
                Use at your own risk.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service 
                constitutes acceptance of any changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
