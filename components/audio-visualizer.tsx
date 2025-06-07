"use client"

import { useEffect, useRef } from "react"

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const draw = () => {
      if (!canvas || !ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set dimensions
      const width = canvas.width
      const height = canvas.height

      // Generate random bars for visualization
      const barCount = 60
      const barWidth = width / barCount
      const barMaxHeight = height / 2

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Generate random height for visualization effect
        const barHeight = Math.random() * barMaxHeight

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height / 2 - barHeight, 0, height / 2 + barHeight)
        gradient.addColorStop(0, "#f97316") // orange-500
        gradient.addColorStop(1, "#2563eb") // blue-600

        ctx.fillStyle = gradient

        // Draw bar (centered vertically)
        ctx.fillRect(i * barWidth, height / 2 - barHeight / 2, barWidth - 1, barHeight)
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} width={600} height={150} className="w-full h-full" />
}
