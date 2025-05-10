# CIFLab 論文管理系統

這是一個專為論文管理所設計的系統，結合 **FastAPI** 後端與 **React + Vite + TypeScript** 前端，提供使用者上傳及管理 PDF/DOCX 論文、自動提取論文資訊以及生成摘要。本專案利用 GPT-4 技術提升論文元數據解析與摘要生成的準確性與效率，同時搭配關鍵詞提取功能，讓論文搜尋與管理更為便捷。

---

## 特色

- **GPT-4 驅動的元數據與摘要提取**

  - 利用 GPT-4 分析全文，回傳包含標題、作者、年份及主題的 JSON metadata。
  - 生成英文摘要，再經 GPT-4 翻譯並優化為繁體中文摘要。

- **自動關鍵詞提取**

  - 使用 NLTK 進行文字分詞與頻率統計，提取最具代表性的關鍵詞（前 10 個）。

- **直觀的前端體驗**
  - 首頁載入時顯示高科技風格的 Splash 動畫，營造不凡視覺效果。
  - 提供論文列表、搜尋及詳細頁面，方便用戶快速定位所需資訊。
  - 採用 Material-UI (MUI) 主題與元件，確保良好的 UI/UX 體驗。

---

## 技術棧

- **後端**

  - 語言：Python 3.10+
  - 框架：FastAPI, Uvicorn
  - 資料庫：SQLAlchemy，支援 PostgreSQL 或 SQLite
  - 其他工具：PyMuPDF、python-docx、NLTK、transformers、sentence-transformers
  - GPT-4：使用 OpenAI API 進行深度文本解析與摘要生成

- **前端**

  - 語言：TypeScript
  - 框架：React 18 + Vite
  - 路由：React Router v6
  - 狀態管理：@tanstack/react-query
  - UI 庫：Material-UI (MUI)

- **其他工具與支援**
  - Docker（選用，可搭配 Docker Compose 部署）
  - ESLint 與 Prettier（代碼品質與格式統一）

---

## 系統需求

- Node.js v18+
- Python 3.10+
- 資料庫：PostgreSQL（或配置 SQLite）
- OpenAI API 金鑰

---

## 快速安裝與執行

### 1. 後端 (FastAPI)

1. 進入後端目錄：
   ```bash
   cd backend
   ```
2. 建立虛擬環境並安裝依賴：
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r ../requirements.txt
   ```
3. 建立 `.env`（專案根目錄）：
   ```ini
   # .env
   DATABASE_URL=postgresql://user:password@localhost:5432/ciflab
   OPENAI_API_KEY=sk-...
   UPLOAD_FOLDER=./backend/uploads
   ```
4. 初始化資料庫：
   ```bash
   python app/db/init_db.py
   ```
5. 啟動後端開發伺服器：
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### 2. 前端 (React + Vite)

1. 進入前端目錄：
   ```bash
   cd frontend
   ```
2. 安裝依賴：
   ```bash
   npm install
   ```
3. 啟動前端開發伺服器：
   ```bash
   npm run dev
   ```
4. 在瀏覽器中開啟以下連結：
   ```
   http://localhost:5174
   ```

---

## 專案結構

專案採用前後端分離架構，主要結構如下：

```
.
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI 路由與 API 版本管理
│   │   │   └── api_v1/       # v1 版本 API 端點
│   │   ├── core/             # 系統配置與設定檔
│   │   ├── db/               # 資料庫模型與連線設定（初始化資料庫、管理會話）
│   │   ├── models/           # ORM 模型（例如：user、paper 等）
│   │   ├── schemas/          # Pydantic schema 定義資料格式
│   │   ├── services/         # 服務層（例如：論文處理與認證服務）
│   │   └── main.py           # FastAPI 啟動入口
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── assets/           # 靜態資源
    │   ├── components/       # UI 元件（Navbar, Splash, Spinner 等）
    │   ├── context/          # React Context (例如：AuthContext)
    │   ├── pages/            # 不同頁面的組件（Home, Login, PaperDetail, Search, Upload）
    │   ├── services/         # API 與狀態管理工具（Axios, React Query）
    │   ├── theme.ts          # MUI 主題設定
    │   └── App.tsx           # 應用程式路由與入口組件
    └── package.json
```

---

## 環境變數

需在專案根目錄建立 `.env` 檔案，定義下列環境變數：

```ini
DATABASE_URL=postgresql://<user>:<pass>@<host>:<port>/<db>
OPENAI_API_KEY=<您的 OpenAI API 金鑰>
UPLOAD_FOLDER=./backend/uploads
```

---

## 開發與調試

- **後端**

  - 自動重載功能支援：每當程式碼變更時將自動重啟伺服器。
  - Swagger 文件：可於 `http://localhost:8000/docs` 瀏覽 API 文檔。

- **前端**
  - Vite 的快速重新載入機制提升開發效率。
  - 使用 React DevTools 進行元件樹檢查與狀態調試。

---

## 部署建議

- **Docker 部署**
  - 可針對後端與前端建立 Docker 映像檔，搭配 Docker Compose 進行多容器部署。
- **反向代理與 SSL/TLS**
  - 建議使用 NGINX 做為前端靜態資源的反向代理伺服器，同時利用 Let’s Encrypt 配置 SSL/TLS。
- **安全性與效能**
  - 將後端 API 僅暴露於內部網路，並針對 CORS 進行白名單設定以提高安全性。

---

## License

本專案採用 [MIT License](LICENSE)。

---

此更新版本在原有功能基礎上進行了細節補充與說明，讓使用者更能快速了解專案設計與運作方式。
