import time
from .models import RequestLog

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # We only care about /api/ requests
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = (time.time() - start_time) * 1000  # Convert to ms
        
        try:
            RequestLog.objects.create(
                endpoint=request.path,
                method=request.method,
                response_time=duration,
                status_code=response.status_code
            )
        except Exception:
            # Avoid crashing the request if logging fails
            pass
            
        return response
