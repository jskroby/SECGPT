"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material"
import {
  CameraAlt,
  PlayArrow,
  Stop,
  Settings,
  Fullscreen,
  VideoCall,
  Add,
  Refresh,
  SignalWifiOff,
  SignalWifi4Bar,
} from "@mui/icons-material"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000"

// Neomorphic styled components
const NeomorphicCard = ({ children, sx = {}, ...props }) => (
  <Card
    sx={{
      background: "linear-gradient(145deg, #f0f4f8, #d6e8f5)",
      borderRadius: "20px",
      boxShadow: `
        20px 20px 40px rgba(0, 0, 0, 0.1),
        -20px -20px 40px rgba(255, 255, 255, 0.8),
        inset 0px 0px 0px rgba(255, 255, 255, 0)
      `,
      border: "1px solid rgba(255, 255, 255, 0.2)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: `
          25px 25px 50px rgba(0, 0, 0, 0.15),
          -25px -25px 50px rgba(255, 255, 255, 0.9),
          inset 0px 0px 0px rgba(255, 255, 255, 0)
        `,
      },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Card>
)

const NeomorphicButton = ({ children, active = false, gradient = "orange", ...props }) => {
  const gradients = {
    orange: active ? "linear-gradient(145deg, #ff6b35, #f7931e)" : "linear-gradient(145deg, #ffa726, #ff8a50)",
    blue: active ? "linear-gradient(145deg, #1e88e5, #1976d2)" : "linear-gradient(145deg, #42a5f5, #2196f3)",
    neutral: "linear-gradient(145deg, #e0e7ff, #c7d2fe)",
    green: "linear-gradient(145deg, #4caf50, #388e3c)",
  }

  return (
    <Button
      sx={{
        background: gradients[gradient],
        borderRadius: "15px",
        boxShadow: active
          ? `
            inset 8px 8px 16px rgba(0, 0, 0, 0.2),
            inset -8px -8px 16px rgba(255, 255, 255, 0.1)
          `
          : `
            8px 8px 16px rgba(0, 0, 0, 0.1),
            -8px -8px 16px rgba(255, 255, 255, 0.8)
          `,
        color: "white",
        fontWeight: 600,
        textTransform: "none",
        padding: "12px 24px",
        transition: "all 0.2s ease",
        "&:hover": {
          background: gradients[gradient],
          transform: active ? "scale(0.98)" : "scale(1.02)",
          boxShadow: active
            ? `
              inset 10px 10px 20px rgba(0, 0, 0, 0.25),
              inset -10px -10px 20px rgba(255, 255, 255, 0.1)
            `
            : `
              12px 12px 24px rgba(0, 0, 0, 0.15),
              -12px -12px 24px rgba(255, 255, 255, 0.9)
            `,
        },
        "&:active": {
          transform: "scale(0.95)",
        },
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

const VideoFeedContainer = ({ children, ...props }) => (
  <Box
    sx={{
      position: "relative",
      paddingTop: "56.25%",
      borderRadius: "16px",
      overflow: "hidden",
      background: "linear-gradient(145deg, #1a1a2e, #16213e)",
      boxShadow: `
        inset 8px 8px 16px rgba(0, 0, 0, 0.3),
        inset -8px -8px 16px rgba(255, 255, 255, 0.05)
      `,
      border: "2px solid rgba(255, 255, 255, 0.1)",
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Box>
)

function App() {
  const [cameras, setCameras] = useState([])
  const [activeCameras, setActiveCameras] = useState({})
  const [videoFeeds, setVideoFeeds] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({})
  const [streamingStats, setStreamingStats] = useState({})
  const [addStreamDialog, setAddStreamDialog] = useState(false)
  const [newStreamData, setNewStreamData] = useState({ name: "", rtsp_url: "" })
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" })
  const websockets = useRef({})

  // Initialize cameras
  useEffect(() => {
    fetchCameras()
    // Refresh camera list every 30 seconds
    const interval = setInterval(fetchCameras, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCameras = async () => {
    try {
      const response = await fetch(`${API_URL}/api/cameras`)
      const data = await response.json()
      setCameras(data)

      // Initialize states
      const feeds = {}
      const status = {}
      const stats = {}
      data.forEach((cam) => {
        feeds[cam.id] = videoFeeds[cam.id] || null
        status[cam.id] = cam.connected ? "connected" : "disconnected"
        stats[cam.id] = { fps: cam.fps || 0, lastFrame: null }
      })
      setVideoFeeds(feeds)
      setConnectionStatus(status)
      setStreamingStats(stats)
    } catch (error) {
      console.error("Error fetching cameras:", error)
      showNotification("Error fetching camera list", "error")
    }
  }

  const showNotification = (message, severity = "info") => {
    setNotification({ open: true, message, severity })
  }

  // WebSocket connection management
  const connectWebSocket = (cameraId) => {
    if (websockets.current[cameraId]) {
      websockets.current[cameraId].close()
    }

    const wsUrl = `ws://localhost:8000/ws/video/${cameraId}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log(`WebSocket connected for camera ${cameraId}`)
      setConnectionStatus((prev) => ({
        ...prev,
        [cameraId]: "connected",
      }))
      showNotification(`Camera ${cameraId + 1} connected`, "success")
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.error) {
          console.error(`Camera ${cameraId} error:`, data.error)
          showNotification(data.error, "error")
          return
        }

        const { camera_id, frame, timestamp, fps } = data

        setVideoFeeds((prev) => ({
          ...prev,
          [camera_id]: `data:image/jpeg;base64,${frame}`,
        }))

        // Update streaming stats
        setStreamingStats((prev) => ({
          ...prev,
          [camera_id]: {
            fps: fps || 0,
            lastFrame: timestamp * 1000,
          },
        }))
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.onclose = () => {
      console.log(`WebSocket disconnected for camera ${cameraId}`)
      setConnectionStatus((prev) => ({
        ...prev,
        [cameraId]: "disconnected",
      }))
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error for camera ${cameraId}:`, error)
      setConnectionStatus((prev) => ({
        ...prev,
        [cameraId]: "error",
      }))
      showNotification(`Connection error for Camera ${cameraId + 1}`, "error")
    }

    websockets.current[cameraId] = ws
  }

  // Handle camera toggle
  const toggleCamera = async (cameraId) => {
    try {
      if (activeCameras[cameraId]) {
        // Stop camera
        const response = await fetch(`${API_URL}/api/stop-camera/${cameraId}`, {
          method: "POST",
        })
        const result = await response.json()

        if (response.ok) {
          if (websockets.current[cameraId]) {
            websockets.current[cameraId].close()
            delete websockets.current[cameraId]
          }
          setActiveCameras((prev) => ({
            ...prev,
            [cameraId]: false,
          }))
          setVideoFeeds((prev) => ({
            ...prev,
            [cameraId]: null,
          }))
          showNotification(result.message, "success")
        } else {
          showNotification(result.detail || "Failed to stop camera", "error")
        }
      } else {
        // Start camera
        const response = await fetch(`${API_URL}/api/start-camera/${cameraId}`, {
          method: "POST",
        })
        const result = await response.json()

        if (response.ok) {
          connectWebSocket(cameraId)
          setActiveCameras((prev) => ({
            ...prev,
            [cameraId]: true,
          }))
          showNotification(result.message, "success")
        } else {
          showNotification(result.detail || "Failed to start camera", "error")
        }
      }
    } catch (error) {
      console.error(`Error toggling camera ${cameraId}:`, error)
      showNotification(`Error toggling camera ${cameraId + 1}`, "error")
    }
  }

  // Add new RTSP stream
  const handleAddStream = async () => {
    try {
      const response = await fetch(`${API_URL}/api/add-rtsp-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStreamData),
      })

      const result = await response.json()

      if (response.ok) {
        setAddStreamDialog(false)
        setNewStreamData({ name: "", rtsp_url: "" })
        fetchCameras()
        showNotification(result.message, "success")
      } else {
        showNotification(result.detail || "Failed to add stream", "error")
      }
    } catch (error) {
      console.error("Error adding stream:", error)
      showNotification("Error adding stream", "error")
    }
  }

  // Cleanup WebSockets on unmount
  useEffect(() => {
    return () => {
      Object.values(websockets.current).forEach((ws) => ws.close())
    }
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "#4caf50"
      case "error":
        return "#f44336"
      default:
        return "#9e9e9e"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <SignalWifi4Bar />
      case "error":
        return <SignalWifiOff />
      default:
        return <SignalWifiOff />
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
          radial-gradient(circle at 20% 80%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(33, 150, 243, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 193, 7, 0.2) 0%, transparent 50%)
        `,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(45deg, #ff6b35, #f7931e, #1e88e5)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 4px 8px rgba(0,0,0,0.1)",
              mb: 2,
            }}
          >
            🐾 Lolanthropy RTSP Stream
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 300, mb: 3 }}>
            Real-time Pet Monitoring via RTSP
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <NeomorphicButton gradient="green" startIcon={<Add />} onClick={() => setAddStreamDialog(true)}>
              Add RTSP Stream
            </NeomorphicButton>
            <NeomorphicButton gradient="blue" startIcon={<Refresh />} onClick={fetchCameras}>
              Refresh Cameras
            </NeomorphicButton>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Camera Feeds */}
          {cameras.map((camera) => (
            <Grid item xs={12} lg={6} key={camera.id}>
              <NeomorphicCard>
                <CardContent sx={{ p: 3 }}>
                  {/* Camera Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50" }}>
                        {camera.name}
                      </Typography>
                      <Chip
                        size="small"
                        icon={getStatusIcon(connectionStatus[camera.id])}
                        label={camera.connected ? "Connected" : "Disconnected"}
                        sx={{
                          backgroundColor: getStatusColor(connectionStatus[camera.id]),
                          color: "white",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{
                          background: "linear-gradient(145deg, #e3f2fd, #bbdefb)",
                          boxShadow: "4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.8)",
                        }}
                      >
                        <Fullscreen />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          background: "linear-gradient(145deg, #e3f2fd, #bbdefb)",
                          boxShadow: "4px 4px 8px rgba(0,0,0,0.1), -4px -4px 8px rgba(255,255,255,0.8)",
                        }}
                      >
                        <Settings />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* RTSP URL Display */}
                  <Typography variant="caption" sx={{ color: "#666", mb: 2, display: "block" }}>
                    RTSP: {camera.rtsp_url}
                  </Typography>

                  {/* Video Feed */}
                  <VideoFeedContainer>
                    {videoFeeds[camera.id] ? (
                      <img
                        src={videoFeeds[camera.id] || "/placeholder.svg"}
                        alt={`${camera.name} feed`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.6)",
                          gap: 2,
                        }}
                      >
                        <CameraAlt sx={{ fontSize: 64, opacity: 0.3 }} />
                        <Typography variant="body1" sx={{ opacity: 0.7 }}>
                          {activeCameras[camera.id] ? "Connecting to RTSP..." : "RTSP Stream Offline"}
                        </Typography>
                        {!camera.connected && (
                          <Typography variant="caption" sx={{ opacity: 0.5, textAlign: "center" }}>
                            Check RTSP URL and network connection
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Stream Overlay */}
                    {activeCameras[camera.id] && videoFeeds[camera.id] && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          display: "flex",
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          size="small"
                          icon={<VideoCall />}
                          label={`${streamingStats[camera.id]?.fps || 0} FPS`}
                          sx={{
                            backgroundColor: "rgba(0,0,0,0.7)",
                            color: "#4caf50",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    )}
                  </VideoFeedContainer>

                  {/* Controls */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <NeomorphicButton
                        gradient={activeCameras[camera.id] ? "orange" : "blue"}
                        active={activeCameras[camera.id]}
                        startIcon={activeCameras[camera.id] ? <Stop /> : <PlayArrow />}
                        onClick={() => toggleCamera(camera.id)}
                      >
                        {activeCameras[camera.id] ? "Stop Stream" : "Start Stream"}
                      </NeomorphicButton>
                    </Box>

                    {activeCameras[camera.id] && videoFeeds[camera.id] && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#4caf50",
                            animation: "pulse 2s infinite",
                          }}
                        />
                        <Typography variant="caption" sx={{ color: "#4caf50", fontWeight: 600 }}>
                          LIVE RTSP
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </NeomorphicCard>
            </Grid>
          ))}

          {/* System Dashboard */}
          <Grid item xs={12} lg={6}>
            <NeomorphicCard sx={{ height: "fit-content" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#2c3e50", mb: 3 }}>
                  RTSP System Dashboard
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          background: "linear-gradient(45deg, #ff6b35, #f7931e)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {Object.values(activeCameras).filter(Boolean).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Streams
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          background: "linear-gradient(45deg, #1e88e5, #1976d2)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {cameras.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        RTSP Cameras
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Stream Quality
                  </Typography>
                  {cameras.map((camera) => (
                    <Box key={camera.id} sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body2">{camera.name}</Typography>
                        <Typography variant="body2">{streamingStats[camera.id]?.fps || 0} FPS</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((streamingStats[camera.id]?.fps || 0) * 3.33, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "rgba(0,0,0,0.1)",
                          "& .MuiLinearProgress-bar": {
                            background: camera.connected
                              ? "linear-gradient(90deg, #4caf50, #8bc34a)"
                              : "linear-gradient(90deg, #f44336, #ff5722)",
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Recent Activity
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      • RTSP stream connected (Phone Camera)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Stream quality optimized (5 min ago)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • System health check completed (10 min ago)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </NeomorphicCard>
          </Grid>
        </Grid>
      </Container>

      {/* Add Stream Dialog */}
      <Dialog open={addStreamDialog} onClose={() => setAddStreamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New RTSP Stream</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stream Name"
            fullWidth
            variant="outlined"
            value={newStreamData.name}
            onChange={(e) => setNewStreamData({ ...newStreamData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="RTSP URL"
            fullWidth
            variant="outlined"
            placeholder="rtsp://192.168.1.100:8554/stream"
            value={newStreamData.rtsp_url}
            onChange={(e) => setNewStreamData({ ...newStreamData, rtsp_url: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStreamDialog(false)}>Cancel</Button>
          <Button onClick={handleAddStream} variant="contained" disabled={!newStreamData.rtsp_url}>
            Add Stream
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  )
}

export default App
