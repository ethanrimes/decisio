'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Topic, Tile, TopicContextType } from '@/types'

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
  const [tiles, setTiles] = useState<Tile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      return data[0] // Return first topic for chaining
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics')
      console.error('Error fetching topics:', err)
      return null
    }
  }

  const fetchTiles = async (topicId: string) => {
    try {
      const response = await fetch(`/api/counselor/tile/get?topicId=${topicId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch tiles')
      }
      const data = await response.json()
      setTiles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tiles')
      console.error('Error fetching tiles:', err)
    }
  }

  // Combined fetch operation
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const firstTopic = await fetchTopics()
        if (firstTopic) {
          await fetchTiles(firstTopic.id)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, []) // Only runs on mount

  // Update tiles when selected topic changes (but not on initial mount)
  useEffect(() => {
    if (selectedTopic) {
      setIsLoading(true)
      fetchTiles(selectedTopic.id).finally(() => setIsLoading(false))
    } else {
      setTiles([])
    }
  }, [selectedTopic?.id]) // Only depends on selectedTopic.id

  return (
    <TopicContext.Provider value={{ 
      selectedTopic, 
      setSelectedTopic,
      topics,
      setTopics,
      tiles,
      setTiles,
      isLoading,
      error,
      fetchTopics,
      fetchTiles: () => selectedTopic ? fetchTiles(selectedTopic.id) : Promise.resolve()
    }}>
      {children}
    </TopicContext.Provider>
  )
}