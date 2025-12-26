'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ViewMode = 'student' | 'coach'

interface ViewModeContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  isStudent: boolean
  isCoach: boolean
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined)

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('student')

  const value: ViewModeContextType = {
    viewMode,
    setViewMode,
    isStudent: viewMode === 'student',
    isCoach: viewMode === 'coach',
  }

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  const context = useContext(ViewModeContext)
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider')
  }
  return context
}
