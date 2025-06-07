"use client"

import { useState, useEffect } from "react"

export function useLLM() {
  const [llmSuggestion, setLlmSuggestion] = useState<string | null>(null)

  const suggestions = [
    "Try recording for at least 3 seconds to get better MIDI conversion results.",
    "Your latest recording has interesting harmonic patterns. Consider minting it as an NFT.",
    "Pro tip: Add some reverb to your recording before converting to MIDI for richer results.",
    "Your audio profile shows potential for generating unique harmonics. Try the Synthesize effect.",
    "Consider sharing your latest NFT on social media to increase your rewards.",
    "The current token price is favorable for buying. Consider adding to your position.",
    "Your recording style is unique. The algorithm has identified it as having high market potential.",
  ]

  const generateSuggestion = () => {
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setLlmSuggestion(randomSuggestion)

    // Clear suggestion after 10 seconds
    setTimeout(() => {
      setLlmSuggestion(null)
    }, 10000)
  }

  // Periodically generate suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      generateSuggestion()
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return {
    llmSuggestion,
    generateSuggestion,
  }
}
