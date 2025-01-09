'use client'

import { Tile } from './Tile'
import { TileSectionProps } from '@/types'

export function TileSection({ title, category, tiles }: TileSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 gap-4">
        {tiles.map((tile) => (
          <Tile
            key={tile.id}
            title={tile.title}
            content={tile.content}
            category={category}
            onDelete={() => console.log('Delete tile:', tile.id)}
          />
        ))}
      </div>
    </div>
  )
} 