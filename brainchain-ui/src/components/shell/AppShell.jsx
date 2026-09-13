import React from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen bg-[#f4f6f8]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
