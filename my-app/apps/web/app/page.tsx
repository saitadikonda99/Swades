import React from 'react'
import DashboardLayout from './components/dashboard/layout'
import './page.css'

const page = () => {
  return (
    <DashboardLayout>
      <div className="ChatComponent">
        <div className="ChatComponent-in">
          <div className="chat-messages">
            {/* Chat messages will be rendered here */}
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

export default page