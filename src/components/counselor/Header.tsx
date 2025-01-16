'use client'

import { Menu } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { HeaderProps } from '@/types'

export function DashboardHeader({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1 hover:bg-gray-100 rounded-md mr-4"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h2 className="font-semibold">Decisio</h2>
      </div>

      {session?.user && (
        <Link href="/profile">
          <Image
            src={session.user.image || ''}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full cursor-pointer hover:opacity-80"
          />
        </Link>
      )}
    </header>
  )
}