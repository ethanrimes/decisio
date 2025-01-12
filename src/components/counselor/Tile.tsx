'use client'

import { useState } from 'react'
import { MoreHorizontal, X, Check, Pencil } from 'lucide-react'
import { TileProps } from '@/types'
import { useTopicContext } from '@/app/counselor/context/TopixContext'

export function Tile({ id, content: initialContent, onDelete }: TileProps) {
  const { fetchTiles } = useTopicContext()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [localContent, setLocalContent] = useState(initialContent)
  const [editedContent, setEditedContent] = useState(initialContent)

  const handleSave = async () => {
    try {
      const payload = {
        id,
        content: editedContent,
      }

      const response = await fetch('/api/counselor/tile/patch', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to update tile')
      }
      setLocalContent(editedContent)
      setIsEditing(false)
      await fetchTiles()
    } catch (error) {
      console.error('Error updating tile:', error)
      setEditedContent(localContent)
    }
  }

  if (isEditing) {
    return (
      <div className="relative p-4 rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col gap-2">
          {editedContent.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newContent = [...editedContent]
                  newContent[index] = e.target.value
                  setEditedContent(newContent)
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {editedContent.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newContent = editedContent.filter((_, i) => i !== index)
                    setEditedContent(newContent)
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setEditedContent([...editedContent, ''])}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            + Add another item
          </button>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setIsEditing(false)
                setEditedContent(localContent)
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Check className="h-4 w-4 text-green-500" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ul className="list-disc pl-4 space-y-1">
            {localContent.map((item, index) => (
              <li key={index} className="text-sm text-gray-600">
                {item}
              </li>
            ))}
          </ul>
        </div>
        {isHovered && (
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Pencil className="h-4 w-4 text-gray-500" />
            </button>
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
    </div>
  )
}