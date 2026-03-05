import { Crown, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
  currentUsage: number;
  maxFreeUsage: number;
}

export function UpgradeModal({ onClose, onUpgrade, currentUsage, maxFreeUsage }: UpgradeModalProps) {
  const freeFeatures = [
    { name: `${maxFreeUsage} conversions per day (File/Voice/URL)`, included: true },
    { name: 'Voice recording input', included: true },
    { name: 'Text-to-speech reader', included: true },
    { name: 'Basic file formats (JPEG, PNG, PDF)', included: true },
    { name: 'Text editing and download', included: true },
    { name: 'History tracking (up to 10 items)', included: false },
    { name: 'Priority processing', included: false },
    { name: 'Advanced file compression', included: false },
    { name: 'Bulk processing', included: false },
  ];

  const premiumFeatures = [
    { name: 'Unlimited conversions (File/Voice/URL)', included: true },
    { name: 'Voice recording input', included: true },
    { name: 'Text-to-speech reader', included: true },
    { name: 'All file formats supported', included: true },
    { name: 'Text editing and download', included: true },
    { name: 'History tracking (unlimited)', included: true },
    { name: 'Priority processing', included: true },
    { name: 'Advanced file compression', included: true },
    { name: 'Bulk processing (up to 50 files)', included: true },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-amber-800 to-amber-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-2xl">Upgrade to Premium</h2>
                <p className="text-amber-100 text-sm mt-1">
                  You've used {currentUsage} of {maxFreeUsage} free conversions today
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Free Plan */}
            <Card className="p-6 border-2 border-amber-200 bg-white">
              <div className="text-center mb-6">
                <h3 className="text-xl mb-2 text-amber-900">Free Plan</h3>
                <div className="text-3xl text-amber-800 mb-1">$0</div>
                <p className="text-sm text-amber-700/70">Forever free</p>
              </div>
              
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-amber-900' : 'text-amber-700/50'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Premium Plan */}
            <Card className="p-6 border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl mb-2 text-amber-900 flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-amber-700" />
                  Premium Plan
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl text-amber-800">$9.99</span>
                  <span className="text-sm text-amber-700/70">/month</span>
                </div>
                <p className="text-sm text-amber-700/70 mt-1">or $99/year (save 17%)</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-amber-900">
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium
              </Button>
            </Card>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-sm text-amber-900">
              ✨ <strong>Limited Time Offer:</strong> Get 30% off annual plans with code HERITAGE2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}