# CIFLab 論文管理系統

一個結合 **FastAPI** 後端和 **React + Vite + TypeScript** 前端的論文管理平台。

- 上傳 PDF / DOCX 論文
- 自動擷取論文標題、作者、年份、英文摘要（GPT-4）
- 自動生成繁體中文摘要（GPT-4）
- 關鍵詞提取
- 列表檢視、搜尋、詳細頁面

---

## 目錄

- [特色](#特色)
- [技術棧](#技術棧)
- [系統需求](#系統需求)
- [快速安裝與執行](#快速安裝與執行)
  - [1. 後端（FastAPI）](#1-後端fastapi)
  - [2. 前端（React + Vite）](#2-前端react--vite)
- [專案結構](#專案結構)
- [環境變數](#環境變數)
- [開發與調試](#開發與調試)
- [部署建議](#部署建議)
- [License](#license)

---

## 特色

- **GPT-4 驅動的元數據與摘要提取**

  - 全文傳入 OpenAI GPT-4，解析並回傳 JSON metadata：標題、作者、年份、主題
  - 英文摘要直接由 GPT-4 生成，保持準確度
  - 繁體中文摘要由 GPT-4 翻譯並精煉

- **自動關鍵詞提取**

  - 使用 NLTK 分詞與頻率統計，提取前 10 個關鍵詞

- **前端體驗**
  - 首次進入首頁顯示高科技風格 Splash 動畫
  - 列表、搜尋、詳細頁面三大功能
  - MUI（Material-UI）樣式與主題支持

---

## 技術棧

- **後端**: Python 3.10+
  - FastAPI, Uvicorn
  - SQLAlchemy + PostgreSQL（或 SQLite）
  - OpenAI AsyncOpenAI (GPT-4)
  - PyMuPDF、python-docx
  - NLTK、transformers (barto)、sentence-transformers
- **前端**:
  - React 18 + Vite
  - TypeScript + TSX
  - React Router v6
  - @tanstack/react-query
  - Material-UI (MUI)
- **其他**:
  - Docker（選用）
  - Prettier + ESLint

---

## 系統需求

- Node.js v18+
- Python 3.10+
- PostgreSQL (或 自行設定 SQLite)
- OpenAI API Key

---

## 快速安裝與執行

### 1. 後端 (FastAPI)

1. 進入後端目錄
   ```bash
   cd backend
   ```
2. 建立虛擬環境並安裝依賴
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r ../requirements.txt
   ```
3. 建立 `.env`（根目錄）
   ```ini
   # .env
   DATABASE_URL=postgresql://user:password@localhost:5432/ciflab
   OPENAI_API_KEY=sk-...
   UPLOAD_FOLDER=./backend/uploads
   ```
4. 初始化資料庫
   ```bash
   python app/db/init_db.py
   ```
5. 啟動開發伺服器
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. 前端 (React + Vite)

1. 進入前端目錄
   ```bash
   cd frontend
   ```
2. 安裝依賴
   ```bash
   npm install
   ```
3. 啟動開發伺服器
   ```bash
   npm run dev
   ```
4. 打開瀏覽器
   ```
   http://localhost:5174
   ```

---

## 專案結構

```
.
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI 路由
│   │   ├── core/             # 設定
│   │   ├── db/               # 資料庫模型 & 會話
│   │   ├── models/           # ORM model
│   │   ├── schemas/          # Pydantic schema
│   │   ├── services/         # PaperProcessor (解析/摘要)
│   │   └── main.py           # FastAPI 啟動
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/       # UI 元件 (Navbar, Splash, Spinner)
    │   ├── pages/            # Home, Upload, Search, Detail
    │   ├── services/         # Axios + React Query
    │   ├── theme.ts          # MUI 主題
    │   └── App.tsx           # 路由與 Splash
    └── package.json
```

---

## 環境變數

請在專案根目錄建立 `.env`，定義：

```ini
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>
OPENAI_API_KEY=<您的 OpenAI API 金鑰>
UPLOAD_FOLDER=./backend/uploads
```

---

## 開發與調試

- 後端：
  - 監看程式檔變動自動重載
  - Swagger 文檔：`http://localhost:8000/docs`
- 前端：
  - Vite 快速重新載入
  - React DevTools

---

## 部署建議

- 使用 Docker Compose
- 將後端暴露在內網，前端靜態資源部署於 NGINX
- SSL/TLS：Let’s Encrypt
- 設定 CORS 白名單

---

## License

本專案採用 MIT License，詳見 [LICENSE](LICENSE)
