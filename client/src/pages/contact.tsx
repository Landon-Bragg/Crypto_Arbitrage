
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Github } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-850 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-6">
            <div>
              <p className="mb-6">
                Have questions, feedback, or need support? We'd love to hear from you!
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg">
                <Mail className="h-6 w-6 text-emerald-500" />
                <div>
                  <h3 className="font-semibold text-white">Email Support</h3>
                  <p className="text-sm text-slate-400">Get help with technical issues</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-emerald-400 hover:text-emerald-300"
                    onClick={() => window.location.href = 'mailto:support@cryptoarbitrage.app'}
                  >
                    support@cryptoarbitrage.app
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-white">General Inquiries</h3>
                  <p className="text-sm text-slate-400">Questions about the service</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-400 hover:text-blue-300"
                    onClick={() => window.location.href = 'mailto:hello@cryptoarbitrage.app'}
                  >
                    hello@cryptoarbitrage.app
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg">
                <Github className="h-6 w-6 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-white">Bug Reports & Features</h3>
                  <p className="text-sm text-slate-400">Report issues or suggest improvements</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-purple-400 hover:text-purple-300"
                    onClick={() => window.location.href = 'mailto:bugs@cryptoarbitrage.app'}
                  >
                    bugs@cryptoarbitrage.app
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-slate-800 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Response Time</h3>
              <p className="text-sm text-slate-400">
                We typically respond to inquiries within 24-48 hours during business days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
