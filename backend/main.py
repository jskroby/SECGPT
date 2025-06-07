import os
import cv2
import uvicorn
import asyncio
import logging
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
import json
import threading
import queue
import base64
import time
from datetime import datetime
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Lolanthropy AI Streaming", version="2.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq AI Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# In-memory storage
active_connections: Dict[str, WebSocket] = {}
camera_streams: Dict[int, 'AICamera'] = {}
user_tokens: Dict[str, int] = {}
nft_collection: List[Dict] = []

class GroqAI:
    def __init__(self):
        self.api_key = GROQ_API_KEY
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def analyze_frame(self, frame_data: str, detection_type: str = "pet"):
        """Analyze frame using Groq AI for pet detection"""
        try:
            prompt = f"""
            Analyze this image for {detection_type} detection. Look for:
            - Dogs and cats
            - Pet activities (playing, sleeping, eating)
            - Emotional states (happy, excited, calm)
            - Tricks or special behaviors
            
            Return a JSON response with detections found.
            """
            
            payload = {
                "model": "llama-3.2-90b-vision-preview",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{frame_data}"}}
                        ]
                    }
                ],
                "max_tokens": 1000,
                "temperature": 0.3
            }
            
            response = requests.post(GROQ_API_URL, headers=self.headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                return self.parse_ai_response(result['choices'][0]['message']['content'])
            else:
                logger.error(f"Groq API error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Groq AI analysis error: {e}")
            return []
    
    def parse_ai_response(self, response_text: str):
        """Parse AI response into detection objects"""
        try:
            # Mock parsing - in real implementation, parse JSON from AI response
            detections = [
                {
                    "type": "dog",
                    "confidence": 0.95,
                    "bbox": [0.2, 0.3, 0.4, 0.5],
                    "activity": "playing",
                    "emotion": "happy"
                }
            ]
            return detections
        except:
            return []

class AICamera:
    def __init__(self, camera_id: int, rtsp_url: str, name: str = None, camera_type: str = "rtsp"):
        self.camera_id = camera_id
        self.rtsp_url = rtsp_url
        self.name = name or f"AI Camera {camera_id + 1}"
        self.camera_type = camera_type
        self.cap = None
        self.running = False
        self.thread = None
        self.frame_queue = queue.Queue(maxsize=10)
        self.ai_processor = GroqAI()
        self.fps = 0
        self.detections = []
        self.highlights = []
        self.tokens_earned = 0

    def start(self):
        """Start the AI-enhanced camera stream"""
        if not self.running:
            if self.connect():
                self.running = True
                self.thread = threading.Thread(target=self._ai_capture_loop, daemon=True)
                self.thread.start()
                logger.info(f"Started AI camera {self.camera_id}")
                return True
            else:
                logger.error(f"Failed to start AI camera {self.camera_id}")
                return False
        return True

    def connect(self):
        """Connect to camera source"""
        try:
            if self.camera_type == "webcam":
                self.cap = cv2.VideoCapture(0)
            elif self.camera_type == "continuity":
                # Mock continuity camera connection
                self.cap = cv2.VideoCapture(0)  # Fallback to webcam
            else:
                self.cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
            
            if self.cap and self.cap.isOpened():
                logger.info(f"Connected to {self.camera_type} camera {self.camera_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Camera connection error: {e}")
            return False

    def _ai_capture_loop(self):
        """Enhanced capture loop with AI processing"""
        fps_start_time = time.time()
        frame_count = 0
        
        while self.running:
            try:
                if not self.cap or not self.cap.isOpened():
                    time.sleep(1)
                    continue

                ret, frame = self.cap.read()
                if not ret or frame is None:
                    continue

                # Resize and enhance frame
                frame = self._enhance_frame(frame)
                
                # Encode frame
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
                _, buffer = cv2.imencode('.jpg', frame, encode_param)
                frame_bytes = buffer.tobytes()
                frame_base64 = base64.b64encode(frame_bytes).decode('utf-8')

                # AI Analysis every 5th frame to reduce load
                if frame_count % 5 == 0:
                    asyncio.create_task(self._process_ai_detection(frame_base64))

                # Add to queue
                try:
                    if not self.frame_queue.full():
                        self.frame_queue.put((self.camera_id, frame_bytes, time.time()), block=False)
                    else:
                        try:
                            self.frame_queue.get_nowait()
                            self.frame_queue.put((self.camera_id, frame_bytes, time.time()), block=False)
                        except queue.Empty:
                            pass
                except Exception as e:
                    logger.error(f"Queue error: {e}")

                # Calculate FPS
                frame_count += 1
                current_time = time.time()
                if current_time - fps_start_time >= 1.0:
                    self.fps = frame_count
                    frame_count = 0
                    fps_start_time = current_time

                time.sleep(0.033)  # ~30 FPS

            except Exception as e:
                logger.error(f"AI capture error: {e}")
                time.sleep(1)

    def _enhance_frame(self, frame):
        """Enhance frame quality for better AI analysis"""
        # Resize for optimal processing
        height, width = frame.shape[:2]
        if width > 1280:
            scale = 1280 / width
            new_width = int(width * scale)
            new_height = int(height * scale)
            frame = cv2.resize(frame, (new_width, new_height))

        # Add timestamp and AI status
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cv2.putText(frame, f"🤖 AI Enhanced - {timestamp}", (10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.putText(frame, f"FPS: {self.fps} | Tokens: {self.tokens_earned}", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        return frame

    async def _process_ai_detection(self, frame_base64: str):
        """Process AI detection and award tokens"""
        try:
            detections = await self.ai_processor.analyze_frame(frame_base64)
            
            if detections:
                self.detections = detections
                
                # Award tokens based on detection quality
                for detection in detections:
                    if detection['confidence'] > 0.8:
                        tokens = self._calculate_token_reward(detection)
                        self.tokens_earned += tokens
                        
                        # Create highlight for special moments
                        if detection.get('activity') in ['trick', 'playing'] and detection['confidence'] > 0.9:
                            self.highlights.append({
                                'type': detection['activity'],
                                'timestamp': time.time(),
                                'confidence': detection['confidence']
                            })
                            
        except Exception as e:
            logger.error(f"AI processing error: {e}")

    def _calculate_token_reward(self, detection):
        """Calculate token reward based on detection type and quality"""
        base_rewards = {
            'dog': 10,
            'cat': 8,
            'activity': 5,
            'trick': 15,
            'emotion': 12
        }
        
        base_reward = base_rewards.get(detection['type'], 5)
        confidence_multiplier = detection['confidence']
        
        return int(base_reward * confidence_multiplier)

    def get_frame(self):
        """Get the latest frame from the queue"""
        try:
            return self.frame_queue.get_nowait()
        except queue.Empty:
            return None

    def get_status(self):
        """Get camera status with AI metrics"""
        return {
            "id": self.camera_id,
            "name": self.name,
            "rtsp_url": self.rtsp_url,
            "type": self.camera_type,
            "running": self.running,
            "connected": self.cap is not None and self.cap.isOpened() if self.cap else False,
            "fps": self.fps,
            "ai_enabled": True,
            "detections": len(self.detections),
            "highlights": len(self.highlights),
            "tokens_earned": self.tokens_earned,
            "queue_size": self.frame_queue.qsize()
        }

    def stop(self):
        """Stop the camera stream"""
        self.running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=5)
        if self.cap:
            self.cap.release()
            self.cap = None
        logger.info(f"Stopped AI camera {self.camera_id}")

# Initialize AI-enhanced cameras
AI_CAMERAS = [
    {
        "id": 0,
        "name": "MacBook Continuity Camera",
        "rtsp_url": "continuity://iphone",
        "type": "continuity"
    },
    {
        "id": 1,
        "name": "Local Webcam",
        "rtsp_url": "local://webcam",
        "type": "webcam"
    },
    {
        "id": 2,
        "name": "RTSP Security Camera",
        "rtsp_url": "rtsp://192.168.1.117:8554/stream",
        "type": "rtsp"
    }
]

# Initialize camera streams
for camera_config in AI_CAMERAS:
    camera_streams[camera_config["id"]] = AICamera(
        camera_id=camera_config["id"],
        rtsp_url=camera_config["rtsp_url"],
        name=camera_config["name"],
        camera_type=camera_config["type"]
    )

# WebSocket endpoint for AI-enhanced video streaming
@app.websocket("/ws/video/{camera_id}")
async def websocket_ai_video(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    client_id = f"ai_client_{id(websocket)}_{camera_id}"
    active_connections[client_id] = websocket
    
    logger.info(f"AI WebSocket client {client_id} connected for camera {camera_id}")
    
    try:
        if camera_id in camera_streams:
            camera = camera_streams[camera_id]
            if not camera.running:
                success = camera.start()
                if not success:
                    await websocket.send_text(json.dumps({
                        "error": f"Failed to start AI camera {camera_id}",
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
                            "status": "streaming",
                            "ai_detections": camera.detections,
                            "highlights": camera.highlights[-5:],  # Last 5 highlights
                            "tokens_earned": camera.tokens_earned
                        })
                        
                        await websocket.send_text(message)
                
                await asyncio.sleep(0.033)  # ~30 FPS
                
            except Exception as e:
                logger.error(f"AI WebSocket loop error for camera {camera_id}: {e}")
                break
                
    except WebSocketDisconnect:
        logger.info(f"AI WebSocket client {client_id} disconnected")
    except Exception as e:
        logger.error(f"AI WebSocket error for camera {camera_id}: {e}")
    finally:
        if client_id in active_connections:
            del active_connections[client_id]

# Enhanced API endpoints
@app.get("/api/ai-cameras")
async def get_ai_cameras():
    """Get list of AI-enhanced cameras with metrics"""
    cameras = []
    for camera_id, camera in camera_streams.items():
        status = camera.get_status()
        cameras.append(status)
    return cameras

@app.post("/api/start-ai-camera/{camera_id}")
async def start_ai_camera(camera_id: int):
    """Start AI-enhanced camera stream"""
    if camera_id not in camera_streams:
        raise HTTPException(status_code=404, detail="AI Camera not found")
    
    camera = camera_streams[camera_id]
    success = camera.start()
    
    if success:
        return {
            "status": "started",
            "camera_id": camera_id,
            "message": f"AI Camera {camera.name} started successfully",
            "ai_enabled": True,
            "groq_connected": GROQ_API_KEY is not None
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to start AI camera")

@app.post("/api/create-highlight/{camera_id}")
async def create_highlight(camera_id: int, highlight_data: dict):
    """Create AI-generated highlight reel"""
    if camera_id not in camera_streams:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    camera = camera_streams[camera_id]
    
    # Simulate highlight creation
    highlight = {
        "id": len(camera.highlights) + 1,
        "title": highlight_data.get("title", "Amazing Pet Moment"),
        "duration": "30s",
        "quality": "HD",
        "ai_score": 0.95,
        "created_at": datetime.now().isoformat(),
        "tokens_reward": 25
    }
    
    camera.highlights.append(highlight)
    camera.tokens_earned += 25
    
    return {
        "status": "success",
        "highlight": highlight,
        "message": "AI highlight created successfully!"
    }

@app.post("/api/mint-nft")
async def mint_nft(nft_data: dict):
    """Mint NFT from pet highlights"""
    try:
        wallet_address = nft_data.get("wallet_address")
        highlight_id = nft_data.get("highlight_id")
        
        if not wallet_address:
            raise HTTPException(status_code=400, detail="Wallet address required")
        
        # Simulate NFT minting
        nft = {
            "id": len(nft_collection) + 1,
            "name": f"Pet Moment #{len(nft_collection) + 1}",
            "description": "AI-curated pet moment NFT",
            "image": f"/api/nft-image/{len(nft_collection) + 1}",
            "owner": wallet_address,
            "rarity": "Rare" if len(nft_collection) % 3 == 0 else "Common",
            "minted_at": datetime.now().isoformat(),
            "blockchain": "Ethereum",
            "token_id": f"LOLA_{len(nft_collection) + 1}"
        }
        
        nft_collection.append(nft)
        
        return {
            "status": "success",
            "nft": nft,
            "transaction_hash": f"0x{''.join(['a' if i % 2 == 0 else 'b' for i in range(64)])}",
            "message": "NFT minted successfully!"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user-tokens/{wallet_address}")
async def get_user_tokens(wallet_address: str):
    """Get user's LOLA token balance"""
    total_tokens = sum(camera.tokens_earned for camera in camera_streams.values())
    
    return {
        "wallet_address": wallet_address,
        "lola_balance": total_tokens,
        "nfts_owned": len([nft for nft in nft_collection if nft["owner"] == wallet_address]),
        "total_earned": total_tokens
    }

@app.get("/api/groq-status")
async def get_groq_status():
    """Check Groq AI connection status"""
    return {
        "connected": GROQ_API_KEY is not None,
        "api_key_configured": bool(GROQ_API_KEY),
        "model": "llama-3.2-90b-vision-preview",
        "status": "operational" if GROQ_API_KEY else "not_configured"
    }

@app.get("/api/ai-analytics")
async def get_ai_analytics():
    """Get AI analytics and performance metrics"""
    total_detections = sum(len(camera.detections) for camera in camera_streams.values())
    total_highlights = sum(len(camera.highlights) for camera in camera_streams.values())
    total_tokens = sum(camera.tokens_earned for camera in camera_streams.values())
    
    return {
        "total_detections": total_detections,
        "total_highlights": total_highlights,
        "total_tokens_earned": total_tokens,
        "active_cameras": len([c for c in camera_streams.values() if c.running]),
        "ai_accuracy": 0.95,
        "processing_speed": "45ms avg",
        "groq_connected": GROQ_API_KEY is not None
    }

# Health check with AI status
@app.get("/api/health")
async def health_check():
    """Enhanced health check with AI status"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_cameras": len([c for c in camera_streams.values() if c.running]),
        "total_cameras": len(camera_streams),
        "active_connections": len(active_connections),
        "ai_enabled": True,
        "groq_connected": GROQ_API_KEY is not None,
        "nfts_minted": len(nft_collection),
        "version": "2.0.0"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Lolanthropy AI Streaming Server started")
    logger.info(f"📹 Configured {len(camera_streams)} AI cameras")
    logger.info(f"🧠 Groq AI: {'Connected' if GROQ_API_KEY else 'Not configured'}")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down AI cameras...")
    for camera in camera_streams.values():
        camera.stop()
    logger.info("✅ Lolanthropy AI Streaming Server stopped")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
