"""
System Resource Monitor - Backend API Server
FastAPI + WebSocket 기반 실시간 시스템 리소스 모니터링 서버
"""
import asyncio
import json
from datetime import datetime
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from monitors import (
    get_cpu_info,
    get_gpu_info,
    get_memory_info,
    get_disk_info,
    get_network_info
)

app = FastAPI(
    title="System Resource Monitor API",
    description="실시간 시스템 리소스 모니터링 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    """WebSocket 연결 관리자"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()


def collect_all_resources() -> dict:
    """모든 시스템 리소스 정보 수집"""
    return {
        "timestamp": datetime.now().isoformat(),
        "cpu": get_cpu_info(),
        "gpu": get_gpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "network": get_network_info()
    }


@app.get("/")
async def root():
    """API 상태 확인"""
    return {"status": "running", "message": "System Resource Monitor API"}


@app.get("/api/resources")
async def get_resources():
    """현재 시스템 리소스 정보 (HTTP)"""
    return collect_all_resources()


@app.websocket("/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    """실시간 리소스 모니터링 (WebSocket)"""
    await manager.connect(websocket)
    try:
        while True:
            data = collect_all_resources()
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(1)  # 1초마다 전송
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
