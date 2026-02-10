"use client"
import React, { useEffect, useState } from 'react'
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

  useEffect(() => {
    const fetchConversation = async () => {
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
    }

    if (conversationId) {
      fetchConversation()
    }
  }, [conversationId])

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
            ) : conversation.messages.length === 0 ? (
              <div className="chat-empty-state">
                <p>No messages yet.</p>
              </div>
            ) : (
              conversation.messages.map((message) => (
                <div key={message.id} className="chat-message-row">
                  <div className={`chat-message-bubble chat-message-${message.role}`}>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Enter message..." />
            <button>Send</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ConversationPage

