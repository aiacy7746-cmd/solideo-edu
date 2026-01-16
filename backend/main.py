"""
System Resource Monitor - Backend API Server
FastAPI + WebSocket 기반 실시간 시스템 리소스 모니터링 서버
"""
import asyncio
import json
import logging
import os
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

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="System Resource Monitor API",
    description="실시간 시스템 리소스 모니터링 API",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동)
# 환경 변수로 허용된 origin 설정 (개발/프로덕션 분리)
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
logger.info(f"CORS enabled for origins: {ALLOWED_ORIGINS}")


class ConnectionManager:
    """WebSocket 연결 관리자"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """메시지 브로드캐스트 및 실패한 연결 정리"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send message to connection: {e}")
                disconnected.append(connection)

        # 실패한 연결 제거 (메모리 누수 방지)
        for conn in disconnected:
            self.disconnect(conn)


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


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_connections": len(manager.active_connections)
    }


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
        logger.info("Client disconnected normally")
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
