from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class KeywordBase(BaseModel):
    word: str

class KeywordCreate(KeywordBase):
    pass

class Keyword(KeywordBase):
    id: int
    
    class Config:
        from_attributes = True

class TopicBase(BaseModel):
    name: str
    description: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int
    
    class Config:
        from_attributes = True

class SummaryBase(BaseModel):
    content: str

class SummaryCreate(SummaryBase):
    pass

class Summary(SummaryBase):
    id: int
    paper_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaperBase(BaseModel):
    title: str
    authors: List[str] = []
    journal: Optional[str] = None
    year: Optional[int] = None
    github_link: Optional[str] = None
    abstract: Optional[str] = None
    content: Optional[str] = None

class PaperCreate(PaperBase):
    pass

class PaperList(PaperBase):
    id: int
    created_at: datetime
    file_path: Optional[str] = None
    summary: Optional[str] = None
    keywords: List[str] = []
    topics: List[str] = []
    uploader_id: Optional[int] = None
    uploader_name: Optional[str] = None

    class Config:
        from_attributes = True

class PaperResponse(PaperBase):
    id: int
    file_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    authors: List[str] = []
    keywords: List[Keyword] = []
    topic: Optional[Topic] = None
    summary: Optional[Summary] = None
    uploader_id: Optional[int] = None
    uploader_name: Optional[str] = None

    class Config:
        from_attributes = True
