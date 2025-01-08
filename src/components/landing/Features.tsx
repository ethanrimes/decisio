import React from 'react';
import { UserIcon } from 'lucide-react';
import { Feature } from '@/types';

export const Features: React.FC = () => {
    const features: Feature[] = [
      {
        icon: <UserIcon className="w-6 h-6" />,
        title: 'Personalized Guidance',
        description: 'AI-powered career advice tailored to your unique skills and goals'
      },
      // Add more features...
    ];
  
    return (
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card text-center">
                <div className="icon-container mb-6 mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  