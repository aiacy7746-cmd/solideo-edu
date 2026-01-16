"""디스크 모니터링 모듈"""
import psutil


def get_disk_info() -> dict:
    """디스크 정보 수집"""
    partitions = psutil.disk_partitions()
    disks = []
    
    for partition in partitions:
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disks.append({
                "device": partition.device,
                "mountpoint": partition.mountpoint,
                "fstype": partition.fstype,
                "total_gb": round(usage.total / (1024 ** 3), 2),
                "used_gb": round(usage.used / (1024 ** 3), 2),
                "free_gb": round(usage.free / (1024 ** 3), 2),
                "usage_percent": usage.percent
            })
        except (PermissionError, OSError):
            continue
    
    # 주 디스크 (보통 C: 또는 /)
    primary = disks[0] if disks else None
    
    return {
        "disks": disks,
        "primary": primary
    }
