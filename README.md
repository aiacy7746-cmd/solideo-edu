# System Resource Monitor

실시간 시스템 리소스 모니터링 웹 애플리케이션

## 기능

- **실시간 모니터링**: CPU, GPU, 메모리, 디스크, 네트워크
- **시각화**: 게이지 차트, 실시간 그래프
- **PDF 리포트**: 5분 추적 후 통계 표/그래프 포함 자동 생성

## 실행 방법

### 1. 백엔드 서버 시작

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

또는 `start_backend.bat` 실행

### 2. 프론트엔드 서버 시작 (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

또는 `start_frontend.bat` 실행

### 3. 브라우저에서 접속

http://localhost:5173

## 기술 스택

- **Backend**: Python, FastAPI, WebSocket, psutil, GPUtil
- **Frontend**: Vite, React, Chart.js, jsPDF

## 구조

```
├── backend/
│   ├── main.py           # FastAPI 서버
│   └── monitors/         # 시스템 모니터링 모듈
├── frontend/
│   └── src/
│       ├── components/   # React 컴포넌트
│       ├── hooks/        # WebSocket 훅
│       └── utils/        # PDF 생성
└── start_*.bat           # 실행 스크립트
```
