import React from 'react';
import './NetworkMonitor.css';

/**
 * 네트워크 트래픽 모니터 컴포넌트
 * @param {object} data - 네트워크 데이터
 */
export function NetworkMonitor({ data = {} }) {
    const {
        bytes_sent_speed_mbps = 0,
        bytes_recv_speed_mbps = 0,
        bytes_sent_total_mb = 0,
        bytes_recv_total_mb = 0,
        interfaces = []
    } = data;

    // 속도 바 최대값 (10 Mbps 기준)
    const maxSpeed = 10;
    const uploadPercent = Math.min(100, (bytes_sent_speed_mbps / maxSpeed) * 100);
    const downloadPercent = Math.min(100, (bytes_recv_speed_mbps / maxSpeed) * 100);

    return (
        <div className="network-monitor">
            <div className="network-header">
                <span className="network-icon">🌐</span>
                <h3 className="network-title">Network</h3>
            </div>

            <div className="speed-section">
                <div className="speed-item">
                    <div className="speed-label">
                        <span className="arrow upload">↑</span>
                        <span>Upload</span>
                    </div>
                    <div className="speed-bar-container">
                        <div
                            className="speed-bar upload-bar"
                            style={{ width: `${uploadPercent}%` }}
                        ></div>
                    </div>
                    <div className="speed-value">{bytes_sent_speed_mbps.toFixed(2)} MB/s</div>
                </div>

                <div className="speed-item">
                    <div className="speed-label">
                        <span className="arrow download">↓</span>
                        <span>Download</span>
                    </div>
                    <div className="speed-bar-container">
                        <div
                            className="speed-bar download-bar"
                            style={{ width: `${downloadPercent}%` }}
                        ></div>
                    </div>
                    <div className="speed-value">{bytes_recv_speed_mbps.toFixed(2)} MB/s</div>
                </div>
            </div>

            <div className="total-section">
                <div className="total-item">
                    <span className="total-label">Total Sent</span>
                    <span className="total-value">{(bytes_sent_total_mb / 1024).toFixed(2)} GB</span>
                </div>
                <div className="total-item">
                    <span className="total-label">Total Received</span>
                    <span className="total-value">{(bytes_recv_total_mb / 1024).toFixed(2)} GB</span>
                </div>
            </div>

            {interfaces.length > 0 && (
                <div className="interfaces-section">
                    <div className="interfaces-title">Active Interfaces</div>
                    {interfaces.slice(0, 2).map((iface, index) => (
                        <div key={index} className="interface-item">
                            <span className="interface-name">{iface.name}</span>
                            <span className="interface-ip">{iface.ip}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NetworkMonitor;
