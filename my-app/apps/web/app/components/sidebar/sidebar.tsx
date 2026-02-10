"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import './sidebar.css'

const sidebar = () => {
    const [search, setSearch] = useState('')
    const [conversations, setConversations] = useState<any[]>([])
    const router = useRouter()

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/conversations/messages`, {
                headers: { 'Content-Type': 'application/json' },
                params: { userId: process.env.NEXT_PUBLIC_USER_ID },
            })
            setConversations(response.data ?? [])
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchConversations()
    }, [])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const handleNewChat = () => {
        router.push('/chats/new')
    }

    return (
        <div className="SidebarComponent">
            <div className="SidebarComponent-in">
                <div className="sidebar-one">
                    <p>Chats</p>
                    <button
                        type="button"
                        className="sidebar-new-chat-btn"
                        onClick={handleNewChat}
                        aria-label="New chat"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                <div className="sidebar-two">
                    <div className="sidebar-two-in">
                        <span><Search size={16} /></span>
                        <input
                            type="text"
                            placeholder="Search chats"
                            className="sidebar-two-input"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                <div className="sidebar-three">
                    <div className="sidebar-three-in">
                        <div className="sidebar-three-one">
                            {conversations.map((conversation: any) => {
                                const lastMsg = conversation.messages?.length
                                    ? conversation.messages[conversation.messages.length - 1]
                                    : null
                                return (
                                    <div
                                        key={conversation.id}
                                        className="sidebar-three-one-one"
                                        onClick={() => router.push(`/chats/${conversation.id}`)}
                                    >
                                        <div className="sidebar-three-one-two">
                                            <Image src="/1.png" alt="chat" width={40} height={40} />
                                        </div>
                                        <div className="sidebar-three-one-three">
                                            <p>{lastMsg?.role ?? 'agent'}</p>
                                        </div>
                                        <div className="sidebar-three-one-four">
                                            <p>{lastMsg?.content ?? 'New chat'}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default sidebar