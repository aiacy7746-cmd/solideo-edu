"""네트워크 모니터링 모듈"""
import psutil
import time
from threading import Lock


class NetworkMonitor:
    """네트워크 모니터링 클래스 (스레드 안전)"""

    def __init__(self):
        self._last_net_io = None
        self._last_time = None
        self._lock = Lock()

    def get_info(self) -> dict:
        """네트워크 트래픽 정보 수집"""
        with self._lock:
            net_io = psutil.net_io_counters()
            current_time = time.time()

            # 속도 계산 (MB/s)
            bytes_sent_speed = 0.0
            bytes_recv_speed = 0.0

            if self._last_net_io is not None and self._last_time is not None:
                time_delta = current_time - self._last_time
                if time_delta > 0:
                    bytes_sent_speed = (net_io.bytes_sent - self._last_net_io.bytes_sent) / time_delta / (1024 * 1024)
                    bytes_recv_speed = (net_io.bytes_recv - self._last_net_io.bytes_recv) / time_delta / (1024 * 1024)

            self._last_net_io = net_io
            self._last_time = current_time

            # 네트워크 인터페이스 정보
            interfaces = []
            net_if_addrs = psutil.net_if_addrs()
            net_if_stats = psutil.net_if_stats()

            for iface_name, addrs in net_if_addrs.items():
                stats = net_if_stats.get(iface_name)
                if stats and stats.isup:
                    ip_addr = None
                    for addr in addrs:
                        if addr.family.name == 'AF_INET':
                            ip_addr = addr.address
                            break
                    if ip_addr:
                        interfaces.append({
                            "name": iface_name,
                            "ip": ip_addr,
                            "speed_mbps": stats.speed if stats.speed > 0 else None
                        })

            return {
                "bytes_sent_total_mb": round(net_io.bytes_sent / (1024 * 1024), 2),
                "bytes_recv_total_mb": round(net_io.bytes_recv / (1024 * 1024), 2),
                "bytes_sent_speed_mbps": round(bytes_sent_speed, 3),
                "bytes_recv_speed_mbps": round(bytes_recv_speed, 3),
                "packets_sent": net_io.packets_sent,
                "packets_recv": net_io.packets_recv,
                "interfaces": interfaces
            }


# 전역 인스턴스 생성 (하위 호환성 유지)
_network_monitor = NetworkMonitor()


def get_network_info() -> dict:
    """네트워크 트래픽 정보 수집 (래퍼 함수)"""
    return _network_monitor.get_info()
