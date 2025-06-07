"use client"

import { useState, useEffect } from "react"

export function useThemeRotation() {
  const [themeIndex, setThemeIndex] = useState(0)

  // Define theme names
  const themes = ["sonic", "frequency", "void", "resonance"]
  const currentTheme = themes[themeIndex]

  // Rotate themes
  useEffect(() => {
    // Change theme every 30 seconds
    const interval = setInterval(() => {
      setThemeIndex((prevIndex) => (prevIndex + 1) % themes.length)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return {
    themeIndex,
    currentTheme,
  }
}
