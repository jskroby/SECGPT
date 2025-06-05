"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
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
  Eye,
  Zap,
  Heart,
  Bell,
  Download,
} from "lucide-react"

// Mock RTSP cameras data with AI capabilities
const mockCameras = [
  {
    id: 0,
    name: "Phone Camera",
    rtsp_url: "rtsp://192.168.1.116:8554/stream",
    connected: true,
    fps: 25,
    running: false,
    aiEnabled: true,
    detections: [],
  },
  {
    id: 1,
    name: "Security Camera",
    rtsp_url: "rtsp://192.168.1.117:8554/stream",
    connected: false,
    fps: 0,
    running: false,
    aiEnabled: false,
    detections: [],
  },
]

// AI Detection types
const detectionTypes = [
  { id: "pet", name: "Pet Detection", icon: "🐕", color: "bg-blue-500" },
  { id: "person", name: "Person Detection", icon: "👤", color: "bg-green-500" },
  { id: "motion", name: "Motion Detection", icon: "🏃", color: "bg-orange-500" },
  { id: "activity", name: "Activity Analysis", icon: "⚡", color: "bg-purple-500" },
]

// Neomorphic Card Component
function NeomorphicCard({ children, className = "", ...props }) {
  return (
    <Card
      className={`
        bg-gradient-to-br from-slate-50 to-blue-50
        shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.8)]
        border border-white/20 rounded-3xl transition-all duration-300
        hover:shadow-[25px_25px_50px_rgba(0,0,0,0.15),-25px_-25px_50px_rgba(255,255,255,0.9)]
        hover:-translate-y-1 ${className}
      `}
      {...props}
    >
      {children}
    </Card>
  )
}

// Neomorphic Button Component
function NeomorphicButton({ children, active = false, variant = "orange", className = "", ...props }) {
  const variants = {
    orange: active
      ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.2),inset_-8px_-8px_16px_rgba(255,255,255,0.1)]"
      : "bg-gradient-to-br from-orange-400 to-orange-500 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]",
    blue: active
      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.2),inset_-8px_-8px_16px_rgba(255,255,255,0.1)]"
      : "bg-gradient-to-br from-blue-400 to-blue-500 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]",
    green:
      "bg-gradient-to-br from-green-400 to-green-500 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]",
    purple:
      "bg-gradient-to-br from-purple-400 to-purple-500 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]",
  }

  return (
    <Button
      className={`
        ${variants[variant]} text-white font-semibold rounded-2xl px-6 py-3
        transition-all duration-200 hover:scale-105 active:scale-95 border-0
        ${active ? "scale-95" : ""} ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  )
}

// Video Feed Container with AI Overlay
function VideoFeedContainer({ children, detections = [], className = "" }) {
  return (
    <div
      className={`
        relative w-full pt-[56.25%] rounded-2xl overflow-hidden
        bg-gradient-to-br from-slate-800 to-slate-900
        shadow-[inset_8px_8px_16px_rgba(0,0,0,0.3),inset_-8px_-8px_16px_rgba(255,255,255,0.05)]
        border-2 border-white/10 ${className}
      `}
    >
      {children}

      {/* AI Detection Overlays */}
      {detections.map((detection, index) => (
        <div
          key={index}
          className="absolute border-2 border-red-500 bg-red-500/20 rounded"
          style={{
            left: `${detection.x}%`,
            top: `${detection.y}%`,
            width: `${detection.width}%`,
            height: `${detection.height}%`,
          }}
        >
          <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {detection.label} ({Math.round(detection.confidence * 100)}%)
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LolanthropyApp() {
  const [cameras, setCameras] = useState(mockCameras)
  const [activeCameras, setActiveCameras] = useState({})
  const [videoFeeds, setVideoFeeds] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({})
  const [streamingStats, setStreamingStats] = useState({})
  const [aiDetections, setAiDetections] = useState({})
  const [addStreamDialog, setAddStreamDialog] = useState(false)
  const [newStreamData, setNewStreamData] = useState({ name: "", rtsp_url: "" })
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })
  const [activeTab, setActiveTab] = useState("streams")
  const [aiSettings, setAiSettings] = useState({
    petDetection: true,
    personDetection: true,
    motionDetection: true,
    activityAnalysis: true,
    alertThreshold: 0.7,
    recordingEnabled: false,
  })
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    uptime: "12h 34m",
    activeConnections: 2,
    aiProcessing: 0,
    detectionsToday: 127,
  })
  const [recentDetections, setRecentDetections] = useState([
    { id: 1, type: "pet", camera: "Phone Camera", time: "2 min ago", confidence: 0.95 },
    { id: 2, type: "motion", camera: "Phone Camera", time: "5 min ago", confidence: 0.87 },
    { id: 3, type: "person", camera: "Security Camera", time: "12 min ago", confidence: 0.92 },
  ])

  const videoRefs = useRef({})

  // Initialize camera states
  useEffect(() => {
    const feeds = {}
    const status = {}
    const stats = {}
    const detections = {}

    cameras.forEach((cam) => {
      feeds[cam.id] = null
      status[cam.id] = cam.connected ? "connected" : "disconnected"
      stats[cam.id] = { fps: cam.fps, lastFrame: null }
      detections[cam.id] = []
    })

    setVideoFeeds(feeds)
    setConnectionStatus(status)
    setStreamingStats(stats)
    setAiDetections(detections)
  }, [cameras])

  // Mock video feed simulation with AI processing
  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(activeCameras).forEach((cameraId) => {
        if (activeCameras[cameraId]) {
          // Simulate receiving video frames
          setVideoFeeds((prev) => ({
            ...prev,
            [cameraId]: `/placeholder.svg?height=480&width=640&text=📹+AI+Enhanced+Stream+${Number.parseInt(cameraId) + 1}`,
          }))

          // Update FPS with realistic variation
          setStreamingStats((prev) => ({
            ...prev,
            [cameraId]: {
              ...prev[cameraId],
              fps: Math.floor(Math.random() * 5) + 25, // 25-30 FPS
            },
          }))

          // Simulate AI detections
          if (cameras.find((c) => c.id === Number.parseInt(cameraId))?.aiEnabled && Math.random() > 0.7) {
            const mockDetections = [
              {
                label: "Dog",
                confidence: 0.85 + Math.random() * 0.15,
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

            // Add to recent detections
            if (Math.random() > 0.8) {
              const newDetection = {
                id: Date.now(),
                type: "pet",
                camera: cameras.find((c) => c.id === Number.parseInt(cameraId))?.name,
                time: "now",
                confidence: mockDetections[0].confidence,
              }

              setRecentDetections((prev) => [newDetection, ...prev.slice(0, 9)])
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
  }, [activeCameras, cameras])

  // Camera access for real connectivity
  const startCameraStream = async (cameraId) => {
    try {
      // Try to access user's camera for demo
      if (cameraId === 0) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        })

        if (videoRefs.current[cameraId]) {
          videoRefs.current[cameraId].srcObject = stream
        }

        showNotification("Connected to local camera successfully!", "success")
        return true
      }

      // For other cameras, simulate RTSP connection
      showNotification(`Connecting to RTSP stream: ${cameras.find((c) => c.id === cameraId)?.rtsp_url}`, "success")
      return true
    } catch (error) {
      showNotification("Camera access denied or not available", "error")
      return false
    }
  }

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" })
    }, 5000)
  }

  const toggleCamera = async (cameraId) => {
    if (!activeCameras[cameraId]) {
      const success = await startCameraStream(cameraId)
      if (success) {
        setActiveCameras((prev) => ({
          ...prev,
          [cameraId]: true,
        }))
        setConnectionStatus((prev) => ({
          ...prev,
          [cameraId]: "connected",
        }))
      }
    } else {
      // Stop camera
      if (videoRefs.current[cameraId]?.srcObject) {
        const tracks = videoRefs.current[cameraId].srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }

      setActiveCameras((prev) => ({
        ...prev,
        [cameraId]: false,
      }))
      setVideoFeeds((prev) => ({
        ...prev,
        [cameraId]: null,
      }))
      setConnectionStatus((prev) => ({
        ...prev,
        [cameraId]: "disconnected",
      }))
      showNotification(`Stopped streaming from Camera ${cameraId + 1}`)
    }
  }

  const toggleAI = (cameraId) => {
    setCameras((prev) => prev.map((cam) => (cam.id === cameraId ? { ...cam, aiEnabled: !cam.aiEnabled } : cam)))

    const camera = cameras.find((c) => c.id === cameraId)
    showNotification(`AI ${camera?.aiEnabled ? "disabled" : "enabled"} for ${camera?.name}`, "success")
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
        detections: [],
      }

      setCameras((prev) => [...prev, newCamera])
      setNewStreamData({ name: "", rtsp_url: "" })
      setAddStreamDialog(false)
      showNotification(`Added new RTSP stream: ${newStreamData.name}`)
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

  const getDetectionIcon = (type) => {
    const detection = detectionTypes.find((d) => d.id === type)
    return detection?.icon || "🔍"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-transparent to-blue-400/30 pointer-events-none" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 bg-clip-text text-transparent mb-4">
            🐾 Lolanthropy AI Stream
          </h1>
          <p className="text-xl text-white/80 font-light mb-6">AI-Powered Pet Monitoring via RTSP</p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap mb-6">
            <Dialog open={addStreamDialog} onOpenChange={setAddStreamDialog}>
              <DialogTrigger asChild>
                <NeomorphicButton variant="green">
                  <Plus className="w-4 h-4 mr-2" />
                  Add RTSP Stream
                </NeomorphicButton>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New RTSP Stream</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Stream Name</Label>
                    <Input
                      id="name"
                      value={newStreamData.name}
                      onChange={(e) => setNewStreamData({ ...newStreamData, name: e.target.value })}
                      placeholder="Enter stream name"
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
                  <Button
                    onClick={handleAddStream}
                    disabled={!newStreamData.name || !newStreamData.rtsp_url}
                    className="w-full"
                  >
                    Add Stream
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <NeomorphicButton variant="blue" onClick={() => showNotification("Cameras refreshed successfully")}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Cameras
            </NeomorphicButton>

            <NeomorphicButton variant="purple">
              <Brain className="w-4 h-4 mr-2" />
              AI Settings
            </NeomorphicButton>
          </div>

          {/* Notification */}
          {notification.show && (
            <Alert
              className={`max-w-md mx-auto mb-6 animate-in fade-in slide-in-from-top-5 duration-300 ${
                notification.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className="text-slate-700">{notification.message}</AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs defaultValue="streams" className="max-w-7xl mx-auto" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6 bg-white/20 backdrop-blur-sm">
              <TabsTrigger
                value="streams"
                className="text-white data-[state=active]:bg-white/30 data-[state=active]:text-slate-700"
              >
                Camera Streams
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="text-white data-[state=active]:bg-white/30 data-[state=active]:text-slate-700"
              >
                AI Analytics
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="text-white data-[state=active]:bg-white/30 data-[state=active]:text-slate-700"
              >
                System Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="streams" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Camera Feeds */}
                {cameras.map((camera) => (
                  <NeomorphicCard key={camera.id}>
                    <CardContent className="p-6 space-y-4">
                      {/* Camera Header */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold text-slate-700">{camera.name}</h3>
                          <Badge className={`${getStatusColor(connectionStatus[camera.id])} text-white`}>
                            {getStatusIcon(connectionStatus[camera.id])}
                            <span className="ml-1 capitalize">{connectionStatus[camera.id]}</span>
                          </Badge>
                          {camera.aiEnabled && (
                            <Badge className="bg-purple-500 text-white">
                              <Brain className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => toggleAI(camera.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <Maximize className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-500 font-mono bg-slate-100 p-2 rounded-lg">
                        RTSP: {camera.rtsp_url}
                      </p>

                      {/* Video Feed */}
                      <VideoFeedContainer detections={aiDetections[camera.id] || []}>
                        {activeCameras[camera.id] ? (
                          camera.id === 0 ? (
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
                            <Camera className="w-16 h-16 mb-4 opacity-30" />
                            <p className="text-lg opacity-70">
                              {camera.id === 0 ? "Click to access local camera" : "RTSP Stream Offline"}
                            </p>
                            {!camera.connected && (
                              <p className="text-sm opacity-50 text-center mt-2">
                                Check RTSP URL and network connection
                              </p>
                            )}
                          </div>
                        )}

                        {/* Stream Overlay */}
                        {activeCameras[camera.id] && (
                          <div className="absolute top-4 right-4 space-y-2">
                            <Badge className="bg-black/70 text-green-400 block">
                              <Video className="w-3 h-3 mr-1" />
                              {streamingStats[camera.id]?.fps || 0} FPS
                            </Badge>
                            {camera.aiEnabled && (
                              <Badge className="bg-black/70 text-purple-400 block">
                                <Brain className="w-3 h-3 mr-1" />
                                AI Active
                              </Badge>
                            )}
                          </div>
                        )}
                      </VideoFeedContainer>

                      {/* Controls */}
                      <div className="flex justify-between items-center">
                        <NeomorphicButton
                          variant={activeCameras[camera.id] ? "orange" : "blue"}
                          active={activeCameras[camera.id]}
                          onClick={() => toggleCamera(camera.id)}
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
                        </NeomorphicButton>

                        {activeCameras[camera.id] && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-green-500 font-semibold text-sm">LIVE</span>
                            </div>
                            {camera.aiEnabled && aiDetections[camera.id]?.length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                <span className="text-purple-500 font-semibold text-sm">
                                  {aiDetections[camera.id].length} Detection
                                  {aiDetections[camera.id].length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </NeomorphicCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ai" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Detection Settings */}
                <NeomorphicCard>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      AI Detection Settings
                    </h3>

                    <div className="space-y-4">
                      {detectionTypes.map((detection) => (
                        <div
                          key={detection.id}
                          className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 ${detection.color} rounded-lg flex items-center justify-center text-white text-sm`}
                            >
                              {detection.icon}
                            </div>
                            <span className="font-medium">{detection.name}</span>
                          </div>
                          <Switch
                            checked={aiSettings[detection.id.replace(" ", "")]}
                            onCheckedChange={(checked) =>
                              setAiSettings((prev) => ({ ...prev, [detection.id.replace(" ", "")]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <Label>Alert Threshold: {Math.round(aiSettings.alertThreshold * 100)}%</Label>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.05"
                        value={aiSettings.alertThreshold}
                        onChange={(e) =>
                          setAiSettings((prev) => ({ ...prev, alertThreshold: Number.parseFloat(e.target.value) }))
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Download className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">Auto Recording</span>
                      </div>
                      <Switch
                        checked={aiSettings.recordingEnabled}
                        onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, recordingEnabled: checked }))}
                      />
                    </div>
                  </CardContent>
                </NeomorphicCard>

                {/* Recent Detections */}
                <NeomorphicCard>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Recent Detections
                    </h3>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recentDetections.map((detection) => (
                        <div key={detection.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                          <div className="text-2xl">{getDetectionIcon(detection.type)}</div>
                          <div className="flex-1">
                            <p className="font-medium capitalize">{detection.type} detected</p>
                            <p className="text-sm text-slate-500">
                              {detection.camera} • {detection.time}
                            </p>
                          </div>
                          <Badge className="bg-green-500 text-white">{Math.round(detection.confidence * 100)}%</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </NeomorphicCard>

                {/* AI Performance Metrics */}
                <NeomorphicCard className="lg:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      AI Performance Metrics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                          {systemStats.detectionsToday}
                        </div>
                        <p className="text-sm text-slate-600">Detections Today</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                          {Math.round(systemStats.aiProcessing)}%
                        </div>
                        <p className="text-sm text-slate-600">AI Processing Load</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                          98.5%
                        </div>
                        <p className="text-sm text-slate-600">Accuracy Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                          45ms
                        </div>
                        <p className="text-sm text-slate-600">Avg Response Time</p>
                      </div>
                    </div>
                  </CardContent>
                </NeomorphicCard>
              </div>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Stats */}
                <NeomorphicCard>
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
                          <span>AI Processing</span>
                          <span>{Math.round(systemStats.aiProcessing)}%</span>
                        </div>
                        <Progress value={systemStats.aiProcessing} className="h-3 bg-slate-200" />
                      </div>
                    </div>
                  </CardContent>
                </NeomorphicCard>

                {/* Stream Quality */}
                <NeomorphicCard>
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                      <Video className="w-5 h-5 mr-2" />
                      Stream Quality
                    </h3>

                    <div className="space-y-4">
                      {cameras.map((camera) => (
                        <div key={camera.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{camera.name}</span>
                            <span>{streamingStats[camera.id]?.fps || 0} FPS</span>
                          </div>
                          <Progress
                            value={Math.min((streamingStats[camera.id]?.fps || 0) * 3.33, 100)}
                            className="h-3 bg-slate-200"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </NeomorphicCard>

                {/* Health Monitoring */}
                <NeomorphicCard className="lg:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2" />
                      System Health
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-green-700">All Systems Operational</span>
                        </div>
                        <p className="text-sm text-green-600">All cameras and AI services running normally</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-blue-700">Network Status</span>
                        </div>
                        <p className="text-sm text-blue-600">Stable connection to all RTSP streams</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-purple-700">AI Processing</span>
                        </div>
                        <p className="text-sm text-purple-600">Real-time inference running smoothly</p>
                      </div>
                    </div>
                  </CardContent>
                </NeomorphicCard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
