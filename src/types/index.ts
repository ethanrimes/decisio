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