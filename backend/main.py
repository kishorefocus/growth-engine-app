"""
GlobalReach Growth Engine — FastAPI entrypoint shim.
Allows running `uvicorn main:app` directly from backend/.
"""
from app.main import app

__all__ = ["app"]
