"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Coins, Clock, Users, TrendingUp, ArrowRight } from "lucide-react"

interface TokenSaleProps {
  themeIndex: number
}

export default function TokenSale({ themeIndex }: TokenSaleProps) {
  const [amount, setAmount] = useState("1")

  // Different UI styles based on theme index
  const getNeomorphicStyle = () => {
    switch (themeIndex) {
      case 0:
        return "from-gray-800 to-gray-900 border-orange-500/20 shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.05)]"
      case 1:
        return "from-blue-900 to-gray-900 border-blue-500/20 shadow-[12px_12px_24px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(255,255,255,0.03)]"
      case 2:
        return "from-orange-900 to-gray-900 border-orange-600/20 shadow-[10px_10px_20px_rgba(0,0,0,0.35),-5px_-5px_10px_rgba(255,255,255,0.04)]"
      default:
        return "from-gray-900 to-blue-900 border-blue-600/20 shadow-[15px_15px_30px_rgba(0,0,0,0.45),-7px_-7px_14px_rgba(255,255,255,0.02)]"
    }
  }

  const saleProgress = 68

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-white to-blue-400 bg-clip-text text-transparent">
          {themeIndex === 0
            ? "TOKEN SALE"
            : themeIndex === 1
              ? "IDO LAUNCH"
              : themeIndex === 2
                ? "VOID TOKEN"
                : "RESONANCE ICO"}
        </h2>

        <div className="flex items-center gap-2 text-white">
          <Clock className="h-5 w-5 text-orange-400" />
          <span>Ends in: 2d 14h 37m</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className={`border col-span-2 rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
          <CardHeader>
            <CardTitle className="text-xl text-white">
              {themeIndex === 0
                ? "FART Token Initial Offering"
                : themeIndex === 1
                  ? "Frequency Token Launch"
                  : themeIndex === 2
                    ? "Void Token Distribution"
                    : "Resonance Token Sale"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{saleProgress}%</span>
              </div>
              <Progress
                value={saleProgress}
                className="h-3 rounded-lg bg-gray-800"
                indicatorClassName="bg-gradient-to-r from-orange-500 to-blue-600"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">6,800,000 / 10,000,000 FART</span>
                <span className="text-orange-400">Hard cap: $2M</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Token Price", value: "$0.20", icon: Coins },
                { label: "Participants", value: "2,457", icon: Users },
                { label: "Total Raised", value: "$1.36M", icon: TrendingUp },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/10 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]"
                >
                  <div className="flex items-center mb-1">
                    <stat.icon className="h-4 w-4 text-orange-400 mr-2" />
                    <span className="text-gray-400 text-sm">{stat.label}</span>
                  </div>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-orange-500/10 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]">
              <div className="flex justify-between mb-4">
                <h3 className="text-white font-medium">Buy FART Tokens</h3>
                <span className="text-gray-400 text-sm">Balance: 0.45 ETH</span>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-orange-500/10 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">ETH</span>
                </div>

                <div className="flex items-center">
                  <ArrowRight className="h-6 w-6 text-gray-500" />
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={(Number.parseFloat(amount) * 5000).toFixed(0)}
                    readOnly
                    className="w-full p-3 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-orange-500/10 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.05)] text-white focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">FART</span>
                </div>
              </div>

              <Button className="w-full py-6 rounded-xl bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] transition-all duration-300 border-0 text-lg">
                Buy Tokens
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={`border rounded-3xl bg-gradient-to-br ${getNeomorphicStyle()}`}>
          <CardHeader>
            <CardTitle className="text-xl text-white">Token Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { label: "Token Name", value: "FART Token" },
                { label: "Token Symbol", value: "FART" },
                { label: "Total Supply", value: "100,000,000" },
                { label: "Initial Circulating", value: "10,000,000" },
                { label: "Token Type", value: "ERC-20" },
                { label: "Blockchain", value: "Ethereum" },
              ].map((info, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-400">{info.label}</span>
                  <span className="text-white font-medium">{info.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-4">Token Allocation</h4>
              <div className="space-y-3">
                {[
                  { label: "Public Sale", value: "10%", color: "bg-orange-500" },
                  { label: "Team", value: "15%", color: "bg-blue-500" },
                  { label: "Ecosystem", value: "25%", color: "bg-green-500" },
                  { label: "Treasury", value: "20%", color: "bg-purple-500" },
                  { label: "Staking Rewards", value: "30%", color: "bg-yellow-500" },
                ].map((allocation, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{allocation.label}</span>
                      <span className="text-white">{allocation.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800">
                      <div className={`h-full rounded-full ${allocation.color}`} style={{ width: allocation.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
