'use client'

import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarProps, Topic } from '@/types'
import { useTopicContext } from '@/app/counselor/context/TopixContext'
import Icon from './IconComponent'

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const { topics, selectedTopic, setSelectedTopic } = useTopicContext()

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic)
  }

  return (
    <div className={cn(
      'bg-white border-r transition-all duration-300 overflow-hidden',
      isOpen ? 'w-64' : 'w-0 hidden'
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <h1 className="font-semibold text-xl">Dashboard</h1>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded-md">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="p-4 space-y-2">
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
    </div>
  )
}
