from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv
import os

# Explicitly load the .env file from the project root directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "論文整理系統"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # 資料庫設置
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "paper_management")
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    # JWT 設置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key")
    ALGORITHM: str = "HS256"
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = 1  # 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # 檔案上傳設置
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    UPLOAD_FOLDER: str = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH: int = 16 * 1024 * 1024  # 16MB

    # OpenAI API 密鑰設置，請在 .env 中設置 OPENAI_API_KEY
    OPENAI_API_KEY: str

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.SQLALCHEMY_DATABASE_URI = "postgresql://andy:postgres@localhost/paper_management"
        print("DEBUG: SQLALCHEMY_DATABASE_URI =", self.SQLALCHEMY_DATABASE_URI)
        
        # 確保上傳目錄存在
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(os.path.join(self.UPLOAD_FOLDER, "figures"), exist_ok=True)

    class Config:
        case_sensitive = True

settings = Settings()
