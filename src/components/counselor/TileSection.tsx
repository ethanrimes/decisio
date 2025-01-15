'use client'

import { useState, useEffect } from 'react'
import { Tile as TileComponent } from './Tile'
import { TileSectionProps, Topic, Tile } from '@/types'
import { UnderstandingMeter } from '@/components/ui/UnderstandingMeter'
import { SelectableTextButton } from '@/components/ui/selectableTextButton'
import { TextInputBox } from '@/components/ui/textInputBox'
import { useTopicContext } from '@/app/counselor/context/TopixContext'
import { X } from 'lucide-react'

function useQuestionGeneration(tile: Tile, selectedTopic: Topic | null) {
  const [question, setQuestion] = useState("")
  const [sampleAnswers, setSampleAnswers] = useState<string[]>([])
  const [understanding, setUnderstanding] = useState(tile.understanding || 0)

  useEffect(() => {
    console.log('useQuestionGeneration effect triggered', {
      tileId: tile.id,
      contentsLength: tile.contents.length,
      contentsSummary: tile.contents.map(c => c.content.substring(0, 20)),
      selectedTopicId: selectedTopic?.id
    });

    const generateQuestions = async () => {
      if (!selectedTopic || !tile) return;

      try {
        const response = await fetch(
          `/api/counselor/tile/generateQuestions?topicId=${selectedTopic.id}&tileId=${tile.id}`
        );

        if (!response.ok) throw new Error('Failed to generate questions');

        const data = await response.json();
        console.log('Generated new questions data:', data);
        setQuestion(data.question);
        setSampleAnswers(data.sampleAnswers);
        setUnderstanding(data.understanding);

      } catch (error) {
        console.error('Error generating questions:', error);
      }
    };

    generateQuestions();
  }, [selectedTopic, tile.contents, tile.id]);

  return { question, sampleAnswers, understanding };
}

export function TileSection({ tile }: TileSectionProps) {
  const [selectedOptions, setSelectedOptions] = useState<Array<{ id: number; label: string }>>([])
  const [, setInputText] = useState('')
  const { selectedTopic, fetchTiles } = useTopicContext()
  const [localTile, setLocalTile] = useState(tile);
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    console.log('Tile prop updated:', {
      tileId: tile.id,
      oldContentsLength: localTile.contents.length,
      newContentsLength: tile.contents.length,
      oldUnderstanding: localTile.understanding,
      newUnderstanding: tile.understanding
    });
    setLocalTile(tile);
  }, [tile]);

  const { question, sampleAnswers, understanding } = useQuestionGeneration(localTile, selectedTopic);

  const handleOptionClick = (optionId: number, label: string) => {
    const option = { id: optionId, label }
    const isSelected = selectedOptions.some(opt => opt.id === optionId)
    
    if (isSelected) {
      setSelectedOptions(prev => prev.filter(opt => opt.id !== optionId))
    } else {
      setSelectedOptions(prev => [...prev, option])
    }
  }

  const handleOptionRemove = (optionId: number) => {
    setSelectedOptions(prev => prev.filter(opt => opt.id !== optionId))
  }

  const handleSubmit = async (text: string) => {
    if (!text.trim() || !selectedTopic) return;

    console.log('Before fetchTiles call:', {
      tileId: tile.id,
      contentsLength: tile.contents.length,
      contents: tile.contents.map(c => ({
        id: c.id,
        content: c.content
      }))
    });

    try {
      const response = await fetch('/api/counselor/message/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `The question I was asked is: "${question}". My answer was for bucket "${tile.sectionName}", if my response information is relevant to this bucket, please attribute my response information to this bucket. My response is the following: ${text}`,
          role: 'u',
          topicId: selectedTopic.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      console.log('Message posted successfully, fetching new tiles...');
      
      // Clear the input and selected options
      setInputText('')
      setSelectedOptions([])

      await fetchTiles();
      
      console.log('After fetchTiles call:', {
        tileId: tile.id,
        contentsLength: tile.contents.length,
        contents: tile.contents.map(c => ({
          id: c.id,
          content: c.content
        }))
      });

    } catch (error) {
      console.error('Error submitting message:', error)
    }
  }

  const handleDeleteTile = async () => {
    if (!selectedTopic || isDeleting) return
    
    if (!confirm('Are you sure you want to delete this tile? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    
    try {
      console.log('TileSection: Starting tile deletion:', tile.id)
      
      const response = await fetch(`/api/counselor/tile/delete?id=${tile.id}`, {
        method: 'DELETE',
      })

      console.log('TileSection: Delete response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('TileSection: Server error details:', errorData)
        throw new Error(`Failed to delete tile: ${errorData.details || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('TileSection: Delete successful:', data)

      // Refresh tiles
      await fetchTiles()
    } catch (error) {
      console.error('TileSection: Error in handleDeleteTile:', error)
      alert('Failed to delete tile. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">{tile.sectionName}</h2>
        <div className="flex items-center space-x-2">
          <div className="w-32">
            <UnderstandingMeter level={understanding} />
          </div>
          <button
            onClick={handleDeleteTile}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            disabled={isDeleting}
            aria-label="Delete tile"
          >
            <X className="h-4 w-4 text-gray-500 hover:text-red-600" />
          </button>
        </div>
      </div>

      <TileComponent
        id={localTile.id}
        contents={localTile.contents}
        onDelete={() => console.log('Delete tile:', localTile.id)}
      />

      {/* Question Section */}
      <div className="mt-4">
        <p className="text-gray-800 font-medium">
          {question}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {sampleAnswers.map((answer, index) => (
          <SelectableTextButton
            key={index} // Using index as key since sampleAnswers may not have unique ids
            label={answer} // Assuming sampleAnswers contains the labels directly
            isSelected={selectedOptions.some(opt => opt.label === answer)}
            onClick={() => handleOptionClick(index, answer)} // Using index for option id
          />
        ))}
      </div>

      {/* Input Box */}
      <div className="mt-4">
        <TextInputBox
          onSubmit={handleSubmit}
          placeholder="Share more about your interests..."
          value={selectedOptions.map(opt => opt.label).join(', ')}
          onChange={setInputText}
          selectedOptions={selectedOptions}
          onOptionRemove={handleOptionRemove}
        />
      </div>
    </div>
  )
} 