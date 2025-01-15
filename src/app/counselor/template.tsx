'use client'

import { useState } from 'react'
import { TopicProvider } from './context/TopixContext'
import { LoadingProvider } from './context/LoadingContext'
import { DashboardSidebar } from '@/components/counselor/Sidebar'
import { DashboardHeader } from '@/components/counselor/Header'
import type { ReactNode } from 'react'

export default function Template({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <LoadingProvider>
      <TopicProvider>
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
      </TopicProvider>
    </LoadingProvider>
  )
}