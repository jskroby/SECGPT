"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Music, Share2, Heart } from "lucide-react"

interface NFTCardProps {
  themeIndex: number
}

export function NFTCard({ themeIndex }: NFTCardProps) {
  const [liked, setLiked] = useState(false)

  // Generate random data for the NFT
  const randomId = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  const randomEth = (Math.random() * 0.5 + 0.1).toFixed(3)
  const randomLikes = Math.floor(Math.random() * 100)

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/10 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)]"
    >
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-orange-900/30 to-blue-900/30">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,140,0,0.5)]">
            <Music className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs text-white">
          #{randomId}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-medium mb-1">
          {themeIndex === 0
            ? "Sonic Symphony"
            : themeIndex === 1
              ? "Frequency Wave"
              : themeIndex === 2
                ? "Void Echo"
                : "Resonance Pulse"}{" "}
          #{randomId}
        </h3>

        <div className="flex justify-between items-center mb-3">
          <div className="text-orange-400 font-medium">{randomEth} ETH</div>
          <div className="flex items-center text-gray-400 text-sm">
            <Heart
              className={`h-3 w-3 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`}
              onClick={() => setLiked(!liked)}
            />
            <span>{liked ? randomLikes + 1 : randomLikes}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0"
          >
            Play
          </Button>
          <Button size="sm" variant="outline" className="rounded-lg border border-orange-500/20">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
