"use client"

import { createContext, useContext, type ReactNode } from "react"

interface ThemeContextType {
  theme: string
}

const ThemeContext = createContext<ThemeContextType>({ theme: "sonic" })

export function useTheme() {
  return useContext(ThemeContext)
}

interface ThemeProviderProps {
  theme: string
  children: ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}
