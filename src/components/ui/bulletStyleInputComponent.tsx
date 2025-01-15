'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Send } from 'lucide-react'
import { BulletStyleInputProps } from '@/types'

export function BulletStyleInputComponent({
  onSubmit,
  initialBullets = [],
  onBulletsChange,
  placeholder = 'Please enter response...'
}: BulletStyleInputProps) {
  const [currentInputs, setCurrentInputs] = useState<string[]>(() => {
    const inputs = initialBullets?.map(b => b) || ['']
    return inputs.length === 0 ? [''] : inputs
  })

  useEffect(() => {
    console.log('useEffect triggered: initialBullets changed', initialBullets);
    
    // Only sync if the lengths are different or it's the first mount
    if (initialBullets.length !== currentInputs.length) {
      const newInputs = initialBullets?.map(b => b) || ['Enter your response...'];
      setCurrentInputs(newInputs.length === 0 ? [''] : newInputs);
    }
  }, [initialBullets]);

  useEffect(() => {
    console.log('Child component mounted/updated: initialBullets', initialBullets);
    console.log('Current Inputs:', currentInputs);
  }, [initialBullets]);

  const handleAddBullet = () => {
    const newInputs = [...currentInputs, ' a'];
    console.log('Adding new bullet:', newInputs);
    setCurrentInputs(newInputs);
    onBulletsChange(newInputs.filter(input => input.trim() !== ''));
  };

  const handleRemoveBullet = (index: number) => {
    if (currentInputs.length === 1) {
      setCurrentInputs([''])
      onBulletsChange([])
      return
    }

    const newInputs = currentInputs.filter((_, i) => i !== index)
    setCurrentInputs(newInputs)
    onBulletsChange(newInputs.filter(input => input.trim() !== ''))
  }

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...currentInputs]
    newInputs[index] = value
    setCurrentInputs(newInputs)
    onBulletsChange(newInputs.filter(input => input.trim() !== ''))
  }

  const handleSubmit = () => {
    const nonEmptyBullets = currentInputs.filter(input => input.trim() !== '')
    if (nonEmptyBullets.length > 0) {
      onSubmit(nonEmptyBullets)
      setCurrentInputs([''])
      onBulletsChange([])
    }
  }

  return (
    <div className="space-y-4">
      {currentInputs.map((input, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-gray-500">•</span>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => handleRemoveBullet(index)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ))}
      
      <div className="flex justify-between items-center">
        <button
          onClick={handleAddBullet}
          className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
        >
          <Plus className="h-4 w-4" />
          <span>Add bullet point</span>
        </button>
        
        <button 
          className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
          onClick={handleSubmit}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
