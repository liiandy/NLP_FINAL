from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .core.config import settings
from .api.api_v1.api import api_router
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 設置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 確保上傳目錄存在
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_FOLDER, "figures"), exist_ok=True)

# 掛載靜態文件目錄
app.mount("/static", StaticFiles(directory=settings.UPLOAD_FOLDER), name="static")

# 包含 API 路由
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "歡迎使用論文整理系統"}

print("DEBUG: FastAPI routes:", app.routes)

# 配置 uvicorn 的運行參數
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        timeout_keep_alive=120,  # 增加保持連接的超時時間
        timeout_graceful_shutdown=120,  # 增加優雅關閉的超時時間
        limit_concurrency=100,  # 增加並發連接數
        limit_max_requests=1000,  # 增加最大請求數
    log_level="info",
    )
