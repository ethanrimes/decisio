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

// Database Model Interfaces
export interface User {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  topics: Topic[]
}

export interface Topic {
  id: string
  fullName: string
  shortName: string | null
  icon: string
  createdAt: Date
  updatedAt: Date
  userId: string
  user: User
  options: Option[]
  tiles: Tile[]
  messages: Message[]
  solved: boolean
}

export interface Option {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  topicId: string
  topic: Topic
}

export interface TileContent {
  id: string;
  content: string;
  createdAt: Date;
  modifiedAt: Date;
  tileId: string;
}

export interface Tile {
  id: string;
  contents: TileContent[];
  sectionName: string;
  understanding: number;
  topicId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string
  content: string
  role: string
  createdAt: Date
  topicId: string
  topic: Topic
  metadata: string
}

// Component Props Interfaces (keeping your existing interfaces)
export interface NavItem {
  label: string
  href: string
}

export interface NavItemIcon extends NavItem {
  icon: LucideIcon
}

export interface TileProps {
  id: string;
  contents: TileContent[];
  onDelete?: () => void;
}

export interface TileSectionProps {
  tile: Tile
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

export interface NewDecisionPopupProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (decision: string, summary: string, iconName: string) => void
}

export type UpdateableTopicFields = {
  fullName?: string
  shortName?: string
  icon?: string
  sectionNames?: string[]
  solved?: boolean
}

export interface PageProps {
  selectedTopic: Topic | null
}

export interface IconProps {
  iconName: string
  size?: number
  color?: string
}

export interface TopicContextType {
  selectedTopic: Topic | null
  setSelectedTopic: (topic: Topic | null) => void
  topics: Topic[]
  setTopics: (topics: Topic[]) => void
  tiles: Tile[]
  setTiles: (tiles: Tile[]) => void
  isLoading: boolean
  error: string | null
  fetchTopics: () => Promise<void>
  fetchTiles: () => Promise<void>
}

export interface AddTilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { sectionName: string; content: string[] }) => void;
}

export interface NewTile {
  sectionName: string;
  topicId: string;
  contents: string[];
}

export interface UnderstandingMeterProps {
  level: number;
  className?: string;
}

export interface SelectableTextButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export interface TextInputBoxProps {
  onSubmit: (text: string) => void
  placeholder?: string
  className?: string
  value?: string
  onChange?: (value: string) => void
  selectedOptions?: Array<{ id: number; label: string }>
  onOptionRemove?: (id: number) => void
}

export interface GenerateTileQuestionsResponse {
  understanding: number;
  question: string;
  sampleAnswers: string[];
}