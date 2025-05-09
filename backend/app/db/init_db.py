from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from .base_class import Base
from ..models.paper import Paper, Topic, Keyword, Summary
from ..core.config import settings
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """初始化資料庫"""
    # 創建資料庫引擎
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    
    # 刪除所有現有表格
    logger.info("刪除現有表格...")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS figures CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS papers CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS topics CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS keywords CASCADE"))
        conn.execute(text("DROP TABLE IF EXISTS summaries CASCADE"))
        conn.commit()
    
    # 創建所有表格
    logger.info("創建新表格...")
    Base.metadata.create_all(bind=engine)
    
    # 創建會話
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 這裡可以添加一些初始數據
        logger.info("資料庫初始化完成")
    except Exception as e:
        logger.error(f"初始化資料庫時發生錯誤: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 