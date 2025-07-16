import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Mail } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-heading text-gray-900">SoulSense Privacy Policy</DialogTitle>
              <DialogDescription className="font-body text-gray-600">
                Last Updated: July 2025
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 font-body text-gray-700 leading-relaxed">
            <p className="text-purple-700 font-medium">
              At SoulSense, your emotional safety and privacy matter deeply. We are committed to protecting any personal data you choose to share while using our platform.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">1. Information We Collect</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span><strong>Conversations:</strong> Messages you exchange with SoulSense personas (e.g., journaling, chats, check-ins).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span><strong>Emotional patterns:</strong> Mood entries or goals you set to personalize your experience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span><strong>Basic data:</strong> Email address (if provided), device/browser info (non-identifiable).</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">2. How We Use Your Data</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span>To make your experience feel more personal and human</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span>To recall journaling, goals, or emotions with memory-based support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span>To improve SoulSense's emotional intelligence through anonymous feedback patterns</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">3. Your Control</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span>You can request to delete your data at any time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span>We do not share or sell your personal data with third parties.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-2">•</span>
                  <span>All emotional content is treated with respect, security, and encryption.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">4. Third-Party Tools</h3>
              <p>SoulSense may use secure APIs or services (e.g., Claude, Mixtral) to generate responses. These tools never see your personal identity.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">5. Contact Us</h3>
              <p>If you have questions about your data, reach out anytime at:</p>
              <div className="flex items-center gap-2 text-purple-600">
                <Mail className="w-4 h-4" />
                <a href="mailto:shreerajsangle0@gmail.com" className="hover:underline">
                  shreerajsangle0@gmail.com
                </a>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-body">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}