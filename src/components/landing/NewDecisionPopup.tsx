'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { NewDecisionPopupProps } from '@/types'

export function NewDecisionPopup({ isOpen, onClose, onSubmit }: NewDecisionPopupProps) {
  const [decision, setDecision] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (decision.trim()) {
      setIsLoading(true)
      try {
        // Get OpenAI response
        const aiResponse = await fetch('/api/openai/create-topic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: decision }),
        })

        const data = await aiResponse.json()
        console.log('OpenAI response:', data)
        if (!aiResponse.ok) throw new Error(data.error)

        // Validate Lucide icon
        console.log('Using icon:', data.iconName)

        // Create topic in database
        const topicResponse = await fetch('/api/counselor/topic/post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: decision,
            shortName: data.summary,
            icon: data.iconName,
          }),
        })

        console.log('Topic response status:', topicResponse.status)
        const topicData = await topicResponse.json()
        console.log('Topic response data:', topicData)

        if (!topicResponse.ok) {
          throw new Error(topicData.error || 'Failed to create topic')
        }

        // // Update the topic's image using PATCH
        // const patchResponse = await fetch('/api/counselor/topic/patch', {
        //   method: 'PATCH',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     topicId: topicData.id,
        //     icon: data.iconName,
        //   }),
        // })

        // if (!patchResponse.ok) {
        //   console.error('Failed to update topic icon')
        // }

        onSubmit(decision, data.summary, data.iconName)
        setDecision('')
        onClose()
      } catch (error) {
        console.error('Detailed error:', error)
        // Handle error (you might want to show an error message to the user)
      } finally {
        setIsLoading(false)
      }
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
              disabled={!decision.trim() || isLoading}
            >
              {isLoading ? 'Processing...' : 'Consult'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}