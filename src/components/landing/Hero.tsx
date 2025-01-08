import React from 'react';
import { Button } from '@/components/ui/button';

export const Hero: React.FC = () => {
    return (
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8">
              Your Personal{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500">
                AI Career Guide
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              Navigate your career journey with confidence using personalized AI-powered guidance
            </p>
            <Button size="lg" className="mb-16 group">
              Start Your Career Analysis
            </Button>
          </div>
        </div>
      </section>
    );
  };