'use client'

import { Tile as TileComponent } from './Tile'
import { TileSectionProps } from '@/types'

export function TileSection({ tile }: TileSectionProps) {

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">{tile.sectionName}</h2>
      </div>

      <TileComponent
        id={tile.id}
        contents={tile.contents}
        onDelete={() => console.log('Delete tile:', tile.id)}
      />
    </div>
  )
} 