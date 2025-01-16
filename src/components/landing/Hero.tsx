'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NewDecisionPopup } from './NewDecisionPopup';

export const Hero: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleJourneyClick = () => {
      if (session?.user) {
        setIsPopupOpen(true);
      } else {
        router.push('/auth/login');
      }
    };

    const handleDecisionSubmit = (decision: string) => {
      // Handle the decision submission here
      console.log('Decision:', decision);
      router.push('/counselor'); // or wherever you want to redirect
    };

    return (
      <>
        <section className={`pt-32 pb-16 ${isPopupOpen ? 'blur-sm' : ''} transition-all duration-200`}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8">
                Your Personal{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500">
                  AI Coach
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
                Navigate life&apos;s toughest decisions with confidence using personalized AI-powered guidance
              </p>
              <Button 
                size="lg" 
                className="mb-16 group"
                onClick={handleJourneyClick}
              >
                Begin Your Journey
                {session?.user ? ' →' : ' - Sign In'}
              </Button>
            </div>
          </div>
        </section>

        <NewDecisionPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onSubmit={handleDecisionSubmit}
        />
      </>
    );
  };