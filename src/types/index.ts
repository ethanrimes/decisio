import 'next-auth'
import { LucideIcon } from 'lucide-react'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// Basic NavItem without icon
export interface NavItem {
  label: string
  href: string
}

// Extended NavItem with icon
export interface NavItemIcon extends NavItem {
  icon: LucideIcon
}

export interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export interface TileProps {
  title: string
  content: string
  category: 'goals' | 'preferences' | 'options' | 'constraints'
  onDelete?: () => void
}

export interface TileSectionProps {
  title: string
  category: 'goals' | 'preferences' | 'options' | 'constraints'
  tiles: Array<{
    id: string
    title: string
    content: string
  }>
}
  
export interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}
  
export interface PricingTier {
  name: string
  price: number
  description: string
  features: string[]
  isPopular?: boolean
  buttonText: string
}
  
export interface FooterSection {
  title: string
  links: Array<{
    label: string
    href: string
  }>
}
  
export interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export interface HeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export interface NotesHeaderProps {
  activeView: 'details' | 'options'
  onViewChange: (view: 'details' | 'options') => void
}

export interface OptionSummaryProps {
  title: string
  description: string
  metrics: {
    label: string
    value: string
  }[]
}