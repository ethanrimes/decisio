'use client'

import { useState, useEffect } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'
import { TextInputBoxProps } from '@/types'

// Add type declarations for webkit speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

type SpeechRecognition = any



export function TextInputBox({ 
  onSubmit, 
  placeholder = "Type your message...", 
  className = "", 
  value = "", 
  onChange,
  selectedOptions = [],
  onOptionRemove
}: TextInputBoxProps) {
  const [input, setInput] = useState(value)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)

  useEffect(() => {
    setInput(value)
  }, [value])

  useEffect(() => {
    // Check for speech recognition support
    setIsSpeechSupported(
      typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
    )
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        
        setInput(transcript)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      setRecognition(recognition)
    }
  }, [])

  const toggleListening = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInput(newValue)
    onChange?.(newValue)
  }

  const handleSubmit = () => {
    if (!input.trim()) return
    onSubmit(input)
    setInput('')
  }

  return (
    <div className={`p-4 border-t ${className}`}>
      <div className="relative">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          className="w-full p-3 pr-24 border rounded-lg text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute bottom-3 right-3 flex space-x-2">
          {isSpeechSupported && (
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          )}
          <button 
            className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
