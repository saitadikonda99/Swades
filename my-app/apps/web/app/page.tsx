import React from 'react'
import DashboardLayout from './components/dashboard/layout'

const page = () => {
  return (
    <DashboardLayout>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Select a chat from the left to view messages.</p>
      </main>
    </DashboardLayout>
  )
}

export default page