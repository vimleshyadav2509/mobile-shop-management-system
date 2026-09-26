import uvicorn
import os
import sys

# Ensure backend directory is on python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import PORT, HOST, IS_PRODUCTION

if __name__ == "__main__":
    use_reload = not IS_PRODUCTION and os.getenv("RELOAD", "true").lower() in ("true", "1")
    print(f"Starting Amit Mobile Shop Backend on http://{HOST}:{PORT} (reload={use_reload})")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=use_reload)

