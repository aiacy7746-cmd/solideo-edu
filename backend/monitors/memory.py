"""메모리 모니터링 모듈"""
import psutil


def get_memory_info() -> dict:
    """RAM 정보 수집"""
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    
    return {
        "total_gb": round(mem.total / (1024 ** 3), 2),
        "used_gb": round(mem.used / (1024 ** 3), 2),
        "available_gb": round(mem.available / (1024 ** 3), 2),
        "usage_percent": mem.percent,
        "swap_total_gb": round(swap.total / (1024 ** 3), 2),
        "swap_used_gb": round(swap.used / (1024 ** 3), 2),
        "swap_percent": swap.percent
    }
