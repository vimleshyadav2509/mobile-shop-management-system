import uvicorn
import os
import sys

# Ensure backend directory is on python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import PORT, HOST

if __name__ == "__main__":
    print(f"Starting Amit Mobile Shop Backend on http://{HOST}:{PORT}")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
