import React, { createContext, useContext, useState, useCallback } from 'react';
import { DecisionOption } from '@/types';

interface DecisionOptionsContextType {
  decisionOptions: DecisionOption[];
  setDecisionOptions: React.Dispatch<React.SetStateAction<DecisionOption[]>>;
  generateNewOption: () => Promise<void>;
  fetchDecisionOptions: () => Promise<void>;
  selectedTopicId?: string;
}

const DecisionOptionsContext = createContext<DecisionOptionsContextType | undefined>(undefined);

export function DecisionOptionsProvider({ children, selectedTopicId }: { children: React.ReactNode, selectedTopicId?: string }) {
  const [decisionOptions, setDecisionOptions] = useState<DecisionOption[]>([]);

  const fetchDecisionOptions = useCallback(async () => {
    if (!selectedTopicId) return;
    
    try {
      const response = await fetch(`/api/options/get?topicId=${selectedTopicId}`);
      if (!response.ok) throw new Error('Failed to fetch options');
      const options = await response.json();
      setDecisionOptions(options);
    } catch (error) {
      console.error('Error fetching decision options:', error);
    }
  }, [selectedTopicId]);

  const generateNewOption = useCallback(async () => {
    if (!selectedTopicId) return;

    try {
      const response = await fetch('/api/options/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId: selectedTopicId })
      });

      if (!response.ok) throw new Error('Failed to generate option');
      
      const newOption = await response.json();
      setDecisionOptions(prev => [...prev, newOption]);
    } catch (error) {
      console.error('Error generating option:', error);
    }
  }, [selectedTopicId]);

  return (
    <DecisionOptionsContext.Provider value={{
      decisionOptions,
      setDecisionOptions,
      generateNewOption,
      fetchDecisionOptions,
      selectedTopicId
    }}>
      {children}
    </DecisionOptionsContext.Provider>
  );
}

export const useDecisionOptions = () => {
  const context = useContext(DecisionOptionsContext);
  if (context === undefined) {
    throw new Error('useDecisionOptions must be used within a DecisionOptionsProvider');
  }
  return context;
};
