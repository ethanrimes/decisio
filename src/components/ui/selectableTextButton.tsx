'use client'

import { SelectableTextButtonProps } from '@/types'

export function SelectableTextButton({ label, isSelected, onClick }: SelectableTextButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg text-sm transition-all duration-200 ${
        isSelected
          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
