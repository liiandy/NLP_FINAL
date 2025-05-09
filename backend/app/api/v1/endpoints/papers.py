from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.app.models.paper import Paper, Topic, Keyword, Summary
from backend.schemas.paper import PaperResponse

router = APIRouter()

@router.get("/{paper_id}", response_model=PaperResponse)
async def get_paper(
    paper_id: int,
    db: Session = Depends(get_db)
):
    """獲取論文詳情"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="論文不存在")
    return paper

@router.get("/", response_model=List[PaperResponse])
async def list_papers(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """獲取論文列表"""
    papers = db.query(Paper).offset(skip).limit(limit).all()
    return papers 