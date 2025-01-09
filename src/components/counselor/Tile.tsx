'use client'

import { useState } from 'react'
import { MoreHorizontal, X } from 'lucide-react'
import { TileProps } from '@/types'

export function Tile({ title, content, category, onDelete }: TileProps) {
  const [isHovered, setIsHovered] = useState(false)

  const categoryColors = {
    goals: 'border-blue-200 bg-blue-50',
    preferences: 'border-green-200 bg-green-50',
    options: 'border-purple-200 bg-purple-50',
    constraints: 'border-red-200 bg-red-50'
  }

  return (
    <div 
      className={`relative p-4 rounded-lg border ${categoryColors[category]} hover:shadow-md transition-shadow`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {isHovered && (
          <div className="flex gap-1">
            <button className="p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            {onDelete && (
              <button 
                onClick={onDelete}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-600">{content}</p>
    </div>
  )
} 