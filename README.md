# Pocket Trip App

`SvelteKit + TypeScript + Cloudflare Workers + D1 + Google Drive CSV export`

這個 repo 已經從單純的靜態行程 viewer，轉成完整旅遊 app 的基底。

目前的優先順序是：

1. 先用現有 `data/2026korea.csv` 把資料完整展示在新 app
2. 確認欄位與畫面無誤
3. 再做新增、刪除、編輯與匯出流程

## Stack

- 前端: `SvelteKit + TypeScript`
- 部署: `Cloudflare Workers`
- 主資料庫: `D1`
- 地點解析: `Google Maps / Places API`
- 匯出: `Google Drive CSV`

## 重要原則

- `D1` 是 app 的主資料來源
- `Google Drive CSV` 是 export / sync 邊界，不是主資料庫
- Google Maps 連結只負責解析 place 資訊，之後仍可手動修正

## 路由

- `/` : 旅程列表
- `/trips/[slug]` : 行程展示 / 編輯主頁
- `/api/places/resolve` : 解析 Google Maps 連結
- `/api/exports/drive` : 匯出旅程 CSV 到 Google Drive

## Docker Desktop 開發

推薦直接用 Docker Desktop 跑，這樣在 Windows 上會比裸跑穩很多。

### 1. 啟動開發環境

```bash
docker compose up --build
```

啟動後打開：

- [http://localhost:5173](http://localhost:5173)

### 2. 停止

```bash
docker compose down
```

### 3. 第一次依賴變更後重建

如果 `package.json` 有變，重新 build：

```bash
docker compose up --build
```

## 本機非 Docker 開發

如果你本機有完整 Node/npm：

```bash
npm install
npm run dev
```

型別檢查：

```bash
npm run check
```

## D1

建立 schema：

```bash
npm run db:apply
```

Schema 在 [db/schema.sql](/D:/onsen.dansi/pocket/db/schema.sql)。

## Secrets

需要的環境變數列在 [.env.example](/D:/onsen.dansi/pocket/.env.example)。

注意：

- `GOOGLE_DRIVE_FOLDER_ID` 建議搭配 service account 可寫入的資料夾
- 如果要寫進你自己的 Drive，通常要把資料夾共享給 service account
- `MAPS_API_KEY` 用於 Places 解析

## 目前狀態

- 已有 SvelteKit app 骨架
- 已有 Cloudflare / D1 設定
- 已有 Google Places resolve endpoint
- 已有 Google Drive CSV export endpoint 骨架
- 已接入 `data/2026korea.csv` 作為 fallback viewer 資料來源

## 接下來

- 先用現有 CSV 驗證畫面與欄位展示
- 再補 trip create / edit / save
- 再補 export flow 與 Places 自動填欄
