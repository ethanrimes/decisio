'use client'

import { useState } from 'react'
import { MoreHorizontal, X, Check, Pencil } from 'lucide-react'
import { TileProps, TileContent } from '@/types'
import { useTopicContext } from '@/app/counselor/context/TopixContext'
import { v4 as uuidv4 } from 'uuid'

export function Tile({ id, contents: initialContents, onDelete }: TileProps) {
  const { fetchTiles } = useTopicContext()
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [localContents, setLocalContents] = useState<TileContent[]>(initialContents)
  const [editedContents, setEditedContents] = useState<TileContent[]>(initialContents)

  const handleSave = async () => {
    try {
      console.log('Starting handleSave with:', {
        editedContents,
        localContents
      });

      // Find new contents to add
      const toAdd = editedContents.filter(item => 
        !localContents.some(local => local.id === item.id) // Check if the item does not exist in localContents
      );
      console.log('Contents to add:', toAdd);

      // Find contents to delete
      const toDelete = localContents.filter(
        local => !editedContents.some(edited => edited.id === local.id)
      );
      console.log('Contents to delete:', toDelete);

      // Find contents to update
      const toUpdate = editedContents.filter(edited => 
        edited.id && localContents.some(local => 
          local.id === edited.id && local.content !== edited.content
        )
      );
      console.log('Contents to update:', toUpdate);

      // Handle additions
      for (const item of toAdd) {
        console.log('Attempting to add item:', item);
        const response = await fetch('/api/counselor/tilecontent/post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: item.content, tileId: id }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to add item:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`Failed to add item: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Successfully added item:', result);
      }

      // Handle updates
      for (const item of toUpdate) {
        console.log('Attempting to update item:', item);
        const response = await fetch('/api/counselor/tilecontent/patch', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, content: item.content }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to update item:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`Failed to update item: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Successfully updated item:', result);
      }

      // Handle deletions
      for (const item of toDelete) {
        console.log('Attempting to delete item:', item);
        const response = await fetch('/api/counselor/tilecontent/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to delete item:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`Failed to delete item: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Successfully deleted item:', result);
      }

      setLocalContents(editedContents);
      setIsEditing(false);
      console.log('Fetching updated tiles...');
      await fetchTiles();
      console.log('Save operation completed successfully');
    } catch (error) {
      console.error('Error in handleSave:', error);
      setEditedContents(localContents); // Revert on error
    }
  }

  if (isEditing) {
    return (
      <div className="relative p-4 rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col gap-2">
          {editedContents.map((item) => (
            <div key={item.id || uuidv4()} className="flex gap-2">
              <input
                type="text"
                value={item.content}
                onChange={(e) => {
                  const newContents = editedContents.map(content => 
                    content === item ? { ...content, content: e.target.value } : content
                  )
                  setEditedContents(newContents)
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {editedContents.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditedContents(editedContents.filter(content => content !== item))
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setEditedContents([...editedContents, { 
              id: uuidv4(),
              content: '',
              createdAt: new Date(),
              modifiedAt: new Date(),
              tileId: id
            }])}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            + Add another item
          </button>
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setIsEditing(false)
                setEditedContents(localContents)
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Check className="h-4 w-4 text-green-500" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ul className="list-disc pl-4 space-y-1">
            {localContents.map((item) => (
              <li key={item.id || uuidv4()} className="text-sm text-gray-600">
                {item.content}
              </li>
            ))}
          </ul>
        </div>
        {isHovered && (
          <div className="flex gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <Pencil className="h-4 w-4 text-gray-500" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}