"""CPU 모니터링 모듈"""
import psutil


def get_cpu_info() -> dict:
    """CPU 정보 수집"""
    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_percent_per_core = psutil.cpu_percent(interval=None, percpu=True)
    cpu_freq = psutil.cpu_freq()
    
    # CPU 온도 (Windows에서는 제한적)
    temperature = None
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for name, entries in temps.items():
                if entries:
                    temperature = entries[0].current
                    break
    except (AttributeError, KeyError):
        pass
    
    return {
        "usage_percent": cpu_percent,
        "per_core_percent": cpu_percent_per_core,
        "core_count": psutil.cpu_count(logical=False),
        "thread_count": psutil.cpu_count(logical=True),
        "frequency_mhz": cpu_freq.current if cpu_freq else None,
        "temperature_celsius": temperature
    }
