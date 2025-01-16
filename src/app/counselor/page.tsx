'use client'

import { useState, useEffect } from 'react'
import { NotesHeader } from '@/components/counselor/NotesHeader'
import { TileSection } from '@/components/counselor/TileSection'
import { DecisionCard } from '@/components/options/OptionSummary'
import { Chat } from '@/components/counselor/Chat'
import { useTopicContext } from './context/TopixContext'
import { AddTilePopup } from '@/components/counselor/AddTilePopup'
import { DecisionOptionsProvider, useDecisionOptions } from './context/DecisionOptionContext'

function CounselorPageContent() {
  const [activeView, setActiveView] = useState<'details' | 'options'>('details')
  const { tiles, isLoading, error, fetchTiles, selectedTopic } = useTopicContext()
  const [isAddTileOpen, setIsAddTileOpen] = useState(false)
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false)
  const { decisionOptions, generateNewOption, fetchDecisionOptions } = useDecisionOptions()

  // Fetch existing decision options when topic changes
  useEffect(() => {
    if (selectedTopic?.id) {
      fetchDecisionOptions()
    }
  }, [selectedTopic?.id, fetchDecisionOptions])

  const generateThreeOptions = async () => {
    setIsGeneratingOptions(true)
    try {
      await Promise.all([
        generateNewOption(),
        generateNewOption(),
        generateNewOption()
      ])
    } finally {
      setIsGeneratingOptions(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'accepted' | 'rejected', reason?: string) => {
    // Existing status change handling logic
    console.log('Status change:', id, status, reason)
  }

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
      setIsAddTileOpen(false)
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
              {decisionOptions.length === 0 ? (
                <div className="text-center py-8">
                  <button
                    onClick={generateThreeOptions}
                    disabled={isGeneratingOptions}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors disabled:bg-gray-400"
                  >
                    {isGeneratingOptions ? 'Generating Options...' : 'Generate Options'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {decisionOptions.map((option) => (
                    <DecisionCard 
                      key={option.id} 
                      option={option}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
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

export default function CounselorPage() {
  const { selectedTopic } = useTopicContext()
  
  return (
    <DecisionOptionsProvider selectedTopicId={selectedTopic?.id}>
      <CounselorPageContent />
    </DecisionOptionsProvider>
  )
}