'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { NewDecisionPopupProps } from '@/types'

export function NewDecisionPopup({ isOpen, onClose, onSubmit }: NewDecisionPopupProps) {
  const [decision, setDecision] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (decision.trim()) {
      onSubmit(decision)
      setDecision('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold mb-2">
            What decision are you trying to make?
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Be as specific as possible to receive the most relevant guidance
          </p>

          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            className="w-full h-48 p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe the decision you need help with..."
            autoFocus
          />

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={!decision.trim()}
            >
              Consult
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}