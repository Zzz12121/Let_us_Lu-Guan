# 數位微粒相變與自組裝模擬引擎 (Digital Particle Morphing Engine)

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Language](https://img.shields.io/badge/Language-Python%20%7C%20JavaScript-blue)

這是一個結合**化學工程思維**與**電腦視覺演算法**的跨領域專案。本專案核心探討「像素守恆」的概念，將一張圖片解構成數萬個數位微粒，並利用光學位能梯度引導粒子進行空間位移，最終在另一個穩態結構中重新聚合。

## 🧪 核心設計理念 (Engineering Concepts)

本專案不僅是視覺特效，更融入了以下工程直覺：
1. **質量守恆 (Mass Conservation)**：在相變過程中，粒子總數不增不減，確保影像資訊的完整重組。
2. **位能梯度映射 (Potential Gradient Mapping)**：提取像素的灰階亮度作為特徵值，將高維度的色彩比對降維至一維排序，大幅提升運算效率。
3. **質傳動力學 (Mass Transfer Kinetics)**：引入非線性緩動函數 (Ease-in-out)，模擬微粒在流體中的加速與減速過程，呈現自然的動態過渡。

---

## 🛠️ 事前準備 (Prerequisites)

在開始執行前，請確保您的環境已安裝：
* [Python 3.8+](https://www.python.org/downloads/)
* [Node.js (LTS 版本)](https://nodejs.org/)
* [Git](https://git-scm.com/) (選配)

---

## 🚀 模式一：Python 核心引擎版 (離線渲染影片)

此模式適用於生成高畫質的 MP4 動畫，透過 Python 的強力矩陣運算處理數萬個粒子的運動軌跡。

### 1. 建立並啟動虛擬環境
在專案根目錄開啟終端機 (PowerShell)，依序執行：
` ` `powershell
# 建立虛擬環境
python -m venv .venv

# 啟動虛擬環境 (繞過 Windows 執行原則限制)
(Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& .\.venv\Scripts\Activate.ps1)
` ` `

### 2. 安裝必要套件
` ` `powershell
pip install numpy Pillow opencv-python tqdm
` ` `

### 3. 執行渲染程式
確保資料夾內已有 strong_grandpa.jpg 與 target.jpg。
` ` `powershell
python strong_grandpa_pro.py
` ` `
*執行完成後，您將在根目錄看到 strong_grandpa_animated.mp4 影片檔案。*

---

## 🌐 模式二：Web 前端互動儀表板 (即時渲染)

將演算法移植至瀏覽器端，利用使用者端的運算資源進行即時相變模擬。

### 1. 進入網頁專案目錄
` ` `powershell
cd web-particle-engine
` ` `

### 2. 安裝前端依賴套件
` ` `powershell
npm install
` ` `

### 3. 啟動本地開發伺服器 (Localhost)
` ` `powershell
npm run dev
` ` `

### 4. 開啟網頁體驗
啟動後，請在瀏覽器網址列輸入：
http://localhost:5173/

**功能說明：**
* **即時調整**：透過拉桿即時修改解析度、動畫長度與畫布大小。
* **自訂輸入**：可上傳個人照片作為來源或目標結構。
* **無損重組**：所有運算皆在瀏覽器端即時完成。

---

## 📂 專案結構 (Project Structure)

```text
C:\NTHU\benson\
 ├── .venv/                   # Python 虛擬環境 (Git 已忽略)
 ├── web-particle-engine/      # 網頁版專案資料夾
 │    ├── public/             # 存放預設圖片 (target.jpg)
 │    ├── src/                # 網頁核心程式碼 (main.js, style.css)
 │    └── package.json        # 網頁設定檔
 ├── strong_grandpa_pro.py     # Python 核心渲染指令檔
 ├── strong_grandpa.jpg        # 預設來源圖
 ├── target.jpg                # 預設目標圖
 ├── .gitignore                # Git 忽略清單
 └── README.md                 # 您正在閱讀的文件