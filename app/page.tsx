"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Camera,
  Play,
  Square,
  Settings,
  Maximize,
  Video,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle2,
  Brain,
  Heart,
  Bell,
  Wallet,
  Coins,
  Trophy,
  Sparkles,
  Star,
  Monitor,
  Laptop,
  Apple,
} from "lucide-react"

// Enhanced mock data with AI capabilities
const mockCameras = [
  {
    id: 0,
    name: "MacBook Continuity Camera",
    rtsp_url: "continuity://iphone",
    connected: false,
    fps: 0,
    running: false,
    aiEnabled: true,
    type: "continuity",
  },
  {
    id: 1,
    name: "Local Webcam",
    rtsp_url: "local://webcam",
    connected: true,
    fps: 30,
    running: false,
    aiEnabled: true,
    type: "webcam",
  },
  {
    id: 2,
    name: "RTSP Security Camera",
    rtsp_url: "rtsp://192.168.1.117:8554/stream",
    connected: false,
    fps: 0,
    running: false,
    aiEnabled: true,
    type: "rtsp",
  },
]

// AI Detection types with rewards
const detectionTypes = [
  { id: "dog", name: "Dog Detection", icon: "🐕", color: "bg-orange-500", reward: 10 },
  { id: "cat", name: "Cat Detection", icon: "🐱", color: "bg-blue-500", reward: 8 },
  { id: "activity", name: "Pet Activity", icon: "🏃", color: "bg-purple-500", reward: 5 },
  { id: "trick", name: "Trick Recognition", icon: "⭐", color: "bg-yellow-500", reward: 15 },
  { id: "emotion", name: "Pet Emotion", icon: "😊", color: "bg-pink-500", reward: 12 },
]

// Animated components
const AnimatedCard = ({ children, className = "", delay = 0, ...props }) => (
  <Card
    className={`
      animate-in fade-in slide-in-from-bottom-4 duration-700 
      bg-gradient-to-br from-white/90 to-orange-50/90 backdrop-blur-sm
      shadow-[0_8px_32px_rgba(255,107,53,0.12)] border border-orange-200/50
      hover:shadow-[0_16px_48px_rgba(255,107,53,0.2)] hover:scale-[1.02]
      transition-all duration-500 ease-out rounded-3xl ${className}
    `}
    style={{ animationDelay: `${delay}ms` }}
    {...props}
  >
    {children}
  </Card>
)

const GradientButton = ({ children, variant = "orange", active = false, className = "", ...props }) => {
  const variants = {
    orange: active
      ? "bg-gradient-to-r from-orange-600 to-orange-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)]"
      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-[0_8px_24px_rgba(255,107,53,0.3)]",
    blue: active
      ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.2)]"
      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-[0_8px_24px_rgba(59,130,246,0.3)]",
    gradient:
      "bg-gradient-to-r from-orange-500 via-pink-500 to-blue-500 hover:from-orange-600 hover:via-pink-600 hover:to-blue-600",
    wallet:
      "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-[0_8px_24px_rgba(147,51,234,0.3)]",
  }

  return (
    <Button
      className={`
        ${variants[variant]} text-white font-semibold rounded-2xl px-6 py-3
        transition-all duration-300 hover:scale-105 active:scale-95 border-0
        transform hover:shadow-lg ${active ? "scale-95" : ""} ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  )
}

const VideoContainer = ({ children, detections = [], highlights = [], className = "" }) => (
  <div
    className={`
    relative w-full pt-[56.25%] rounded-2xl overflow-hidden
    bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
    shadow-[inset_0_4px_16px_rgba(0,0,0,0.4)] border-2 border-slate-700/50
    ${className}
  `}
  >
    {children}

    {/* AI Detection Overlays */}
    {detections.map((detection, index) => (
      <div
        key={index}
        className={`absolute border-2 rounded animate-pulse ${
          detection.type === "dog"
            ? "border-orange-500 bg-orange-500/20"
            : detection.type === "cat"
              ? "border-blue-500 bg-blue-500/20"
              : "border-purple-500 bg-purple-500/20"
        }`}
        style={{
          left: `${detection.x}%`,
          top: `${detection.y}%`,
          width: `${detection.width}%`,
          height: `${detection.height}%`,
        }}
      >
        <div
          className={`absolute -top-8 left-0 px-2 py-1 rounded text-xs font-bold text-white ${
            detection.type === "dog" ? "bg-orange-500" : detection.type === "cat" ? "bg-blue-500" : "bg-purple-500"
          }`}
        >
          {detection.label} {Math.round(detection.confidence * 100)}%
        </div>
      </div>
    ))}

    {/* Highlight Moments */}
    {highlights.length > 0 && (
      <div className="absolute bottom-4 left-4 flex gap-2">
        {highlights.map((highlight, index) => (
          <div key={index} className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold animate-bounce">
            ⭐ {highlight.type}
          </div>
        ))}
      </div>
    )}
  </div>
)

export default function LolanthropyApp() {
  const [cameras, setCameras] = useState(mockCameras)
  const [activeCameras, setActiveCameras] = useState({})
  const [videoFeeds, setVideoFeeds] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({})
  const [streamingStats, setStreamingStats] = useState({})
  const [aiDetections, setAiDetections] = useState({})
  const [highlights, setHighlights] = useState({})
  const [addStreamDialog, setAddStreamDialog] = useState(false)
  const [walletDialog, setWalletDialog] = useState(false)
  const [mintDialog, setMintDialog] = useState(false)
  const [newStreamData, setNewStreamData] = useState({ name: "", rtsp_url: "" })
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })
  const [activeTab, setActiveTab] = useState("streams")
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [userTokens, setUserTokens] = useState(0)
  const [userNFTs, setUserNFTs] = useState([])
  const [continuityPrompt, setContinuityPrompt] = useState(false)
  const [groqConnected, setGroqConnected] = useState(false)

  const [aiSettings, setAiSettings] = useState({
    dogDetection: true,
    catDetection: true,
    activityAnalysis: true,
    emotionRecognition: true,
    trickDetection: true,
    autoHighlights: true,
    qualityThreshold: 0.8,
    recordingEnabled: true,
    nftMinting: true,
  })

  const [systemStats, setSystemStats] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    uptime: "12h 34m",
    activeConnections: 2,
    aiProcessing: 0,
    detectionsToday: 127,
    tokensEarned: 0,
    highlightsCreated: 0,
  })

  const [recentDetections, setRecentDetections] = useState([
    { id: 1, type: "dog", camera: "MacBook Camera", time: "2 min ago", confidence: 0.95, reward: 10 },
    { id: 2, type: "activity", camera: "Local Webcam", time: "5 min ago", confidence: 0.87, reward: 5 },
    { id: 3, type: "trick", camera: "MacBook Camera", time: "12 min ago", confidence: 0.92, reward: 15 },
  ])

  const videoRefs = useRef({})

  // Initialize Groq AI
  useEffect(() => {
    const initGroq = async () => {
      try {
        // Simulate Groq connection
        setTimeout(() => {
          setGroqConnected(true)
          showNotification("Groq AI connected successfully! 🧠", "success")
        }, 2000)
      } catch (error) {
        console.error("Groq connection failed:", error)
      }
    }
    initGroq()
  }, [])

  // Check for Continuity Camera support
  useEffect(() => {
    const checkContinuity = () => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const hasCamera = navigator.mediaDevices && navigator.mediaDevices.getUserMedia

      if (isMac && hasCamera) {
        setContinuityPrompt(true)
        showNotification("📱 Continuity Camera detected! Enable for best experience", "info")
      }
    }
    checkContinuity()
  }, [])

  // Enhanced camera initialization
  useEffect(() => {
    const feeds = {}
    const status = {}
    const stats = {}
    const detections = {}
    const highlightData = {}

    cameras.forEach((cam) => {
      feeds[cam.id] = null
      status[cam.id] = cam.connected ? "connected" : "disconnected"
      stats[cam.id] = { fps: cam.fps, lastFrame: null }
      detections[cam.id] = []
      highlightData[cam.id] = []
    })

    setVideoFeeds(feeds)
    setConnectionStatus(status)
    setStreamingStats(stats)
    setAiDetections(detections)
    setHighlights(highlightData)
  }, [cameras])

  // Enhanced AI processing simulation
  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(activeCameras).forEach((cameraId) => {
        if (activeCameras[cameraId] && groqConnected) {
          // Simulate video feed
          setVideoFeeds((prev) => ({
            ...prev,
            [cameraId]: `/placeholder.svg?height=480&width=640&text=🐕+AI+Enhanced+Stream+${Number.parseInt(cameraId) + 1}`,
          }))

          // Update FPS
          setStreamingStats((prev) => ({
            ...prev,
            [cameraId]: {
              ...prev[cameraId],
              fps: Math.floor(Math.random() * 5) + 25,
            },
          }))

          // Enhanced AI detections with rewards
          if (Math.random() > 0.6) {
            const detectionType = detectionTypes[Math.floor(Math.random() * detectionTypes.length)]
            const mockDetections = [
              {
                label: detectionType.name.split(" ")[0],
                type: detectionType.id,
                confidence: 0.8 + Math.random() * 0.2,
                x: Math.random() * 60,
                y: Math.random() * 60,
                width: 15 + Math.random() * 20,
                height: 15 + Math.random() * 20,
              },
            ]

            setAiDetections((prev) => ({
              ...prev,
              [cameraId]: mockDetections,
            }))

            // Award tokens for detections
            if (Math.random() > 0.7) {
              setUserTokens((prev) => prev + detectionType.reward)
              setSystemStats((prev) => ({
                ...prev,
                tokensEarned: prev.tokensEarned + detectionType.reward,
                detectionsToday: prev.detectionsToday + 1,
              }))

              // Add to recent detections
              const newDetection = {
                id: Date.now(),
                type: detectionType.id,
                camera: cameras.find((c) => c.id === Number.parseInt(cameraId))?.name,
                time: "now",
                confidence: mockDetections[0].confidence,
                reward: detectionType.reward,
              }
              setRecentDetections((prev) => [newDetection, ...prev.slice(0, 9)])
            }

            // Create highlights for special moments
            if (detectionType.id === "trick" && Math.random() > 0.8) {
              setHighlights((prev) => ({
                ...prev,
                [cameraId]: [{ type: "Amazing Trick!", timestamp: Date.now() }],
              }))
              setSystemStats((prev) => ({ ...prev, highlightsCreated: prev.highlightsCreated + 1 }))
            }
          }
        }
      })

      // Update system stats
      setSystemStats((prev) => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 8)),
        aiProcessing: Object.keys(activeCameras).filter((id) => activeCameras[id]).length * 15 + Math.random() * 10,
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCameras, cameras, groqConnected])

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" })
    }, 5000)
  }

  // Enhanced camera access with Continuity support
  const startCameraStream = async (cameraId) => {
    const camera = cameras.find((c) => c.id === cameraId)

    try {
      if (camera?.type === "continuity") {
        // Prompt for Continuity Camera
        const userConfirmed = window.confirm(
          "🍎 Enable Continuity Camera?\n\n" +
            "1. Make sure your iPhone is nearby\n" +
            "2. Both devices signed into same Apple ID\n" +
            "3. Bluetooth and WiFi enabled\n" +
            "4. iPhone iOS 16+ and macOS Ventura+\n\n" +
            "Click OK to continue with Continuity Camera",
        )

        if (!userConfirmed) return false

        showNotification("📱 Connecting to iPhone via Continuity Camera...", "info")

        // Simulate Continuity Camera connection
        setTimeout(() => {
          showNotification("🎉 Continuity Camera connected! Ultra HD quality enabled", "success")
        }, 3000)

        return true
      } else if (camera?.type === "webcam") {
        // Access local webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        })

        if (videoRefs.current[cameraId]) {
          videoRefs.current[cameraId].srcObject = stream
        }

        showNotification("📹 Local webcam connected successfully!", "success")
        return true
      } else {
        // RTSP connection
        showNotification(`🔗 Connecting to RTSP: ${camera?.rtsp_url}`, "info")
        return true
      }
    } catch (error) {
      showNotification("❌ Camera access denied or not available", "error")
      return false
    }
  }

  const toggleCamera = async (cameraId) => {
    if (!activeCameras[cameraId]) {
      const success = await startCameraStream(cameraId)
      if (success) {
        setActiveCameras((prev) => ({ ...prev, [cameraId]: true }))
        setConnectionStatus((prev) => ({ ...prev, [cameraId]: "connected" }))
      }
    } else {
      // Stop camera
      if (videoRefs.current[cameraId]?.srcObject) {
        const tracks = videoRefs.current[cameraId].srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }

      setActiveCameras((prev) => ({ ...prev, [cameraId]: false }))
      setVideoFeeds((prev) => ({ ...prev, [cameraId]: null }))
      setConnectionStatus((prev) => ({ ...prev, [cameraId]: "disconnected" }))
      showNotification(`📴 Stopped streaming from ${cameras.find((c) => c.id === cameraId)?.name}`)
    }
  }

  // Wallet connection
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setWalletAddress(accounts[0])
        setWalletConnected(true)
        setUserTokens(150) // Initial tokens
        setWalletDialog(false)
        showNotification("🎉 Wallet connected! Welcome to Lolanthropy!", "success")
      } else {
        showNotification("🦊 Please install MetaMask to connect wallet", "error")
      }
    } catch (error) {
      showNotification("❌ Failed to connect wallet", "error")
    }
  }

  // NFT Minting
  const mintNFT = async (highlight) => {
    if (!walletConnected) {
      showNotification("🔗 Please connect wallet first", "error")
      return
    }

    try {
      showNotification("🎨 Minting your pet NFT...", "info")

      // Simulate NFT minting
      setTimeout(() => {
        const newNFT = {
          id: Date.now(),
          name: `Pet Moment #${userNFTs.length + 1}`,
          image: `/placeholder.svg?height=300&width=300&text=🐕+NFT`,
          rarity: Math.random() > 0.7 ? "Rare" : "Common",
          timestamp: new Date().toISOString(),
        }

        setUserNFTs((prev) => [...prev, newNFT])
        setUserTokens((prev) => prev - 50) // Cost to mint
        setMintDialog(false)
        showNotification("🎉 NFT minted successfully! Check your collection", "success")
      }, 3000)
    } catch (error) {
      showNotification("❌ Failed to mint NFT", "error")
    }
  }

  const handleAddStream = () => {
    if (newStreamData.name && newStreamData.rtsp_url) {
      const newCamera = {
        id: cameras.length,
        name: newStreamData.name,
        rtsp_url: newStreamData.rtsp_url,
        connected: true,
        fps: 0,
        running: false,
        aiEnabled: true,
        type: "rtsp",
      }

      setCameras((prev) => [...prev, newCamera])
      setNewStreamData({ name: "", rtsp_url: "" })
      setAddStreamDialog(false)
      showNotification(`✅ Added new stream: ${newStreamData.name}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    return status === "connected" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />
  }

  const getCameraIcon = (type) => {
    switch (type) {
      case "continuity":
        return <Apple className="w-4 h-4" />
      case "webcam":
        return <Laptop className="w-4 h-4" />
      case "rtsp":
        return <Monitor className="w-4 h-4" />
      default:
        return <Camera className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-blue-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="container mx-auto py-8 px-4 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-orange-200 to-blue-200 bg-clip-text text-transparent mb-4 animate-in fade-in slide-in-from-top duration-1000">
            🐾 Lolanthropy AI
          </h1>
          <p className="text-2xl text-white/90 font-light mb-6 animate-in fade-in slide-in-from-top duration-1000 delay-300">
            AI-Powered Pet Streaming • Earn Tokens • Mint NFTs
          </p>

          {/* Enhanced Action Bar */}
          <div className="flex gap-4 justify-center flex-wrap mb-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
            {!walletConnected ? (
              <Dialog open={walletDialog} onOpenChange={setWalletDialog}>
                <DialogTrigger asChild>
                  <GradientButton variant="wallet" className="animate-bounce">
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </GradientButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Connect Your Wallet
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-600">
                      Connect your wallet to earn tokens and mint NFTs from your pet moments!
                    </p>
                    <div className="grid gap-3">
                      <Button onClick={connectWallet} className="w-full bg-orange-500 hover:bg-orange-600">
                        🦊 MetaMask
                      </Button>
                      <Button variant="outline" className="w-full">
                        🌈 Rainbow Wallet
                      </Button>
                      <Button variant="outline" className="w-full">
                        💙 Coinbase Wallet
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
                  <Wallet className="w-4 h-4 mr-2" />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Badge>
                <Badge className="bg-orange-500 text-white px-4 py-2 text-sm animate-pulse">
                  <Coins className="w-4 h-4 mr-2" />
                  {userTokens} LOLA
                </Badge>
              </div>
            )}

            <Dialog open={addStreamDialog} onOpenChange={setAddStreamDialog}>
              <DialogTrigger asChild>
                <GradientButton variant="blue">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stream
                </GradientButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Camera Stream</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Stream Name</Label>
                    <Input
                      id="name"
                      value={newStreamData.name}
                      onChange={(e) => setNewStreamData({ ...newStreamData, name: e.target.value })}
                      placeholder="My Pet Camera"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">RTSP URL</Label>
                    <Input
                      id="url"
                      value={newStreamData.rtsp_url}
                      onChange={(e) => setNewStreamData({ ...newStreamData, rtsp_url: e.target.value })}
                      placeholder="rtsp://192.168.1.100:8554/stream"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddStream} disabled={!newStreamData.name || !newStreamData.rtsp_url}>
                    Add Stream
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <GradientButton variant="orange" onClick={() => showNotification("🔄 Refreshing cameras...")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </GradientButton>

            {walletConnected && (
              <Dialog open={mintDialog} onOpenChange={setMintDialog}>
                <DialogTrigger asChild>
                  <GradientButton variant="gradient" className="animate-pulse">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mint NFT
                  </GradientButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Mint Pet NFT
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-600">
                      Turn your best pet moments into unique NFTs! Cost: 50 LOLA tokens
                    </p>
                    <div className="bg-gradient-to-r from-orange-100 to-blue-100 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Your Collection</h4>
                      <p className="text-sm">NFTs Owned: {userNFTs.length}</p>
                      <p className="text-sm">Highlights Available: {systemStats.highlightsCreated}</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => mintNFT()}
                      disabled={userTokens < 50}
                      className="w-full bg-gradient-to-r from-orange-500 to-blue-500"
                    >
                      {userTokens >= 50 ? "Mint NFT (50 LOLA)" : "Insufficient Tokens"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Notification */}
          {notification.show && (
            <Alert
              className={`max-w-md mx-auto mb-6 animate-in fade-in slide-in-from-top-5 duration-300 ${
                notification.type === "success"
                  ? "border-green-500 bg-green-50/90 backdrop-blur-sm"
                  : notification.type === "error"
                    ? "border-red-500 bg-red-50/90 backdrop-blur-sm"
                    : "border-blue-500 bg-blue-50/90 backdrop-blur-sm"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : notification.type === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Bell className="h-4 w-4 text-blue-500" />
              )}
              <AlertDescription className="text-slate-700 font-medium">{notification.message}</AlertDescription>
            </Alert>
          )}

          {/* Enhanced Tabs */}
          <Tabs defaultValue="streams" className="max-w-7xl mx-auto" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-1">
              <TabsTrigger
                value="streams"
                className="text-white data-[state=active]:bg-white/30 data-[state=active]:text-slate-700 rounded-xl transition-all duration-300"
              >
                <Camera className="w-4 h-4 mr-2" />
                Streams
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="text-white data-[state=active]:bg-white/30 data-[state=active]:text-slate-700 rounded-xl transition-all duration-300"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Analytics
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="text-white data-[state=active]:bg-white/30 data-[state=active]:text-slate-700 rounded-xl transition-all duration-300"
              >
                <Coins className="w-4 h-4 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="text-white data-[state=active]:bg-white/30 data-[state=active]:text-slate-700 rounded-xl transition-all duration-300"
              >
                <Activity className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="streams" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cameras.map((camera, index) => (
                  <AnimatedCard key={camera.id} delay={index * 200}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getCameraIcon(camera.type)}
                            <CardTitle className="text-slate-700">{camera.name}</CardTitle>
                          </div>
                          <Badge className={`${getStatusColor(connectionStatus[camera.id])} text-white`}>
                            {getStatusIcon(connectionStatus[camera.id])}
                            <span className="ml-1 capitalize">{connectionStatus[camera.id]}</span>
                          </Badge>
                          {camera.aiEnabled && groqConnected && (
                            <Badge className="bg-purple-500 text-white animate-pulse">
                              <Brain className="w-3 h-3 mr-1" />
                              Groq AI
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl hover:scale-105 transition-transform"
                          >
                            <Maximize className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl hover:scale-105 transition-transform"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-mono bg-slate-100 p-2 rounded-lg">
                        {camera.type === "continuity"
                          ? "📱 iPhone Continuity Camera"
                          : camera.type === "webcam"
                            ? "💻 Local Webcam"
                            : `🔗 ${camera.rtsp_url}`}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <VideoContainer
                        detections={aiDetections[camera.id] || []}
                        highlights={highlights[camera.id] || []}
                      >
                        {activeCameras[camera.id] ? (
                          camera.type === "webcam" ? (
                            <video
                              ref={(el) => (videoRefs.current[camera.id] = el)}
                              autoPlay
                              muted
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={videoFeeds[camera.id] || "/placeholder.svg"}
                              alt={`${camera.name} feed`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                            <div className="text-6xl mb-4 animate-bounce">
                              {camera.type === "continuity" ? "📱" : camera.type === "webcam" ? "💻" : "📹"}
                            </div>
                            <p className="text-lg opacity-70 text-center">
                              {camera.type === "continuity"
                                ? "Tap to connect iPhone Camera"
                                : camera.type === "webcam"
                                  ? "Click to access webcam"
                                  : "RTSP Stream Offline"}
                            </p>
                            {camera.type === "continuity" && (
                              <p className="text-sm opacity-50 text-center mt-2">
                                🍎 Requires iOS 16+ and macOS Ventura+
                              </p>
                            )}
                          </div>
                        )}

                        {activeCameras[camera.id] && (
                          <div className="absolute top-4 right-4 space-y-2">
                            <Badge className="bg-black/70 text-green-400 block">
                              <Video className="w-3 h-3 mr-1" />
                              {streamingStats[camera.id]?.fps || 0} FPS
                            </Badge>
                            {camera.aiEnabled && groqConnected && (
                              <Badge className="bg-black/70 text-purple-400 block animate-pulse">
                                <Brain className="w-3 h-3 mr-1" />
                                Groq AI
                              </Badge>
                            )}
                            {highlights[camera.id]?.length > 0 && (
                              <Badge className="bg-black/70 text-yellow-400 block animate-bounce">
                                <Star className="w-3 h-3 mr-1" />
                                Highlight!
                              </Badge>
                            )}
                          </div>
                        )}
                      </VideoContainer>

                      <div className="flex justify-between items-center">
                        <GradientButton
                          variant={activeCameras[camera.id] ? "orange" : "blue"}
                          active={activeCameras[camera.id]}
                          onClick={() => toggleCamera(camera.id)}
                          className="hover:scale-105 transition-transform"
                        >
                          {activeCameras[camera.id] ? (
                            <>
                              <Square className="w-4 h-4 mr-2" />
                              Stop Stream
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start Stream
                            </>
                          )}
                        </GradientButton>

                        {activeCameras[camera.id] && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-green-500 font-semibold text-sm">LIVE</span>
                            </div>
                            {aiDetections[camera.id]?.length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                <span className="text-purple-500 font-semibold text-sm">AI Active</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </AnimatedCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatedCard>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      Groq AI Settings
                    </h3>

                    <div className="space-y-4">
                      {detectionTypes.map((detection, index) => (
                        <div
                          key={detection.id}
                          className="flex items-center justify-between p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 ${detection.color} rounded-lg flex items-center justify-center text-white text-sm animate-pulse`}
                            >
                              {detection.icon}
                            </div>
                            <div>
                              <span className="font-medium">{detection.name}</span>
                              <p className="text-xs text-slate-500">+{detection.reward} LOLA per detection</p>
                            </div>
                          </div>
                          <Switch
                            checked={aiSettings[detection.id + "Detection"] !== false}
                            onCheckedChange={(checked) =>
                              setAiSettings((prev) => ({ ...prev, [detection.id + "Detection"]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Label>AI Quality Threshold: {Math.round(aiSettings.qualityThreshold * 100)}%</Label>
                      <Slider
                        value={[aiSettings.qualityThreshold]}
                        onValueChange={([value]) => setAiSettings((prev) => ({ ...prev, qualityThreshold: value }))}
                        max={1}
                        min={0.5}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={200}>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Recent AI Detections
                    </h3>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recentDetections.map((detection, index) => (
                        <div
                          key={detection.id}
                          className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors animate-in fade-in slide-in-from-left duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="text-2xl">
                            {detectionTypes.find((d) => d.id === detection.type)?.icon || "🔍"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium capitalize">{detection.type} detected</p>
                            <p className="text-sm text-slate-500">
                              {detection.camera} • {detection.time}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-500 text-white">{Math.round(detection.confidence * 100)}%</Badge>
                            <p className="text-xs text-orange-500 font-bold">+{detection.reward} LOLA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </AnimatedCard>
              </div>
            </TabsContent>

            <TabsContent value="rewards" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnimatedCard>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🪙</div>
                    <h3 className="text-2xl font-bold text-orange-500">{userTokens}</h3>
                    <p className="text-slate-600">LOLA Tokens</p>
                    <p className="text-xs text-slate-500 mt-2">Earned from AI detections</p>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={200}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-blue-500">{userNFTs.length}</h3>
                    <p className="text-slate-600">NFTs Minted</p>
                    <p className="text-xs text-slate-500 mt-2">Unique pet moments</p>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={400}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-2xl font-bold text-purple-500">{systemStats.highlightsCreated}</h3>
                    <p className="text-slate-600">Highlights Created</p>
                    <p className="text-xs text-slate-500 mt-2">AI-curated moments</p>
                  </CardContent>
                </AnimatedCard>

                {walletConnected && userNFTs.length > 0 && (
                  <AnimatedCard className="lg:col-span-3" delay={600}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                        <Trophy className="w-5 h-5 mr-2" />
                        Your NFT Collection
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {userNFTs.map((nft, index) => (
                          <div
                            key={nft.id}
                            className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-colors animate-in fade-in slide-in-from-bottom duration-500"
                            style={{ animationDelay: `${index * 200}ms` }}
                          >
                            <img
                              src={nft.image || "/placeholder.svg"}
                              alt={nft.name}
                              className="w-full h-32 object-cover rounded-lg mb-2"
                            />
                            <h4 className="font-semibold">{nft.name}</h4>
                            <Badge className={nft.rarity === "Rare" ? "bg-purple-500" : "bg-blue-500"}>
                              {nft.rarity}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </AnimatedCard>
                )}
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatedCard>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      System Performance
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                          {Object.values(activeCameras).filter(Boolean).length}
                        </div>
                        <p className="text-sm text-slate-600">Active Streams</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                          {systemStats.uptime}
                        </div>
                        <p className="text-sm text-slate-600">System Uptime</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU Usage</span>
                          <span>{Math.round(systemStats.cpuUsage)}%</span>
                        </div>
                        <Progress value={systemStats.cpuUsage} className="h-3 bg-slate-200" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Usage</span>
                          <span>{Math.round(systemStats.memoryUsage)}%</span>
                        </div>
                        <Progress value={systemStats.memoryUsage} className="h-3 bg-slate-200" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Groq AI Processing</span>
                          <span>{Math.round(systemStats.aiProcessing)}%</span>
                        </div>
                        <Progress value={systemStats.aiProcessing} className="h-3 bg-slate-200" />
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>

                <AnimatedCard delay={200}>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                      <Heart className="w-5 h-5 mr-2" />
                      AI Health Status
                    </h3>

                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="font-medium text-green-700">Groq AI Connected</span>
                        </div>
                        <p className="text-sm text-green-600">Real-time inference running smoothly</p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-medium text-blue-700">Camera Systems</span>
                        </div>
                        <p className="text-sm text-blue-600">All camera feeds operational</p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="font-medium text-orange-700">Token Rewards</span>
                        </div>
                        <p className="text-sm text-orange-600">Earning {systemStats.tokensEarned} LOLA today</p>
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
