'use client'

import { ChevronLeft, Home, Settings } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SidebarProps, NavItemIcon } from '@/types'

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const navItems: NavItemIcon[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <div className={cn(
      'bg-white border-r transition-all duration-300',
      isOpen ? 'w-64' : 'w-0'
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <h1 className="font-semibold text-xl">Decisio</h1>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded-md">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors',
              pathname === item.href 
                ? 'bg-gray-100 text-gray-900' 
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
