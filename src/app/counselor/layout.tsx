'use client'

import React, { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/counselor/Sidebar'
import { DashboardHeader } from '@/components/counselor/Header'
import { Topic, PageProps } from '@/types'

interface LayoutProps {
  children: React.ReactNode
}

export default function CounselorLayout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        if (data.length > 0 && !selectedTopicId) {
          setSelectedTopicId(data[0].id)
        }
      } catch (err) {
        console.error('Error fetching topics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [selectedTopicId])

  // Update selectedTopic whenever selectedTopicId changes
  useEffect(() => {
    if (selectedTopicId && topics.length > 0) {
      const topic = topics.find(t => t.id === selectedTopicId) || null
      setSelectedTopic(topic)
    }
  }, [selectedTopicId, topics])

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Clone and modify children to pass selectedTopic as prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<PageProps>, {
        selectedTopic
      })
    }
    return child
  })

  return (
    <div className="flex h-screen bg-white">
      {!isLoading && (
        <>
          <DashboardSidebar 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            topics={topics}
            selectedTopicId={selectedTopicId}
            onTopicSelect={handleTopicSelect}
          />
          <div className="flex flex-col flex-1">
            <DashboardHeader 
              isSidebarOpen={isSidebarOpen} 
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
            <div className="flex-1 overflow-hidden">
              {childrenWithProps}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
