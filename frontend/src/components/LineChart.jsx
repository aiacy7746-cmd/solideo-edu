import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/**
 * 실시간 라인 차트 컴포넌트
 * @param {Array} dataPoints - 데이터 포인트 배열
 * @param {string} label - 데이터셋 라벨
 * @param {string} color - 라인 색상
 * @param {number} maxPoints - 최대 표시 포인트 수
 */
export function LineChart({
    dataPoints = [],
    label = 'Usage',
    color = '#00d4ff',
    maxPoints = 60
}) {
    // 최근 데이터만 표시
    const displayData = dataPoints.slice(-maxPoints);

    const data = {
        labels: displayData.map((_, i) => `${maxPoints - displayData.length + i}s`),
        datasets: [
            {
                label: label,
                data: displayData,
                fill: true,
                backgroundColor: `${color}20`,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.4,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 300
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: color,
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.parsed.y.toFixed(1)}%`
                }
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.4)',
                    font: {
                        size: 10
                    },
                    stepSize: 25,
                    callback: (value) => `${value}%`
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="line-chart-container" style={{ height: '100px', width: '100%' }}>
            <Line data={data} options={options} />
        </div>
    );
}

export default LineChart;
