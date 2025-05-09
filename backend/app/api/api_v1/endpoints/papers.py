from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import logging
from datetime import datetime

from ....db.session import get_db
from ....services.paper_processor import PaperProcessor
from ....models.paper import Paper, Topic, Keyword, Summary
from ....schemas.paper import PaperCreate, PaperResponse, PaperList
from ....core.config import settings

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
paper_processor = PaperProcessor()

@router.post("/upload", response_model=PaperResponse)
async def upload_paper(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上傳並處理論文文件"""
    try:
        # 保存上傳的文件
        file_path = os.path.join(settings.UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 處理論文
        processor = PaperProcessor()
        paper_data = await processor.process_paper(file_path)
        
        # 創建摘要對象
        summary = Summary(
            content=paper_data["summary"]["content"],
            created_at=datetime.utcnow()
        )
        
        # 創建論文記錄
        paper = Paper(
            title=paper_data["title"][:500],
            authors=str(paper_data["authors"]),  # 將列表轉換為字符串
            journal=paper_data["journal"],
            year=paper_data["year"],
            abstract=paper_data["abstract"],
            file_path=file_path,
            summary=summary  # 直接設置 summary 關係
        )
        
        # 添加關鍵詞
        for keyword_text in paper_data["keywords"]:
            # 檢查關鍵詞是否已存在
            existing_keyword = db.query(Keyword).filter(Keyword.word == keyword_text).first()
            if existing_keyword:
                paper.keywords.append(existing_keyword)
            else:
                new_keyword = Keyword(word=keyword_text)
                paper.keywords.append(new_keyword)
        
        db.add(paper)
        db.commit()
        db.refresh(paper)
        
        # 構建符合 PaperResponse 模型的響應
        response = PaperResponse(
            id=paper.id,
            title=paper.title,
            authors=eval(paper.authors) if paper.authors else [],  # 將字符串轉換回列表
            journal=paper.journal,
            year=paper.year,
            abstract=paper.abstract,
            content=paper.content,
            file_path=paper.file_path,
            github_link=paper.github_link,
            created_at=paper.created_at,
            updated_at=paper.updated_at,
            topic=paper.topic,
            summary=paper.summary,
            keywords=paper.keywords
        )
        
        return response
    except Exception as e:
        logger.error(f"上傳論文時發生錯誤: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"處理論文時發生錯誤: {str(e)}"
        )

@router.get("/", response_model=List[PaperList])
def list_papers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """獲取論文列表"""
    try:
        papers = db.query(Paper).offset(skip).limit(limit).all()
        return [
            PaperList(
                id=paper.id,
                title=paper.title,
                authors=eval(paper.authors) if paper.authors else [],
                journal=paper.journal,
                year=paper.year,
                abstract=paper.abstract,
                content=paper.content,
                file_path=paper.file_path,
                created_at=paper.created_at,
                updated_at=paper.updated_at,
                topic=paper.topic.name if paper.topic else None,
                summary=paper.summary.content if paper.summary else None,
                keywords=[k.word for k in paper.keywords]
            )
            for paper in papers
        ]
    except Exception as e:
        logger.error(f"獲取論文列表時發生錯誤: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取論文列表時發生錯誤: {str(e)}")

@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(
    paper_id: int,
    db: Session = Depends(get_db)
):
    """獲取單篇論文詳情"""
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            raise HTTPException(status_code=404, detail="論文不存在")
            
        # 構建完整的響應
        response = PaperResponse(
            id=paper.id,
            title=paper.title,
            authors=eval(paper.authors) if paper.authors else [],
            journal=paper.journal,
            year=paper.year,
            abstract=paper.abstract,
            content=paper.content,
            file_path=paper.file_path,
            github_link=None,  # 添加這個字段
            created_at=paper.created_at,
            updated_at=paper.updated_at,
            topic={
                'id': paper.topic.id,
                'name': paper.topic.name,
                'description': paper.topic.description
            } if paper.topic else None,
            summary={
                'id': paper.summary.id,
                'paper_id': paper.summary.paper_id,
                'content': paper.summary.content,
                'created_at': paper.summary.created_at
            } if paper.summary else None,
            keywords=[{
                'id': k.id,
                'word': k.word
            } for k in paper.keywords]
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"獲取論文詳情時發生錯誤: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取論文詳情時發生錯誤: {str(e)}")

@router.get("/search/", response_model=List[PaperList])
def search_papers(
    keyword: str = None,
    topic: str = None,
    db: Session = Depends(get_db)
):
    """搜尋論文"""
    try:
        query = db.query(Paper)
        
        if keyword:
            query = query.join(Paper.keywords).filter(Keyword.word.ilike(f"%{keyword}%"))
        
        if topic:
            query = query.join(Paper.topic).filter(Topic.name.ilike(f"%{topic}%"))
        
        papers = query.all()
        return [
            PaperList(
                id=paper.id,
                title=paper.title,
                authors=eval(paper.authors) if paper.authors else [],
                journal=paper.journal,
                year=paper.year,
                abstract=paper.abstract,
                content=paper.content,
                file_path=paper.file_path,
                created_at=paper.created_at,
                updated_at=paper.updated_at,
                topic=paper.topic.name if paper.topic else None,
                summary=paper.summary.content if paper.summary else None,
                keywords=[k.word for k in paper.keywords]
            )
            for paper in papers
        ]
    except Exception as e:
        logger.error(f"搜尋論文時發生錯誤: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"搜尋論文時發生錯誤: {str(e)}")
