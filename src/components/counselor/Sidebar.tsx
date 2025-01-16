'use client'

import { useState } from 'react'
import { ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarProps, Topic } from '@/types'
import { useTopicContext } from '@/app/counselor/context/TopixContext'
import Icon from './IconComponent'
import { NewDecisionPopup } from '../landing/NewDecisionPopup'

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const { topics, selectedTopic, setSelectedTopic, setTopics } = useTopicContext()
  const [isNewDecisionOpen, setIsNewDecisionOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
  }

  const handleDeleteTopic = async (e: React.MouseEvent, topicId: string) => {
    e.stopPropagation()
    
    console.log('Sidebar: Starting delete process for topic:', topicId)
    
    if (isDeleting) {
      console.log('Sidebar: Delete already in progress, skipping')
      return
    }
    
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      console.log('Sidebar: User cancelled deletion')
      return
    }

    setIsDeleting(true)
    console.log('Sidebar: Set isDeleting to true')

    try {
      console.log('Sidebar: Sending DELETE request')
      const response = await fetch(`/api/counselor/topic/delete?id=${topicId}`, {
        method: 'DELETE',
      })

      console.log('Sidebar: Received response:', {
        ok: response.ok,
        status: response.status
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Sidebar: Server error details:', errorData)
        throw new Error(`Failed to delete topic: ${errorData.details || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('Sidebar: Delete successful:', data)

      // Remove topic from local state
      setTopics(prevTopics => {
        console.log('Sidebar: Updating topics state', {
          previousCount: prevTopics.length,
          newCount: prevTopics.length - 1
        })
        return prevTopics.filter(t => t.id !== topicId)
      })
      
      // If deleted topic was selected, clear selection
      if (selectedTopic?.id === topicId) {
        console.log('Sidebar: Clearing selected topic')
        setSelectedTopic(null)
      }
    } catch (error) {
      console.error('Sidebar: Error in handleDeleteTopic:', {
        error,
        message: error.message,
        stack: error.stack
      })
      alert('Failed to delete topic. Please try again.')
    } finally {
      console.log('Sidebar: Setting isDeleting to false')
      setIsDeleting(false)
    }
  }

  const handleNewDecisionSubmit = async (decision: string, summary: string, iconName: string) => {
    // Close the popup first
    setIsNewDecisionOpen(false)

    // Fetch updated topics
    await fetchTopics()
  }

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/counselor/topic/get')
      if (!response.ok) {
        throw new Error('Failed to fetch topics')
      }
      const data = await response.json()
      setTopics(data)
    } catch (err) {
      console.error('Error refreshing topics:', err)
    }
  }

  return (
    <>
      <div className={cn(
        'bg-white border-r transition-all duration-300 overflow-hidden flex flex-col',
        isOpen ? 'w-64' : 'w-0 hidden'
      )}>
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 border-b">
          <h1 className="font-semibold text-xl">Dashboard</h1>
          <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded-md">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={cn(
                'group flex items-center justify-between px-3 py-2 rounded-md transition-colors w-full',
                selectedTopic?.id === topic.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <button
                onClick={() => handleTopicSelect(topic)}
                className="flex-1 flex items-center space-x-2 text-left"
              >
                <Icon 
                  iconName={topic.icon} 
                  size={20}
                  color={selectedTopic?.id === topic.id ? 'white' : 'currentColor'}
                />
                <span>{topic.shortName || topic.fullName}</span>
              </button>
              
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handleDeleteTopic(e, topic.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDeleteTopic(e, topic.id);
                  }
                }}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-pointer",
                  selectedTopic?.id === topic.id
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-200"
                )}
                aria-label="Delete topic"
                disabled={isDeleting}
              >
                <Trash2 className={cn(
                  "w-4 h-4",
                  selectedTopic?.id === topic.id
                    ? "text-gray-300 hover:text-red-400"
                    : "text-gray-500 hover:text-red-600"
                )} />
              </span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => setIsNewDecisionOpen(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Decision</span>
          </button>
        </div>
      </div>

      <NewDecisionPopup
        isOpen={isNewDecisionOpen}
        onClose={() => setIsNewDecisionOpen(false)}
        onSubmit={handleNewDecisionSubmit}
      />
    </>
  )
}
