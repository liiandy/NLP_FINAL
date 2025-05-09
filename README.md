# 論文整理系統

這是一個用於辦公室內部論文整理的網頁應用系統，提供論文上傳、分類、摘要生成等功能。

## 功能特點

- 論文自動歸檔與分類
- 關鍵字自動提取
- 自動摘要生成
- 相似度預警
- GitHub 連結整合
- 使用者管理系統

## 技術架構

### 後端

- FastAPI
- PostgreSQL
- SQLAlchemy
- PyMuPDF
- Transformers (BERT/SciBERT)
- FAISS

### 前端

- React
- TypeScript
- Material-UI

## 安裝與設置

### 後端設置

1. 創建虛擬環境：

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows
```

2. 安裝依賴：

```bash
pip install -r requirements.txt
```

3. 設置環境變數：
   創建 `.env` 文件並設置以下變數：

```
POSTGRES_SERVER=localhost
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=paper_management
SECRET_KEY=your_secret_key
```

4. 運行後端服務：

```bash
cd backend
uvicorn app.main:app --reload
```

### 前端設置

1. 安裝依賴：

```bash
cd frontend
npm install
```

2. 運行開發服務器：

```bash
npm run dev
```

## API 文檔

啟動後端服務後，訪問以下地址查看 API 文檔：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 開發團隊

[您的團隊名稱]

## 授權

[授權信息]
