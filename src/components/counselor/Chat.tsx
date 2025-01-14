'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/types'
import { useTopicContext } from '@/app/counselor/context/TopixContext'
import { TextInputBox } from '@/components/ui/textInputBox'

export function Chat() {
  const { selectedTopic, fetchTiles } = useTopicContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')

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

  const handleSend = async (input: string) => {
    if (!input.trim() || !selectedTopic) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'u',
      topicId: selectedTopic.id,
      createdAt: new Date(),
      metadata: '',
      topic: selectedTopic
    };

    try {
      // Update local messages state
      setMessages(prev => [...prev, newMessage]);

      // Post the message to the database
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
      });
      console.log("message post response: ", response);

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Refresh the loaded tiles
      await fetchTiles();

      // Get bot response
      const botResponse = await fetch('/api/counselor/message/bot-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          tiles: selectedTopic.tiles
        }),
      });

      if (!botResponse.ok) {
        throw new Error('Failed to get bot response');
      }

      const botMessageData = await botResponse.json();
      
      // Add bot response to messages
      setMessages(prev => [...prev, {
        id: botMessageData.id,
        content: botMessageData.content,
        role: botMessageData.role,
        topicId: botMessageData.topicId,
        createdAt: new Date(botMessageData.createdAt),
        metadata: botMessageData.metadata,
        topic: selectedTopic
      } as Message]);

    } catch (error) {
      console.error('Error in message handling:', error);
      // Optionally show error to user
    }
  };

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
      <TextInputBox 
        onSubmit={handleSend}
        placeholder="Type your message..."
        value={input}
        onChange={setInput}
        selectedOptions={[]}
        onOptionRemove={() => {}}
      />
    </div>
  )
} 