import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Mail } from "lucide-react";

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfUseModal({ isOpen, onClose }: TermsOfUseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-heading text-gray-900">SoulSense Terms of Use</DialogTitle>
              <DialogDescription className="font-body text-gray-600">
                Last Updated: July 2025
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 font-body text-gray-700 leading-relaxed">
            <p className="text-blue-700 font-medium">
              By using SoulSense, you agree to the following terms that protect both you and the emotional integrity of the platform:
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">1. Purpose of SoulSense</h3>
              <p>SoulSense is a supportive, AI-powered space designed for self-reflection, journaling, emotional support, and personal goal-setting. It does not provide licensed therapy or emergency services.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">2. Age Requirement</h3>
              <p>You must be 16 years or older to use SoulSense. Users under this age must have parental guidance.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">3. Respectful Use</h3>
              <p>You agree to use SoulSense respectfully and not upload or share any harmful, offensive, or illegal content.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">4. No Medical Claims</h3>
              <p>SoulSense offers therapeutic-style conversation, not clinical advice. If you're in crisis or need urgent help, please contact local mental health services.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">5. Changes to Terms</h3>
              <p>We may update these terms to improve your experience. Any changes will be posted here and marked with the latest update date.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-heading font-medium text-gray-900">6. Contact</h3>
              <p>For concerns or questions, email us at:</p>
              <div className="flex items-center gap-2 text-blue-600">
                <Mail className="w-4 h-4" />
                <a href="mailto:shreerajsangle0@gmail.com" className="hover:underline">
                  shreerajsangle0@gmail.com
                </a>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-body">
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}