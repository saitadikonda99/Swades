"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import DashboardLayout from '../../components/dashboard/layout'
import '../page.css'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
}

interface ConversationResponse {
  id: string
  messages: Message[]
}

const ConversationPage = () => {
  const params = useParams<{ id: string }>()
  const conversationId = params.id

  const [conversation, setConversation] = useState<ConversationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)

  const fetchConversation = useCallback(async () => {
    if (!conversationId) return
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/conversations/${conversationId}`,
      )
      setConversation(response.data)
    } catch (error) {
      console.error('Failed to fetch conversation', error)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    setLoading(true)
    fetchConversation()
  }, [fetchConversation])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || !conversationId || sending) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const userId = process.env.NEXT_PUBLIC_USER_ID
    if (!apiUrl || !userId) {
      console.error('Missing NEXT_PUBLIC_API_URL or NEXT_PUBLIC_USER_ID')
      return
    }

    setSending(true)
    setStreamingContent('')

    setConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              { id: crypto.randomUUID(), role: 'user', content: trimmed },
            ],
          }
        : prev,
    )
    
    setInput('')

    try {
      const res = await fetch(`${apiUrl}/api/v1/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId,
          message: trimmed,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Failed to send message')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreamingContent(accumulated)
      }
    } catch (error) {
      console.error('Failed to send message', error)
    } finally {
      setSending(false)
      setStreamingContent(null)
      await fetchConversation()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <DashboardLayout>
      <div className="ChatComponent">
        <div className="ChatComponent-in">
          <div className="chat-messages">
            {loading ? (
              <div className="chat-empty-state">
                <p>Loading conversation...</p>
              </div>
            ) : !conversation ? (
              <div className="chat-empty-state">
                <p>Conversation not found.</p>
              </div>
            ) : (
              <>
                {conversation.messages.length === 0 && !streamingContent ? (
                  <div className="chat-empty-state">
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  <>
                    {conversation.messages.map((message) => (
                      <div key={message.id} className="chat-message-row">
                        <div className={`chat-message-bubble chat-message-${message.role}`}>
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {streamingContent !== null && (
                      <div className="chat-message-row">
                        <div className="chat-message-bubble chat-message-agent">
                          <p>{streamingContent || '...'}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Enter message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <button onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ConversationPage