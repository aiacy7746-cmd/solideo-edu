import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WebSocket 연결 및 실시간 데이터 수신 훅
 * @param {string} url - WebSocket URL
 * @returns {object} - 연결 상태 및 데이터
 */
export function useWebSocket(url) {
    const [data, setData] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const historyRef = useRef([]);

    const connect = useCallback(() => {
        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setError(null);
                console.log('WebSocket connected');
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    setData(parsed);

                    // 히스토리 저장 (최대 300개 = 5분)
                    historyRef.current.push(parsed);
                    if (historyRef.current.length > 300) {
                        historyRef.current.shift();
                    }
                } catch (e) {
                    console.error('Failed to parse WebSocket data:', e);
                }
            };

            wsRef.current.onclose = () => {
                setIsConnected(false);
                console.log('WebSocket disconnected, reconnecting...');

                // 3초 후 재연결
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect();
                }, 3000);
            };

            wsRef.current.onerror = (e) => {
                setError('연결 오류');
                console.error('WebSocket error:', e);
            };
        } catch (e) {
            setError('연결 실패');
            console.error('Failed to create WebSocket:', e);
        }
    }, [url]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    const getHistory = useCallback(() => {
        return historyRef.current;
    }, []);

    const clearHistory = useCallback(() => {
        historyRef.current = [];
    }, []);

    return {
        data,
        isConnected,
        error,
        getHistory,
        clearHistory
    };
}
