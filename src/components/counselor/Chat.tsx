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
import { useTopicContext } from '@/app/counselor/context/TopixContext'

export function Chat() {
  const { selectedTopic } = useTopicContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(false)

  useEffect(() => {
    // Check for speech recognition support
    setIsSpeechSupported(
      typeof window !== 'undefined' && 'webkitSpeechRecognition' in window
    )
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedTopic) {
        setMessages([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/counselor/message/get?topicId=${selectedTopic.id}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        setMessages(data)
      } catch (err) {
        console.error('Error fetching messages:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [selectedTopic])

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

  const handleSend = async () => {
    if (!input.trim() || !selectedTopic) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'u',
      topicId: selectedTopic.id,
      createdAt: new Date(),
      metadata: null
    }

    try {
      // Post the message to the database
      setMessages(prev => [...prev, newMessage])
      setInput('')
      const response = await fetch('/api/counselor/message/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: input,
          role: 'u',
          topicId: selectedTopic.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      

      // Get AI response
      const aiResponse = await fetch('/api/openai/message-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: selectedTopic.id,
        }),
      })

      if (aiResponse.ok) {
        const botMessage = await aiResponse.json()
        setMessages(prev => [...prev, botMessage])
      }

    } catch (error) {
      console.error('Error sending message:', error)
      // Optionally show error to user
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Header */}
      <div className="border-b p-4 shrink-0">
        <h2 className="text-lg font-semibold">AI Coach</h2>
        <p className="text-sm text-gray-500">Here to help!</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'u' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'u'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.createdAt).toLocaleTimeString([], { 
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
            {isSpeechSupported && (
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