"use client"

import { useState } from "react"

export function useWeb3Auth() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate Web3Auth connection
  const connect = async () => {
    setIsLoading(true)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate random wallet address
    const randomAddress = "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")

    setAddress(randomAddress)
    setIsConnected(true)
    setIsLoading(false)
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
  }

  return {
    isConnected,
    isLoading,
    address,
    connect,
    disconnect,
  }
}
