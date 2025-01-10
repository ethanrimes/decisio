'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Topic, TopicContextType } from '@/types'

const TopicContext = createContext<TopicContextType | undefined>(undefined)

export function useTopicContext() {
  const context = useContext(TopicContext)
  if (context === undefined) {
    throw new Error('useTopicContext must be used within a TopicProvider')
  }
  return context
}

export function TopicProvider({ children }: { children: React.ReactNode }) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/counselor/topic/get')
        if (!response.ok) {
          throw new Error('Failed to fetch topics')
        }
        const data = await response.json()
        setTopics(data)
        // Set the first topic as selected if there are topics and none is selected
        if (data.length > 0 && !selectedTopic) {
          setSelectedTopic(data[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load topics')
        console.error('Error fetching topics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [selectedTopic])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <TopicContext.Provider value={{ 
      selectedTopic, 
      setSelectedTopic,
      topics,
      setTopics,
      isLoading,
      error 
    }}>
      {children}
    </TopicContext.Provider>
  )
}