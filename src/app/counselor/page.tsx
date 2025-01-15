'use client'

import { useState } from 'react'
import { NotesHeader } from '@/components/counselor/NotesHeader'
import { TileSection } from '@/components/counselor/TileSection'
import { OptionSummary } from '@/components/counselor/OptionSummary'
import { Chat } from '@/components/counselor/Chat'
import { useTopicContext } from './context/TopixContext'
import { AddTilePopup } from '@/components/counselor/AddTilePopup'

const optionSummaries = [
  {
    title: "Option A",
    description: "Tech Startup in San Francisco",
    metrics: [
      { label: "Salary Range", value: "$120k-150k" },
      { label: "Work-Life Balance", value: "8/10" },
      { label: "Growth Potential", value: "High" },
    ]
  },
  {
    title: "Option B",
    description: "Enterprise Company in NYC",
    metrics: [
      { label: "Salary Range", value: "$140k-170k" },
      { label: "Work-Life Balance", value: "7/10" },
      { label: "Growth Potential", value: "Medium" },
    ]
  },
  {
    title: "Option C",
    description: "Remote Consulting Firm",
    metrics: [
      { label: "Salary Range", value: "$110k-140k" },
      { label: "Work-Life Balance", value: "9/10" },
      { label: "Growth Potential", value: "Medium-High" },
    ]
  }
]

export default function CounselorPage() {
  const [activeView, setActiveView] = useState<'details' | 'options'>('details')
  const { tiles, isLoading, error, fetchTiles, selectedTopic } = useTopicContext()
  const [isAddTileOpen, setIsAddTileOpen] = useState(false)

  const handleAddTile = async ({ sectionName, content }: { sectionName: string, content: string[] }) => {
    try {
      const response = await fetch('/api/counselor/tile/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionName,
          content,
          topicId: selectedTopic?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create tile')
      }

      await fetchTiles()
    } catch (error) {
      console.error('Error creating tile:', error)
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-2/3 bg-white overflow-auto">
        <div className="w-full">
          <NotesHeader 
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </div>

        <div className="p-6 flex flex-col h-[calc(100vh-4rem)]">
          {/* Details View */}
          <div className={`${activeView === 'details' ? 'flex flex-col flex-1' : 'hidden'}`}>
            <div className="flex-1 overflow-y-auto mb-4">
              {isLoading ? (
                <div>Loading tiles...</div>
              ) : error ? (
                <div>Error: {error}</div>
              ) : (
                <div className="space-y-8">
                  {tiles.map((tile) => (
                    <TileSection
                      key={tile.id}
                      tile={tile}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Button fixed at bottom */}
            <div className="flex-shrink-0">
              {!isLoading && (
                <button
                  onClick={() => setIsAddTileOpen(true)}
                  className="w-full py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Add Tile
                </button>
              )}
            </div>
          </div>

          {/* Options View */}
          <div className={`${activeView === 'options' ? 'block' : 'hidden'}`}>
            <div className="h-[calc(100vh-10rem)] overflow-y-auto">
              <div className="grid grid-cols-3 gap-6">
                {optionSummaries.map((option, index) => (
                  <OptionSummary
                    key={index}
                    title={option.title}
                    description={option.description}
                    metrics={option.metrics}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar with chat */}
      <div className="w-1/3 bg-gray-50 border-l">
        <Chat />
      </div>

      <AddTilePopup
        isOpen={isAddTileOpen}
        onClose={() => setIsAddTileOpen(false)}
        onSubmit={handleAddTile}
      />
    </div>
  )
}
