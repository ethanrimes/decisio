'use client'

import { useState } from 'react'
import { ChevronLeft, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarProps, Topic } from '@/types'
import { useTopicContext } from '@/app/counselor/context/TopixContext'
import Icon from './IconComponent'
import { NewDecisionPopup } from '../landing/NewDecisionPopup'

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const { topics, selectedTopic, setSelectedTopic, setTopics } = useTopicContext()
  const [isNewDecisionOpen, setIsNewDecisionOpen] = useState(false)

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
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
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic)}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors w-full text-left',
                selectedTopic?.id === topic.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon 
                iconName={topic.icon} 
                size={20}
                color={selectedTopic?.id === topic.id ? 'white' : 'currentColor'}
              />
              <span>{topic.shortName || topic.fullName}</span>
            </button>
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
