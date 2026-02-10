"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import './sidebar.css'

const sidebar = () => {
    const [search, setSearch] = useState('')
    const [conversations, setConversations] = useState([])
    const router = useRouter()

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/conversations/messages`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: {
                        userId: process.env.NEXT_PUBLIC_USER_ID,
                    },
                })
                console.log(response.data)
                setConversations(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchConversations()
    },[]);
    

    return (
        <div className="SidebarComponent">
            <div className="SidebarComponent-in">
                <div className="sidebar-one">
                    <p>Chats</p>
                    <span><Plus size={16} /></span>
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
                            <Image src="/1.png" alt="chat" width={40} height={40} />
                        </div>
                        <div className="sidebar-three-two">
                            {conversations.map((conversation: any) => (
                                <div
                                    key={conversation.id}
                                    className="sidebar-three-two-one"
                                    onClick={() => router.push(`/chats/${conversation.id}`)}
                                >
                                    <p>{conversation.messages[conversation.messages.length - 1].role}</p>
                                    <p>{conversation.messages[conversation.messages.length - 1].content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default sidebar