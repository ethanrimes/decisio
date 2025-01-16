'use client'

import { useState, useEffect } from 'react'
import { Tile as TileComponent } from './Tile'
import { TileSectionProps, Tile } from '@/types'
import { UnderstandingMeter } from '@/components/ui/UnderstandingMeter'
import { SelectableTextButton } from '@/components/ui/selectableTextButton'
import { useTopicContext } from '@/app/counselor/context/TopixContext'
import { X } from 'lucide-react'
import { BulletStyleInputComponent } from '@/components/ui/bulletStyleInputComponent'

// Define an interface for selected options
interface SelectedOption {
  id: number;
  label: string;
}

export function TileSection({ tile }: TileSectionProps) {
  const [localTile, setLocalTile] = useState<Tile>(tile)
  const { selectedTopic, fetchTiles } = useTopicContext()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])
  const [bulletPoints, setBulletPoints] = useState<string[]>([])
  const [needsQuestion, setNeedsQuestion] = useState(!tile.question)
  const [isDeleting, setIsDeleting] = useState(false)

  const generateQuestionsForTile = async () => {
    if (!selectedTopic?.id || !localTile.id || isGenerating || !needsQuestion) return;

    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/counselor/tile/generateQuestions?topicId=${selectedTopic.id}&tileId=${localTile.id}`
      );

      if (!response.ok) throw new Error('Failed to generate questions');

      const data = await response.json();
      
      setLocalTile(prevTile => ({
        ...prevTile,
        question: data.question,
        answerOptions: data.sampleAnswers,
        understanding: data.understanding
      }));
      
      setNeedsQuestion(false);

    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQuestionsForTile();
  }, [selectedTopic?.id, localTile.id, needsQuestion, isGenerating]);

  const handleSubmit = async (bullets: string[]) => {
    if (!selectedTopic) return;

    try {
      // Filter out empty or placeholder bullets
      const validBullets = bullets.filter(bullet => 
        bullet.trim() !== '' && 
        bullet !== 'Please enter response...' &&
        bullet !== 'Enter your response...'
      );

      if (validBullets.length === 0) return;

      // Update local tile contents
      setLocalTile(prev => ({
        ...prev,
        contents: [
          ...prev.contents,
          ...validBullets.map(content => ({
            id: '', // temporary id, will be replaced by server
            content,
            createdAt: new Date(),
            modifiedAt: new Date(),
            tileId: prev.id
          }))
        ]
      }));

      // Post to server
      const response = await fetch('/api/counselor/tilecontent/postMany', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: validBullets,
          tileId: localTile.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save bullet points');
      }

      // Set needs question to true to trigger new question generation
      setNeedsQuestion(true);

      // Clear inputs
      setBulletPoints([])
      setSelectedOptions([])

      // Refresh tiles
      await fetchTiles();

    } catch (error) {
      console.error('Error submitting bullet points:', error);
    }
  };

  // Handle option selection/deselection
  const handleOptionClick = (optionId: number, label: string) => {
    console.log('Clicked option:', label);
    const option = { id: optionId, label };
    const isSelected = selectedOptions.some(opt => opt.id === optionId);
  
    if (isSelected) {
      setSelectedOptions(prev => prev.filter(opt => opt.id !== optionId));
      setBulletPoints(prev => prev.filter(point => point !== label));
    } else {
      setSelectedOptions(prev => [...prev, option]);
      setBulletPoints(prev => [...prev, label]);
    }
    console.log('Updated bulletPoints:', bulletPoints);
  };

  // Handle bullet point updates from BulletStyleInputComponent
  const handleBulletPointsChange = (newBullets: string[]) => {
    console.log('Bullet points changed:', newBullets);
  
    // Update bullet points state
    setBulletPoints(newBullets);
  
    // Update selected options based on bullet points
    setSelectedOptions(prev => {
      // 1. Filter out options no longer present in `newBullets`
      const updatedOptions = prev.filter(option => newBullets.includes(option.label));
  
      // 2. Add missing options that exist in `newBullets`
      const missingOptions = newBullets
        .filter(bullet => !updatedOptions.some(opt => opt.label === bullet))
        .map(bullet => ({
          id: Date.now() + Math.random(), // Generate unique ID for new options
          label: bullet,
        }));
  
      return [...updatedOptions, ...missingOptions];
    });
  };

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
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header section with dark shading */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{localTile.sectionName}</h2>
          <div className="flex items-center space-x-2">
            <div className="w-32">
              <UnderstandingMeter level={localTile.understanding} />
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
      </div> 

      {/* Main content section */}
      <div className="p-4">
        <TileComponent
          id={localTile.id}
          contents={localTile.contents}
          onDelete={() => console.log('Delete tile:', localTile.id)}
        />

        {/* Response section with outline */}
        <div className="mt-4 border border-gray-200 rounded-lg p-4">
          {/* Question Section - now inside the border */}
          <div className="mb-4">
            <p className="text-gray-800 font-medium">
              {localTile.question}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {localTile.answerOptions.map((answer, index) => (
              <SelectableTextButton
                key={index}
                label={answer}
                isSelected={selectedOptions.some(opt => opt.label === answer)}
                onClick={() => handleOptionClick(index, answer)}
              />
            ))}
          </div>

          {/* Input Box */}
          <div className="mt-4">
            <BulletStyleInputComponent
              onSubmit={handleSubmit}
              initialBullets={bulletPoints}
              onBulletsChange={handleBulletPointsChange}
              placeholder="Enter your response..."
            />
          </div>
        </div>
      </div>
    </div>
  )
} 