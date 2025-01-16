'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AddTilePopupProps } from '@/types'

export function AddTilePopup({ isOpen, onClose, onSubmit }: AddTilePopupProps) {
  const [sectionName, setSectionName] = useState('')
  const [content, setContent] = useState([''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ sectionName, content })
    setSectionName('')
    setContent([''])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add New Tile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Name
            </label>
            <input
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter section name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            {content.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newContent = [...content]
                    newContent[index] = e.target.value
                    setContent(newContent)
                  }}
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter content item"
                  required
                />
                {content.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newContent = content.filter((_, i) => i !== index)
                      setContent(newContent)
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
              onClick={() => setContent([...content, ''])}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              + Add another item
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Add Tile
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 