'use client'

import { OptionSummaryProps } from '@/types'

export function OptionSummary({ title, description, metrics }: OptionSummaryProps) {
  return (
    <div className="flex-1 bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{metric.label}</span>
            <span className="font-medium">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
} 