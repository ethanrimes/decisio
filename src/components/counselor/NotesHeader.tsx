'use client'

import { Pencil } from 'lucide-react'
import { NotesHeaderProps } from '@/types'

export function NotesHeader({ activeView, onViewChange }: NotesHeaderProps) {
  return (
    <div className="border-b bg-white sticky top-0 z-10">
      <div className="flex items-center h-14 px-4">
        <Pencil className="h-5 w-5 text-gray-500 mr-2" />
        <h1 className="text-xl font-semibold">Discussion</h1>
      </div>
      <div className="flex px-4 gap-4 h-12">
        <button 
          className={`text-gray-600 hover:text-gray-900 border-b-2 ${
            activeView === 'details' 
              ? 'border-indigo-500 text-gray-900' 
              : 'border-transparent'
          }`}
          onClick={() => onViewChange('details')}
        >
          Details
        </button>
        <button 
          className={`text-gray-600 hover:text-gray-900 border-b-2 ${
            activeView === 'options' 
              ? 'border-indigo-500 text-gray-900' 
              : 'border-transparent'
          }`}
          onClick={() => onViewChange('options')}
        >
          Options
        </button>
      </div>
    </div>
  )
} 