import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { ResourceCard } from './components/ResourceCard';
import { NetworkMonitor } from './components/NetworkMonitor';
import { generatePDFReport } from './utils/pdfGenerator';
import './App.css';

// WebSocket URL (개발 시 직접 연결, 프로덕션은 프록시)
const WS_URL = import.meta.env.DEV
    ? 'ws://localhost:8000/ws/monitor'
    : `ws://${window.location.host}/ws/monitor`;

function App() {
    const { data, isConnected, error, getHistory } = useWebSocket(WS_URL);
    const [cpuHistory, setCpuHistory] = useState([]);
    const [gpuHistory, setGpuHistory] = useState([]);
    const [memoryHistory, setMemoryHistory] = useState([]);
    const [diskHistory, setDiskHistory] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [trackingTime, setTrackingTime] = useState(0);
    const [isTracking, setIsTracking] = useState(false);

    // 데이터 업데이트 시 히스토리 갱신
    useEffect(() => {
        if (data) {
            setCpuHistory(prev => [...prev.slice(-59), data.cpu?.usage_percent || 0]);
            setGpuHistory(prev => [...prev.slice(-59), data.gpu?.primary?.usage_percent || 0]);
            setMemoryHistory(prev => [...prev.slice(-59), data.memory?.usage_percent || 0]);
            setDiskHistory(prev => [...prev.slice(-59), data.disk?.primary?.usage_percent || 0]);
        }
    }, [data]);

    // PDF 리포트 생성
    const handleGenerateReport = useCallback(async () => {
        setIsTracking(true);
        setTrackingTime(300); // 5분 = 300초

        // 5분 카운트다운
        const interval = setInterval(() => {
            setTrackingTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // 5분 대기
        await new Promise(resolve => setTimeout(resolve, 300000));

        setIsTracking(false);
        setIsGenerating(true);

        try {
            const history = getHistory();
            await generatePDFReport(history);
        } catch (e) {
            console.error('PDF generation failed:', e);
            alert('PDF 생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
    }, [getHistory]);

    // 즉시 리포트 생성 (현재 데이터로)
    const handleQuickReport = useCallback(async () => {
        setIsGenerating(true);
        try {
            const history = getHistory();
            if (history.length < 10) {
                alert('최소 10초 이상의 데이터가 필요합니다.');
                return;
            }
            await generatePDFReport(history);
        } catch (e) {
            console.error('PDF generation failed:', e);
            alert('PDF 생성에 실패했습니다.');
        } finally {
            setIsGenerating(false);
        }
    }, [getHistory]);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="app">
            <header className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <span className="logo-icon">📊</span>
                        <h1 className="title">System Resource Monitor</h1>
                    </div>

                    <div className="status-section">
                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            <span className="status-dot"></span>
                            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        {error && <span className="error-text">{error}</span>}
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="dashboard-grid">
                    {/* CPU */}
                    <ResourceCard
                        title="CPU"
                        icon="🖥️"
                        value={data?.cpu?.usage_percent || 0}
                        history={cpuHistory}
                        color="#00d4ff"
                        details={{
                            'Cores': `${data?.cpu?.core_count || '-'} / ${data?.cpu?.thread_count || '-'} threads`,
                            'Frequency': data?.cpu?.frequency_mhz ? `${data.cpu.frequency_mhz.toFixed(0)} MHz` : '-',
                            'Temperature': data?.cpu?.temperature_celsius ? `${data.cpu.temperature_celsius}°C` : 'N/A'
                        }}
                    />

                    {/* GPU */}
                    <ResourceCard
                        title="GPU"
                        icon="🎮"
                        value={data?.gpu?.primary?.usage_percent || 0}
                        history={gpuHistory}
                        color="#7c3aed"
                        details={{
                            'Name': data?.gpu?.primary?.name || (data?.gpu?.available ? '-' : 'N/A'),
                            'Memory': data?.gpu?.primary
                                ? `${data.gpu.primary.memory_used_mb?.toFixed(0) || 0} / ${data.gpu.primary.memory_total_mb?.toFixed(0) || 0} MB`
                                : 'N/A',
                            'Temperature': data?.gpu?.primary?.temperature_celsius
                                ? `${data.gpu.primary.temperature_celsius}°C`
                                : 'N/A'
                        }}
                    />

                    {/* Memory */}
                    <ResourceCard
                        title="Memory"
                        icon="🧠"
                        value={data?.memory?.usage_percent || 0}
                        history={memoryHistory}
                        color="#ec4899"
                        details={{
                            'Used': `${data?.memory?.used_gb || 0} GB`,
                            'Total': `${data?.memory?.total_gb || 0} GB`,
                            'Available': `${data?.memory?.available_gb || 0} GB`
                        }}
                    />

                    {/* Disk */}
                    <ResourceCard
                        title="Disk"
                        icon="💾"
                        value={data?.disk?.primary?.usage_percent || 0}
                        history={diskHistory}
                        color="#f59e0b"
                        details={{
                            'Drive': data?.disk?.primary?.device || '-',
                            'Used': `${data?.disk?.primary?.used_gb || 0} GB`,
                            'Total': `${data?.disk?.primary?.total_gb || 0} GB`
                        }}
                    />

                    {/* Network (2열 차지) */}
                    <div className="network-section">
                        <NetworkMonitor data={data?.network} />
                    </div>
                </div>

                {/* 리포트 버튼 섹션 */}
                <div className="report-section">
                    {isTracking ? (
                        <div className="tracking-info">
                            <div className="tracking-timer">
                                <span className="tracking-label">데이터 수집 중...</span>
                                <span className="tracking-time">{formatTime(trackingTime)}</span>
                            </div>
                            <div className="tracking-progress">
                                <div
                                    className="tracking-bar"
                                    style={{ width: `${((300 - trackingTime) / 300) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ) : (
                        <div className="report-buttons">
                            <button
                                className="report-btn primary"
                                onClick={handleGenerateReport}
                                disabled={isGenerating || !isConnected}
                            >
                                {isGenerating ? 'PDF 생성 중...' : '📄 5분 추적 후 리포트 생성'}
                            </button>
                            <button
                                className="report-btn secondary"
                                onClick={handleQuickReport}
                                disabled={isGenerating || !isConnected}
                            >
                                ⚡ 현재 데이터로 즉시 생성
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <p>System Resource Monitor v1.0</p>
                <p className="footer-hint">실시간으로 시스템 리소스를 모니터링하고 PDF 리포트를 생성합니다.</p>
            </footer>
        </div>
    );
}

export default App;
