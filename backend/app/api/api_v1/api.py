from fastapi import APIRouter
from .endpoints import auth, papers

api_router = APIRouter()
api_router.include_router(auth.router, prefix="", tags=["auth"])
api_router.include_router(papers.router, prefix="/papers", tags=["papers"])