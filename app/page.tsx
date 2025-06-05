"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Play, Square, Settings, Maximize, Video, Plus, RefreshCw, Wifi, WifiOff, Activity } from "lucide-react"

// Mock RTSP cameras data
const mockCameras = [
  {
    id: 0,
    name: "Phone Camera",
    rtsp_url: "rtsp://192.168.1.116:8554/stream",
    connected: true,
    fps: 25,
    running: false,
  },
  {
    id: 1,
    name: "Security Camera",
    rtsp_url: "rtsp://192.168.1.117:8554/stream",
    connected: false,
    fps: 0,
    running: false,
  },
]

// Neomorphic Card Component
const NeomorphicCard = ({ children, className = "", ...props }) => (
  <Card
    className={`
      bg-gradient-to-br from-slate-50 to-blue-50 
      shadow-[20px_20px_40px_rgba(0,0,0,0.1),-20px_-20px_40px_rgba(255,255,255,0.8)]
      border border-white/20 rounded-3xl transition-all duration-300 hover:shadow-[25px_25px_50px_rgba(0,0,0,0.15),-25px_-25px_50px_rgba(255,255,255,0.9)]
      hover:-translate-y-1 ${className}
    `}
    {...props}
  >
    {children}
  </Card>
)

// Neomorphic Button Component
const NeomorphicButton = ({ children, active = false, variant = "orange", className = "", ...props }) => {
  const variants = {
    orange: active
      ? "bg-gradient-to-br from-orange-500 to-orange-600 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.2),inset_-8px_-8px_16px_rgba(255,255,255,0.1)]"
      : "bg-gradient-to-br from-orange-400 to-orange-500 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]",
    blue: active
      ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.2),inset_-8px_-8px_16px_rgba(255,255,255,0.1)]"
      : "bg-gradient-to-br from-blue-400 to-blue-500 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]",
    green:
      "bg-gradient-to-br from-green-400 to-green-500 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)]",
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

// Video Feed Container
const VideoFeedContainer = ({ children, className = "" }) => (
  <div
    className={`
    relative w-full pt-[56.25%] rounded-2xl overflow-hidden
    bg-gradient-to-br from-slate-800 to-slate-900
    shadow-[inset_8px_8px_16px_rgba(0,0,0,0.3),inset_-8px_-8px_16px_rgba(255,255,255,0.05)]
    border-2 border-white/10 ${className}
  `}
  >
    {children}
  </div>
)

export default function LolanthropyApp() {
  const [cameras, setCameras] = useState(mockCameras)
  const [activeCameras, setActiveCameras] = useState({})
  const [videoFeeds, setVideoFeeds] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({})
  const [streamingStats, setStreamingStats] = useState({})
  const [addStreamDialog, setAddStreamDialog] = useState(false)
  const [newStreamData, setNewStreamData] = useState({ name: "", rtsp_url: "" })

  // Initialize camera states
  useEffect(() => {
    const feeds = {}
    const status = {}
    const stats = {}

    cameras.forEach((cam) => {
      feeds[cam.id] = null
      status[cam.id] = cam.connected ? "connected" : "disconnected"
      stats[cam.id] = { fps: cam.fps, lastFrame: null }
    })

    setVideoFeeds(feeds)
    setConnectionStatus(status)
    setStreamingStats(stats)
  }, [cameras])

  // Mock video feed simulation
  useEffect(() => {
    const interval = setInterval(() => {
      Object.keys(activeCameras).forEach((cameraId) => {
        if (activeCameras[cameraId]) {
          // Simulate receiving video frames
          setVideoFeeds((prev) => ({
            ...prev,
            [cameraId]: `/placeholder.svg?height=480&width=640&text=Live+RTSP+Stream+${Number.parseInt(cameraId) + 1}`,
          }))

          // Update FPS
          setStreamingStats((prev) => ({
            ...prev,
            [cameraId]: {
              ...prev[cameraId],
              fps: Math.floor(Math.random() * 5) + 25, // 25-30 FPS
            },
          }))
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCameras])

  const toggleCamera = (cameraId) => {
    setActiveCameras((prev) => ({
      ...prev,
      [cameraId]: !prev[cameraId],
    }))

    if (!activeCameras[cameraId]) {
      setConnectionStatus((prev) => ({
        ...prev,
        [cameraId]: "connected",
      }))
    } else {
      setVideoFeeds((prev) => ({
        ...prev,
        [cameraId]: null,
      }))
      setConnectionStatus((prev) => ({
        ...prev,
        [cameraId]: "disconnected",
      }))
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
      }

      setCameras((prev) => [...prev, newCamera])
      setNewStreamData({ name: "", rtsp_url: "" })
      setAddStreamDialog(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-transparent to-blue-400/30 pointer-events-none" />

      <div className="container mx-auto py-8 px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-blue-500 bg-clip-text text-transparent mb-4">
            🐾 Lolanthropy RTSP Stream
          </h1>
          <p className="text-xl text-white/80 font-light mb-6">Real-time Pet Monitoring via RTSP</p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Dialog open={addStreamDialog} onOpenChange={setAddStreamDialog}>
              <DialogTrigger asChild>
                <NeomorphicButton variant="green">
                  <Plus className="w-4 h-4 mr-2" />
                  Add RTSP Stream
                </NeomorphicButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New RTSP Stream</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                  <Button onClick={handleAddStream} className="w-full">
                    Add Stream
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <NeomorphicButton variant="blue">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Cameras
            </NeomorphicButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feeds */}
          {cameras.map((camera) => (
            <NeomorphicCard key={camera.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-slate-700">{camera.name}</CardTitle>
                    <Badge className={`${getStatusColor(connectionStatus[camera.id])} text-white`}>
                      {getStatusIcon(connectionStatus[camera.id])}
                      <span className="ml-1 capitalize">{camera.connected ? "Connected" : "Disconnected"}</span>
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl">
                      <Maximize className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-slate-500">RTSP: {camera.rtsp_url}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Video Feed */}
                <VideoFeedContainer>
                  {videoFeeds[camera.id] ? (
                    <img
                      src={videoFeeds[camera.id] || "/placeholder.svg"}
                      alt={`${camera.name} feed`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60">
                      <Camera className="w-16 h-16 mb-4 opacity-30" />
                      <p className="text-lg opacity-70">
                        {activeCameras[camera.id] ? "Connecting to RTSP..." : "RTSP Stream Offline"}
                      </p>
                      {!camera.connected && (
                        <p className="text-sm opacity-50 text-center mt-2">Check RTSP URL and network connection</p>
                      )}
                    </div>
                  )}

                  {/* Stream Overlay */}
                  {activeCameras[camera.id] && videoFeeds[camera.id] && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-black/70 text-green-400">
                        <Video className="w-3 h-3 mr-1" />
                        {streamingStats[camera.id]?.fps || 0} FPS
                      </Badge>
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

                  {activeCameras[camera.id] && videoFeeds[camera.id] && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-500 font-semibold text-sm">LIVE RTSP</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </NeomorphicCard>
          ))}

          {/* System Dashboard */}
          <NeomorphicCard className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-slate-700">RTSP System Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    {Object.values(activeCameras).filter(Boolean).length}
                  </div>
                  <p className="text-sm text-slate-600">Active Streams</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                    {cameras.length}
                  </div>
                  <p className="text-sm text-slate-600">RTSP Cameras</p>
                </div>
              </div>

              {/* Stream Quality */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Stream Quality
                </h4>
                <div className="space-y-3">
                  {cameras.map((camera) => (
                    <div key={camera.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{camera.name}</span>
                        <span>{streamingStats[camera.id]?.fps || 0} FPS</span>
                      </div>
                      <Progress value={Math.min((streamingStats[camera.id]?.fps || 0) * 3.33, 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>• RTSP stream connected (Phone Camera)</p>
                  <p>• Stream quality optimized (5 min ago)</p>
                  <p>• System health check completed (10 min ago)</p>
                </div>
              </div>
            </CardContent>
          </NeomorphicCard>
        </div>
      </div>
    </div>
  )
}
