// context/LoadingContext.tsx
'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LoadingOperation, LoadingContextType } from '@/types';

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingOperations, setLoadingOperations] = useState<LoadingOperation[]>([]);

  const addLoadingOperation = useCallback((id: string, options?: { message?: string }) => {
    setLoadingOperations(prev => [...prev, {
      id,
      message: options?.message,
      progress: 0,
      startTime: Date.now()
    }]);
  }, []);

  const removeLoadingOperation = useCallback((id: string) => {
    setLoadingOperations(prev => prev.filter(op => op.id !== id));
  }, []);

  const updateProgress = useCallback((id: string, progress: number) => {
    setLoadingOperations(prev => prev.map(op => 
      op.id === id ? { ...op, progress: Math.min(Math.max(progress, 0), 100) } : op
    ));
  }, []);

  // Get the earliest operation for progress display
  const earliestOperation = loadingOperations[0];

  return (
    <LoadingContext.Provider value={{
      addLoadingOperation,
      removeLoadingOperation,
      updateProgress,
      isLoading: loadingOperations.length > 0,
      currentOperations: loadingOperations
    }}>
      {children}
      {loadingOperations.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <div className="space-y-4">
              {/* Loading spinner */}
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
              
              {/* Operation count */}
              <div className="text-center text-sm text-gray-600">
                {loadingOperations.length} active operation{loadingOperations.length !== 1 ? 's' : ''}
              </div>

              {/* Current operation details */}
              {earliestOperation && (
                <div className="space-y-2">
                  {earliestOperation.message && (
                    <div className="text-sm text-gray-700 text-center">
                      {earliestOperation.message}
                    </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${earliestOperation.progress}%` }}
                    />
                  </div>
                  
                  {/* Progress percentage */}
                  <div className="text-xs text-gray-500 text-center">
                    {Math.round(earliestOperation.progress)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

// Custom hook for using the loading context
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Enhanced loading callback hook with progress updates
export function useLoadingCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  id: string,
  options?: {
    message?: string;
    onProgress?: (progress: number) => void;
  }
) {
  const { addLoadingOperation, removeLoadingOperation, updateProgress } = useLoading();

  return useCallback(
    async (...args: Parameters<T>) => {
      try {
        addLoadingOperation(id, { message: options?.message });
        const result = await callback(...args);
        
        // If the callback provides progress updates
        if (options?.onProgress) {
          const originalOnProgress = options.onProgress;
          options.onProgress = (progress: number) => {
            updateProgress(id, progress);
            originalOnProgress(progress);
          };
        }
        
        return result;
      } finally {
        removeLoadingOperation(id);
      }
    },
    [callback, id, options?.message, options?.onProgress, addLoadingOperation, removeLoadingOperation, updateProgress]
  ) as T;
}