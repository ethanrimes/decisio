'use client'

import { ChevronLeft } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SidebarProps } from '@/types'

export function DashboardSidebar({ 
  isOpen, 
  onToggle, 
  topics, 
  selectedTopicId,
  onTopicSelect 
}: SidebarProps) {

  const getIconComponent = (iconName: string) => {
    const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
    return (LucideIcons as any)[formattedIconName] || LucideIcons.HelpCircle
  }

  const topicNavItems = topics?.map(topic => ({
    id: topic.id,
    icon: getIconComponent(topic.icon),
    label: topic.shortName || topic.fullName,
    href: `/counselor/${topic.id}`
  })) || []

  return (
    <div className={cn(
      'bg-white border-r transition-all duration-300 overflow-hidden',
      isOpen ? 'w-64' : 'w-0 hidden'
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <h1 className="font-semibold text-xl">Dashboard</h1>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded-md">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {topicNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onTopicSelect(item.id)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors',
              selectedTopicId === item.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
