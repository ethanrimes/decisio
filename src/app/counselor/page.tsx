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
        {/* Removed the extra flex justify-between containers that were constraining width */}
        <div className="w-full">
          <NotesHeader 
            activeView={activeView}
            onViewChange={setActiveView}
          />
          <div className="px-6">
            <button
              onClick={() => setIsAddTileOpen(true)}
              className="mt-2 py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              Add Tile
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Details View */}
          <div className={`${activeView === 'details' ? 'block' : 'hidden'}`}>
            <div className="space-y-8 h-[calc(100vh-10rem)] overflow-y-auto">
              {isLoading ? (
                <div>Loading tiles...</div>
              ) : error ? (
                <div>Error: {error}</div>
              ) : (
                tiles.map((tile) => (
                  <TileSection
                    key={tile.id}
                    tile={tile}
                  />
                ))
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

      {/* Right sidebar with chat (1/3) */}
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
