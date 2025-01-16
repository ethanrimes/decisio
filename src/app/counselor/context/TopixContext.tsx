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
    if (!topicId) {
      console.error('TopicContext: No topicId provided to fetchTiles');
      return;
    }

    // Log current tiles and their contents
    console.log('TopicContext: Current tiles before fetch:', tiles.map(tile => ({
      tileId: tile.id,
      contents: tile.contents.map(c => ({
        id: c.id,
        content: c.content
      }))
    })));

    console.log('TopicContext: Fetching tiles for topicId:', topicId);
    
    try {
      const response = await fetch(`/api/counselor/tile/get?topicId=${topicId}`);
      console.log('TopicContext: Tile fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tiles: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log fetched tiles and their contents
      console.log('TopicContext: Received tiles data:', data.map(tile => ({
        tileId: tile.id,
        contents: tile.contents.map(c => ({
          id: c.id,
          content: c.content
        }))
      })));

      // line to fix
      setTiles(() => data);  // Force state update
      
      return data;
    } catch (error) {
      console.error('TopicContext: Error fetching tiles:', error);
      throw error;
    }
  };

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

  useEffect(() => {
    console.log('TopicContext: Tiles state updated, here is new react hook log:', tiles.map(tile => ({
      tileId: tile.id,
      contents: tile.contents.map(c => ({
        id: c.id,
        content: c.content
      }))
    })));
  }, [tiles]); // This will run whenever tiles state actually updates

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