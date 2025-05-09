from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db.base_class import Base

# 論文-關鍵字關聯表
paper_keyword = Table(
    'paper_keyword',
    Base.metadata,
    Column('paper_id', Integer, ForeignKey('papers.id', ondelete='CASCADE')),
    Column('keyword_id', Integer, ForeignKey('keywords.id', ondelete='CASCADE'))
)

class Paper(Base):
    __tablename__ = "papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    authors = Column(String(500), nullable=False, default='[]')
    journal = Column(String(200), nullable=True)
    year = Column(Integer, nullable=True)
    abstract = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    github_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # 關聯
    topic_id = Column(Integer, ForeignKey('topics.id', ondelete='SET NULL'), nullable=True)
    topic = relationship("Topic", back_populates="papers")
    keywords = relationship("Keyword", secondary=paper_keyword, back_populates="papers")
    summary = relationship("Summary", back_populates="paper", uselist=False, cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    papers = relationship("Paper", back_populates="topic")

class Keyword(Base):
    __tablename__ = "keywords"

    id = Column(Integer, primary_key=True, index=True)
    word = Column(String(100), unique=True, index=True, nullable=False)
    
    papers = relationship("Paper", secondary=paper_keyword, back_populates="keywords")

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    paper_id = Column(Integer, ForeignKey('papers.id', ondelete='CASCADE'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    paper = relationship("Paper", back_populates="summary") 