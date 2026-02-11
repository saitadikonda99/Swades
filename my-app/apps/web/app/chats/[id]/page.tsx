"use client"
import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const conversationId = params.id
  const isNewChat = conversationId === 'new'

  const [conversation, setConversation] = useState<ConversationResponse | null>(isNewChat ? { id: 'new', messages: [] } : null)
  const [loading, setLoading] = useState(!isNewChat)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)

  const fetchConversation = useCallback(async () => {
    if (!conversationId || isNewChat) return
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
  }, [conversationId, isNewChat])

  useEffect(() => {
    if (isNewChat) {
      setLoading(false)
      setConversation({ id: 'new', messages: [] })
      return
    }
    setLoading(true)
    fetchConversation()
  }, [fetchConversation, isNewChat])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return

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
        : { id: 'new', messages: [{ id: crypto.randomUUID(), role: 'user', content: trimmed }] },
    )
    setInput('')

    try {
      const body: { userId: string; message: string; conversationId?: string } = {
        userId,
        message: trimmed,
      }
      if (!isNewChat) body.conversationId = conversationId

      const res = await fetch(`${apiUrl}/api/v1/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok || !res.body) {
        throw new Error('Failed to send message')
      }

      const newConversationId = res.headers.get('X-Conversation-Id')
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

      if (isNewChat && newConversationId) {
        router.replace(`/chats/${newConversationId}`)
      }
    } catch (error) {
      console.error('Failed to send message', error)
    } finally {
      setSending(false)
      setStreamingContent(null)
      if (!isNewChat) await fetchConversation()
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