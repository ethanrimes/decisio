'use client'

// Add these type declarations
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = any;

import { useState, useEffect } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'
import { Message } from '@/types'

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI counselor. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        
        setInput(transcript)
      }

      recognition.onerror = (event) => {
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

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm analyzing your input and will provide guidance shortly...",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Header */}
      <div className="border-b p-4 shrink-0">
        <h2 className="text-lg font-semibold">AI Counselor</h2>
        <p className="text-sm text-gray-500">Here to help with your career decisions</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 shrink-0">
        <div className="flex gap-2 items-start">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[80px] max-h-[160px] overflow-y-auto"
            style={{ height: '80px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = '80px'
              target.style.height = `${target.scrollHeight}px`
            }}
          />
          <div className="flex flex-col gap-2">
            {typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && (
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 text-white" />
                ) : (
                  <Mic className="h-5 w-5 text-gray-700" />
                )}
              </button>
            )}
            <button
              onClick={handleSend}
              className="p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 