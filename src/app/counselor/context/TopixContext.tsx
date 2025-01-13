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
      console.log('TopicContext: Fetching tiles for topicId:', topicId);
      const response = await fetch(`/api/counselor/tile/get?topicId=${topicId}`);
      console.log('TopicContext: Tile fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tiles');
      }
      
      const data = await response.json();
      console.log('TopicContext: Received tiles data:', data);
      setTiles(data);
    } catch (err) {
      console.error('TopicContext: Error fetching tiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tiles');
    }
  }

  // Combined fetch operation
  useEffect(() => {
    const fetchData = async () => {
      console.log('TopicContext: Initial data fetch started');
      setIsLoading(true);
      try {
        const firstTopic = await fetchTopics();
        console.log('TopicContext: First topic fetched:', firstTopic);
        if (firstTopic) {
          await fetchTiles(firstTopic.id);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Update tiles when selected topic changes
  useEffect(() => {
    console.log('TopicContext: Selected topic changed:', selectedTopic);
    if (selectedTopic) {
      setIsLoading(true);
      fetchTiles(selectedTopic.id).finally(() => setIsLoading(false));
    } else {
      setTiles([]);
    }
  }, [selectedTopic?.id]);

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