import { AlertTriangle, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CrisisAlertProps {
  onClose: () => void;
}

export function CrisisAlert({ onClose }: CrisisAlertProps) {
  return (
    <Card className="border-red-200 bg-red-50 animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Immediate Support Available
            </h3>
            <p className="text-red-700 mb-4">
              Your safety matters. If you're having thoughts of self-harm, please reach out for immediate support.
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-800">Crisis Lifeline</div>
                  <div className="text-sm text-red-600">Call 988 (24/7 support)</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                <MessageCircle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-800">Crisis Text Line</div>
                  <div className="text-sm text-red-600">Text HELLO to 741741</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => window.open('tel:988', '_self')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Call 988
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Continue Conversation
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}