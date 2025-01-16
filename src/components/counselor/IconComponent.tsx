import { FC } from 'react'
import * as LucideIcons from 'lucide-react'
import { IconProps } from '@/types'

const Icon: FC<IconProps> = ({ iconName, size = 24, color = 'black' }) => {
  // Format the icon name to match the expected component name
  const formattedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
  
  // Get the icon component from LucideIcons, or fallback to HelpCircle if not found
  const IconComponent = (LucideIcons as any)[formattedIconName] || LucideIcons.HelpCircle
  
  return <IconComponent size={size} color={color} />
}

export default Icon