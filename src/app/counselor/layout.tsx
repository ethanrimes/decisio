'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/counselor/Sidebar'
import { DashboardHeader } from '@/components/counselor/Header'

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <div className="flex flex-col flex-1">
        <DashboardHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
