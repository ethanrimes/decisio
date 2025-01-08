import React from 'react';
import { Button } from '@/components/ui/button';
import { PricingTier } from '@/types';


export const Pricing: React.FC = () => {
    const tiers: PricingTier[] = [
      {
        name: 'Free',
        price: 0,
        description: 'Basic career analysis preview',
        features: [
          'Single basic analysis',
          'Basic skill gap identification',
          'Limited learning resources',
          'Basic career recommendations'
        ],
        buttonText: 'Get Started'
      },
      // Add more tiers...
    ];
  
    return (
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl bg-white p-8 ${
                  tier.isPopular ? 'border-2 border-indigo-500' : 'border border-gray-200'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      {/* <CheckIcon className="w-5 h-5 text-green-500" /> */}
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={tier.isPopular ? 'bg-indigo-600' : 'bg-gray-900'}
                >   
                  {tier.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  