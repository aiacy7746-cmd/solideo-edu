"""GPU 모니터링 모듈"""


def get_gpu_info() -> dict:
    """GPU 정보 수집 (NVIDIA only)"""
    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        
        if not gpus:
            return {"available": False, "gpus": []}
        
        gpu_list = []
        for gpu in gpus:
            gpu_list.append({
                "id": gpu.id,
                "name": gpu.name,
                "usage_percent": gpu.load * 100,
                "memory_total_mb": gpu.memoryTotal,
                "memory_used_mb": gpu.memoryUsed,
                "memory_percent": (gpu.memoryUsed / gpu.memoryTotal * 100) if gpu.memoryTotal > 0 else 0,
                "temperature_celsius": gpu.temperature
            })
        
        return {
            "available": True,
            "gpus": gpu_list,
            "primary": gpu_list[0] if gpu_list else None
        }
    except Exception:
        return {"available": False, "gpus": [], "error": "GPU monitoring not available"}
