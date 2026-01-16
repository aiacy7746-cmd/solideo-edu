import React from 'react';
import { GaugeChart } from './GaugeChart';
import { LineChart } from './LineChart';
import './ResourceCard.css';

/**
 * 리소스 모니터링 카드 컴포넌트
 * @param {string} title - 카드 제목
 * @param {string} icon - 아이콘 이모지
 * @param {number} value - 현재 사용률 (0-100)
 * @param {Array} history - 히스토리 데이터
 * @param {object} details - 상세 정보
 * @param {string} color - 테마 색상
 */
export function ResourceCard({
    title = 'Resource',
    icon = '📊',
    value = 0,
    history = [],
    details = {},
    color = '#00d4ff'
}) {
    return (
        <div className="resource-card">
            <div className="card-header">
                <span className="card-icon">{icon}</span>
                <h3 className="card-title">{title}</h3>
            </div>

            <div className="card-body">
                <div className="gauge-section">
                    <GaugeChart value={value} color={color} />
                </div>

                <div className="chart-section">
                    <LineChart dataPoints={history} color={color} />
                </div>
            </div>

            <div className="card-details">
                {Object.entries(details).map(([key, val]) => (
                    <div key={key} className="detail-item">
                        <span className="detail-label">{key}</span>
                        <span className="detail-value">{val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResourceCard;
