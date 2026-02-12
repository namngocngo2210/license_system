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
            # Add detailed console logging for debugging
            status_color = "\033[92m" if response.status_code < 400 else "\033[91m"
            reset_color = "\033[0m"
            print(f"{status_color}[API LOG]{reset_color} {request.method} {request.path} - {response.status_code} ({duration:.2f}ms)")
            
            if request.method in ['POST', 'PUT', 'PATCH'] and request.body:
                try:
                    import json
                    body = json.loads(request.body)
                    print(f"  {status_color}Body:{reset_color} {json.dumps(body, indent=2)}")
                except:
                    pass

        except Exception as e:
            print(f"Logging error: {e}")
            pass
            
        return response
