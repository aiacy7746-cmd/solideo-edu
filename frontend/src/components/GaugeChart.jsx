import React, { useEffect, useRef } from 'react';
import './GaugeChart.css';

/**
 * 반원형 게이지 차트 컴포넌트
 * @param {number} value - 현재 값 (0-100)
 * @param {string} label - 라벨 텍스트
 * @param {string} unit - 단위
 * @param {string} color - 메인 색상
 */
export function GaugeChart({ value = 0, label = '', unit = '%', color = '#00d4ff' }) {
    const gaugeRef = useRef(null);
    const clampedValue = Math.min(100, Math.max(0, value));

    // 값에 따른 색상 결정
    const getColor = () => {
        if (clampedValue >= 90) return '#ef4444'; // 빨강
        if (clampedValue >= 70) return '#f59e0b'; // 노랑
        return color || '#10b981'; // 기본 색상 또는 녹색
    };

    const dynamicColor = getColor();
    const rotation = (clampedValue / 100) * 180; // 0-180도

    return (
        <div className="gauge-container">
            <div className="gauge">
                <div className="gauge-background"></div>
                <div
                    className="gauge-fill"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        background: dynamicColor
                    }}
                ></div>
                <div className="gauge-cover">
                    <span className="gauge-value" style={{ color: dynamicColor }}>
                        {clampedValue.toFixed(1)}
                    </span>
                    <span className="gauge-unit">{unit}</span>
                </div>
            </div>
            {label && <div className="gauge-label">{label}</div>}
        </div>
    );
}

export default GaugeChart;
