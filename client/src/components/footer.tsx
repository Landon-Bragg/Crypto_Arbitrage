
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Crypto Arbitrage</h3>
            <p className="text-sm text-slate-400">
              Real-time cryptocurrency arbitrage opportunities across major exchanges.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Live Tracker
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@cryptoarbitrage.app" 
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Email Support
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-400">
              © 2024 Crypto Arbitrage Tracker. All rights reserved.
            </p>
            <p className="text-sm text-slate-400 mt-2 md:mt-0">
              Data from public exchange APIs - Not financial advice
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
