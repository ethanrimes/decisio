'use client'

import { NotesHeaderProps } from '@/types'
import Icon from './IconComponent'
import { useTopicContext } from '@/app/counselor/context/TopixContext'

export function NotesHeader({ 
  activeView, 
  onViewChange,
}: NotesHeaderProps) {
  const { selectedTopic } = useTopicContext()
  
  if (!selectedTopic) return null

  return (
    <div className="border-b">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 mb-1">
          <Icon 
            iconName={selectedTopic.icon} 
            size={24} 
            color="currentColor"
          />
          <h1 className="text-xl font-semibold">
            {selectedTopic.shortName || selectedTopic.fullName}
          </h1>
        </div>
        <p className="text-gray-500 italic ml-9">
          {selectedTopic.shortName ? selectedTopic.fullName : null}
        </p>
      </div>

      <div className="px-6 pb-3 flex gap-4">
        <button
          onClick={() => onViewChange('details')}
          className={`px-3 py-1 rounded-md transition-colors ${
            activeView === 'details'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => onViewChange('options')}
          className={`px-3 py-1 rounded-md transition-colors ${
            activeView === 'options'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Options
        </button>
      </div>
    </div>
  )
} 