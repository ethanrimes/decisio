'use client'

import { useState } from 'react'
import { Tile as TileComponent } from './Tile'
import { TileSectionProps } from '@/types'
import { UnderstandingMeter } from '@/components/ui/UnderstandingMeter'
import { SelectableTextButton } from '@/components/ui/selectableTextButton'
import { TextInputBox } from '@/components/ui/textInputBox'

// Sample options - these would typically come from props or an API
const sampleOptions = [
  { id: 1, label: "Medicine & Healthcare" },
  { id: 2, label: "Law & Legal Services" },
  { id: 3, label: "Software Engineering" },
  { id: 4, label: "Business Consulting" },
  { id: 5, label: "Academic Research" },
  { id: 6, label: "Public Policy" }
];

export function TileSection({ tile }: TileSectionProps) {
  const [selectedOptions, setSelectedOptions] = useState<Array<{ id: number; label: string }>>([])
  const [inputText, setInputText] = useState('')

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

  const handleSubmit = (text: string) => {
    console.log('Submitted:', text)
    setInputText('')
    setSelectedOptions([])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">{tile.sectionName}</h2>
        <div className="flex items-center space-x-2">
          <div className="w-32">
            <UnderstandingMeter level={tile.understanding || 0} />
          </div>
        </div>
      </div>

      <TileComponent
        id={tile.id}
        contents={tile.contents}
        onDelete={() => console.log('Delete tile:', tile.id)}
      />

      {/* Question Section */}
      <div className="mt-4">
        <p className="text-gray-800 font-medium">
          What specific aspects of {tile.sectionName} interest you the most?
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {sampleOptions.map((option) => (
          <SelectableTextButton
            key={option.id}
            label={option.label}
            isSelected={selectedOptions.some(opt => opt.id === option.id)}
            onClick={() => handleOptionClick(option.id, option.label)}
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
  );
} 