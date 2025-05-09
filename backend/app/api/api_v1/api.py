from fastapi import APIRouter
from .endpoints import papers

api_router = APIRouter()
api_router.include_router(papers.router, prefix="/papers", tags=["papers"]) 