"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Wallet, Music, Sparkles, Zap, Disc, Wand2 } from "lucide-react"

interface LandingHeroProps {
  onConnect: () => void
  themeIndex: number
}

export default function LandingHero({ onConnect, themeIndex }: LandingHeroProps) {
  const [hovering, setHovering] = useState(false)

  const themes = [
    {
      title: "SONIC ALCHEMY",
      subtitle: "Transform Audio into Digital Assets",
      description:
        "The world's first platform that converts audio into MIDI symphonies and mints them as unique NFTs on the blockchain.",
    },
    {
      title: "FREQUENCY FRONTIER",
      subtitle: "Pioneer the Sound Revolution",
      description: "Stake your claim in the audio metaverse with revolutionary tokenized sound experiences.",
    },
    {
      title: "HARMONIC VOID",
      subtitle: "Embrace the Acoustic Nihilism",
      description:
        "In a meaningless universe, your sonic creations are the only truth. Mint, share, and profit from the chaos.",
    },
    {
      title: "RESONANCE REALM",
      subtitle: "Vibrations Beyond Reality",
      description: "Transcend conventional audio paradigms with blockchain-powered sound synthesis and tokenization.",
    },
  ]

  const currentThemeContent = themes[themeIndex]

  return (
    <div className="container mx-auto px-4 min-h-screen flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.div
          animate={{ scale: hovering ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6 inline-block"
        >
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-gradient-to-r from-orange-500 to-blue-600 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)]">
            <Disc className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          key={`title-${themeIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent"
        >
          {currentThemeContent.title}
        </motion.h1>

        <motion.p
          key={`subtitle-${themeIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl mb-6 text-orange-300"
        >
          {currentThemeContent.subtitle}
        </motion.p>

        <motion.p
          key={`desc-${themeIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.2 }}
          className="text-lg mb-12 text-gray-300 max-w-2xl mx-auto"
        >
          {currentThemeContent.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <Button
            onClick={onConnect}
            size="lg"
            className="px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg rounded-2xl bg-transparent border border-orange-500/30 text-orange-300 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300"
          >
            <Wand2 className="mr-2 h-5 w-5" />
            Learn More
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { icon: Music, title: "Audio to MIDI", desc: "Convert audio recordings into professional MIDI symphonies" },
            { icon: Sparkles, title: "NFT Minting", desc: "Tokenize your audio creations as unique digital assets" },
            { icon: Zap, title: "Earn Rewards", desc: "Get rewarded for sharing and contributing to the ecosystem" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-orange-500/10 shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.03)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
