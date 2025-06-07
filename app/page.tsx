"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useWeb3Auth } from "@/hooks/use-web3auth"
import { useLLM } from "@/hooks/use-llm"
import { useThemeRotation } from "@/hooks/use-theme-rotation"
import LandingHero from "@/components/landing-hero"
import Dashboard from "@/components/dashboard"
import TokenSale from "@/components/token-sale"
import { ThemeProvider } from "@/components/theme-provider"

function GeometricBackground({ themeIndex }: { themeIndex: number }) {
  const shapes = Array.from({ length: 20 }, (_, i) => i)

  return (
    <div className="absolute inset-0">
      {shapes.map((i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full opacity-20 ${themeIndex % 2 === 0 ? "bg-orange-500" : "bg-blue-500"}`}
          initial={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.3,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          style={{
            width: `${Math.random() * 300 + 50}px`,
            height: `${Math.random() * 300 + 50}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { isConnected, connect, disconnect, address } = useWeb3Auth()
  const { currentTheme, themeIndex } = useThemeRotation()
  const { llmSuggestion, generateSuggestion } = useLLM()

  // Mount on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ThemeProvider theme={currentTheme}>
      <div
        className={`min-h-screen w-full transition-all duration-1000 bg-gradient-to-br ${
          themeIndex === 0
            ? "from-orange-900 via-gray-900 to-blue-900"
            : themeIndex === 1
              ? "from-blue-900 via-purple-900 to-orange-900"
              : themeIndex === 2
                ? "from-gray-900 via-orange-900 to-gray-800"
                : "from-blue-800 via-gray-900 to-orange-800"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <GeometricBackground themeIndex={themeIndex} />
        </div>

        <div className="relative z-10">
          {!isConnected ? (
            <LandingHero onConnect={connect} themeIndex={themeIndex} />
          ) : (
            <>
              <Dashboard themeIndex={themeIndex} />
              <TokenSale themeIndex={themeIndex} />

              {llmSuggestion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed bottom-4 right-4 max-w-md p-4 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-orange-500/20 text-white shadow-[0_0_15px_rgba(255,140,0,0.3)]"
                >
                  <p className="text-sm">{llmSuggestion}</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
