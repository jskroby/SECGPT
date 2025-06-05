import os
import cv2
import uvicorn
import asyncio
import logging
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from typing import Dict, List, Optional
import json
import threading
import queue
import base64
import time
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lolanthropy RTSP Streaming", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for active WebSocket connections
active_connections: Dict[str, WebSocket] = {}
camera_streams: Dict[int, 'RTSPCamera'] = {}

class RTSPCamera:
    def __init__(self, camera_id: int, rtsp_url: str, name: str = None):
        self.camera_id = camera_id
        self.rtsp_url = rtsp_url
        self.name = name or f"RTSP Camera {camera_id + 1}"
        self.cap = None
        self.running = False
        self.thread = None
        self.frame_queue = queue.Queue(maxsize=10)
        self.last_frame_time = 0
        self.fps_counter = 0
        self.fps = 0
        self.connection_attempts = 0
        self.max_attempts = 5
        self.reconnect_delay = 5  # seconds

    def connect(self):
        """Establish connection to RTSP stream"""
        try:
            logger.info(f"Connecting to RTSP stream: {self.rtsp_url}")
            
            # OpenCV RTSP connection with optimized parameters
            self.cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
            
            # Set buffer size to reduce latency
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            # Test connection
            ret, frame = self.cap.read()
            if ret and frame is not None:
                logger.info(f"Successfully connected to RTSP stream {self.camera_id}")
                self.connection_attempts = 0
                return True
            else:
                logger.error(f"Failed to read from RTSP stream {self.camera_id}")
                if self.cap:
                    self.cap.release()
                    self.cap = None
                return False
                
        except Exception as e:
            logger.error(f"Error connecting to RTSP stream {self.camera_id}: {e}")
            if self.cap:
                self.cap.release()
                self.cap = None
            return False

    def start(self):
        """Start the camera stream"""
        if not self.running:
            if self.connect():
                self.running = True
                self.thread = threading.Thread(target=self._capture_frames, daemon=True)
                self.thread.start()
                logger.info(f"Started RTSP camera {self.camera_id}")
                return True
            else:
                logger.error(f"Failed to start RTSP camera {self.camera_id}")
                return False
        return True

    def stop(self):
        """Stop the camera stream"""
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=5)
        if self.cap:
            self.cap.release()
            self.cap = None
        logger.info(f"Stopped RTSP camera {self.camera_id}")

    def _capture_frames(self):
        """Capture frames from RTSP stream"""
        fps_start_time = time.time()
        frame_count = 0
        
        while self.running:
            try:
                if not self.cap or not self.cap.isOpened():
                    logger.warning(f"RTSP connection lost for camera {self.camera_id}, attempting reconnect...")
                    if not self._reconnect():
                        time.sleep(self.reconnect_delay)
                        continue

                ret, frame = self.cap.read()
                
                if not ret or frame is None:
                    logger.warning(f"Failed to read frame from camera {self.camera_id}")
                    if not self._reconnect():
                        time.sleep(1)
                        continue

                # Resize frame for better performance and bandwidth
                height, width = frame.shape[:2]
                if width > 1280:  # Resize if too large
                    scale = 1280 / width
                    new_width = int(width * scale)
                    new_height = int(height * scale)
                    frame = cv2.resize(frame, (new_width, new_height))

                # Add timestamp overlay
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                cv2.putText(frame, timestamp, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                           0.7, (255, 255, 255), 2)
                cv2.putText(frame, f"FPS: {self.fps}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 
                           0.7, (255, 255, 255), 2)

                # Encode frame to JPEG
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                _, buffer = cv2.imencode('.jpg', frame, encode_param)
                frame_bytes = buffer.tobytes()

                # Add to queue (non-blocking)
                try:
                    if not self.frame_queue.full():
                        self.frame_queue.put((self.camera_id, frame_bytes, time.time()), block=False)
                    else:
                        # Remove old frame if queue is full
                        try:
                            self.frame_queue.get_nowait()
                            self.frame_queue.put((self.camera_id, frame_bytes, time.time()), block=False)
                        except queue.Empty:
                            pass
                except Exception as e:
                    logger.error(f"Error adding frame to queue: {e}")

                # Calculate FPS
                frame_count += 1
                current_time = time.time()
                if current_time - fps_start_time >= 1.0:
                    self.fps = frame_count
                    frame_count = 0
                    fps_start_time = current_time

                # Small delay to prevent overwhelming the system
                time.sleep(0.033)  # ~30 FPS max

            except Exception as e:
                logger.error(f"Error in frame capture for camera {self.camera_id}: {e}")
                if not self._reconnect():
                    time.sleep(self.reconnect_delay)

    def _reconnect(self):
        """Attempt to reconnect to RTSP stream"""
        self.connection_attempts += 1
        if self.connection_attempts > self.max_attempts:
            logger.error(f"Max reconnection attempts reached for camera {self.camera_id}")
            return False

        logger.info(f"Reconnecting to camera {self.camera_id} (attempt {self.connection_attempts})")
        
        if self.cap:
            self.cap.release()
            self.cap = None
        
        time.sleep(2)  # Wait before reconnecting
        return self.connect()

    def get_frame(self):
        """Get the latest frame from the queue"""
        try:
            return self.frame_queue.get_nowait()
        except queue.Empty:
            return None

    def get_status(self):
        """Get camera status information"""
        return {
            "id": self.camera_id,
            "name": self.name,
            "rtsp_url": self.rtsp_url,
            "running": self.running,
            "connected": self.cap is not None and self.cap.isOpened() if self.cap else False,
            "fps": self.fps,
            "connection_attempts": self.connection_attempts,
            "queue_size": self.frame_queue.qsize()
        }

# Initialize RTSP cameras
RTSP_STREAMS = [
    {
        "id": 0,
        "name": "Phone Camera",
        "rtsp_url": "rtsp://192.168.1.116:8554/stream"
    },
    # Add more RTSP streams here if needed
    # {
    #     "id": 1,
    #     "name": "Security Camera",
    #     "rtsp_url": "rtsp://192.168.1.117:8554/stream"
    # }
]

# Initialize camera streams
for stream_config in RTSP_STREAMS:
    camera_streams[stream_config["id"]] = RTSPCamera(
        camera_id=stream_config["id"],
        rtsp_url=stream_config["rtsp_url"],
        name=stream_config["name"]
    )

# WebSocket endpoint for video streaming
@app.websocket("/ws/video/{camera_id}")
async def websocket_video(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    client_id = f"client_{id(websocket)}_{camera_id}"
    active_connections[client_id] = websocket
    
    logger.info(f"WebSocket client {client_id} connected for camera {camera_id}")
    
    try:
        # Start the camera if not already running
        if camera_id in camera_streams:
            camera = camera_streams[camera_id]
            if not camera.running:
                success = camera.start()
                if not success:
                    await websocket.send_text(json.dumps({
                        "error": f"Failed to start camera {camera_id}",
                        "camera_id": camera_id
                    }))
                    return

        while True:
            try:
                if camera_id in camera_streams:
                    camera = camera_streams[camera_id]
                    frame_data = camera.get_frame()
                    
                    if frame_data:
                        cam_id, frame_bytes, timestamp = frame_data
                        frame_base64 = base64.b64encode(frame_bytes).decode('utf-8')
                        
                        message = json.dumps({
                            "camera_id": camera_id,
                            "frame": frame_base64,
                            "timestamp": timestamp,
                            "fps": camera.fps,
                            "status": "streaming"
                        })
                        
                        await websocket.send_text(message)
                
                await asyncio.sleep(0.033)  # ~30 FPS
                
            except Exception as e:
                logger.error(f"Error in WebSocket loop for camera {camera_id}: {e}")
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for camera {camera_id}: {e}")
    finally:
        if client_id in active_connections:
            del active_connections[client_id]

# API endpoints
@app.get("/api/cameras")
async def get_cameras():
    """Get list of available cameras with their status"""
    cameras = []
    for camera_id, camera in camera_streams.items():
        status = camera.get_status()
        cameras.append(status)
    return cameras

@app.post("/api/start-camera/{camera_id}")
async def start_camera(camera_id: int):
    """Start a specific camera stream"""
    if camera_id not in camera_streams:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    camera = camera_streams[camera_id]
    success = camera.start()
    
    if success:
        return {"status": "started", "camera_id": camera_id, "message": "Camera started successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to start camera")

@app.post("/api/stop-camera/{camera_id}")
async def stop_camera(camera_id: int):
    """Stop a specific camera stream"""
    if camera_id not in camera_streams:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    camera = camera_streams[camera_id]
    camera.stop()
    
    return {"status": "stopped", "camera_id": camera_id, "message": "Camera stopped successfully"}

@app.get("/api/camera-status/{camera_id}")
async def get_camera_status(camera_id: int):
    """Get detailed status of a specific camera"""
    if camera_id not in camera_streams:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    camera = camera_streams[camera_id]
    return camera.get_status()

@app.post("/api/add-rtsp-stream")
async def add_rtsp_stream(stream_data: dict):
    """Add a new RTSP stream"""
    try:
        camera_id = len(camera_streams)
        rtsp_url = stream_data.get("rtsp_url")
        name = stream_data.get("name", f"RTSP Camera {camera_id + 1}")
        
        if not rtsp_url:
            raise HTTPException(status_code=400, detail="RTSP URL is required")
        
        camera_streams[camera_id] = RTSPCamera(
            camera_id=camera_id,
            rtsp_url=rtsp_url,
            name=name
        )
        
        return {
            "status": "success",
            "camera_id": camera_id,
            "message": "RTSP stream added successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_cameras": len([c for c in camera_streams.values() if c.running]),
        "total_cameras": len(camera_streams),
        "active_connections": len(active_connections)
    }

# Serve the frontend
# @app.get("/")
# async def read_root():
#     return FileResponse("../frontend/build/index.html")

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Lolanthropy RTSP Streaming Server started")
    logger.info(f"Configured {len(camera_streams)} RTSP streams")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down RTSP streams...")
    for camera in camera_streams.values():
        camera.stop()
    logger.info("Lolanthropy RTSP Streaming Server stopped")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
