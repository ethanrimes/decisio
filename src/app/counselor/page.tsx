'use client'

import { useState } from 'react'
import { NotesHeader } from '@/components/counselor/NotesHeader'
import { TileSection } from '@/components/counselor/TileSection'
import { OptionSummary } from '@/components/counselor/OptionSummary'
import { Chat } from '@/components/counselor/Chat'
import { PageProps, Topic } from '@/types'

const sections = [
  {
    id: 'goals',
    title: 'Goals (what do you want to achieve)',
    category: 'goals' as const,
    tiles: [
      {
        id: 'g1',
        title: 'Career Growth',
        content: 'Achieve senior position within 2 years'
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences (how do you want to achieve it)',
    category: 'preferences' as const,
    tiles: [
      {
        id: 'p1',
        title: 'Work-Life Balance',
        content: 'Remote work opportunities preferred'
      }
    ]
  },
  {
    id: 'options',
    title: 'Options (what can you choose from)',
    category: 'options' as const,
    tiles: [
      {
        id: 'o1',
        title: 'Company Types',
        content: 'Tech startups, Enterprise companies, Consulting firms'
      }
    ]
  },
  {
    id: 'constraints',
    title: 'Constraints (what limitations you have on options)',
    category: 'constraints' as const,
    tiles: [
      {
        id: 'c1',
        title: 'Location',
        content: 'Must be within EST timezone'
      }
    ]
  }
]

const optionSummaries = [
  {
    title: "Option A",
    description: "Tech Startup in San Francisco",
    metrics: [
      { label: "Salary Range", value: "$120k-150k" },
      { label: "Work-Life Balance", value: "8/10" },
      { label: "Growth Potential", value: "High" },
    ]
  },
  {
    title: "Option B",
    description: "Enterprise Company in NYC",
    metrics: [
      { label: "Salary Range", value: "$140k-170k" },
      { label: "Work-Life Balance", value: "7/10" },
      { label: "Growth Potential", value: "Medium" },
    ]
  },
  {
    title: "Option C",
    description: "Remote Consulting Firm",
    metrics: [
      { label: "Salary Range", value: "$110k-140k" },
      { label: "Work-Life Balance", value: "9/10" },
      { label: "Growth Potential", value: "Medium-High" },
    ]
  }
]

export default function CounselorPage({ selectedTopic }: PageProps) {
  const [activeView, setActiveView] = useState<'details' | 'options'>('details')

  return (
    <div className="flex h-full">
      {/* Main content area (2/3) */}
      <div className="w-2/3 bg-white overflow-auto">
        <NotesHeader 
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="p-6">
          {selectedTopic && (
            <h1 className="text-2xl font-bold mb-6">{selectedTopic.fullName}</h1>
          )}
          {/* Details View */}
          <div className={`${activeView === 'details' ? 'block' : 'hidden'}`}>
            <div className="space-y-8 h-[calc(100vh-10rem)] overflow-y-auto">
              {sections.map((section) => (
                <TileSection
                  key={section.id}
                  title={section.title}
                  category={section.category}
                  tiles={section.tiles}
                />
              ))}
            </div>
          </div>

          {/* Options View */}
          <div className={`${activeView === 'options' ? 'block' : 'hidden'}`}>
            <div className="h-[calc(100vh-10rem)] overflow-y-auto">
              <div className="grid grid-cols-3 gap-6">
                {optionSummaries.map((option, index) => (
                  <OptionSummary
                    key={index}
                    title={option.title}
                    description={option.description}
                    metrics={option.metrics}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar with chat (1/3) */}
      <div className="w-1/3 bg-gray-50 border-l">
        <Chat />
      </div>
    </div>
  )
}
