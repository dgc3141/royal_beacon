<div align="center">

# 皇居コンパス | ROYAL BEACON

**現在地から皇居までの直線距離と方角をリアルタイムに示す、ミニマル・モノトーンなWebコンパス**

[![React](https://img.shields.io/badge/React-19.0-black?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-black?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3-black?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-black?style=flat-square&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)

[🌐 **Live Demo を開く**](https://dgc3141.github.io/royal_beacon/)

</div>

---

## 🏛️ Overview

**Royal Beacon** は、スマートフォンのGPSおよび各種センサーを活用し、現在地から皇居（北緯 35.6851° / 東経 139.7528°）までの直線距離と正確な方角をリアルタイムに指し示すコンパスアプリケーションです。

白と黒を基調としたモダン・ミニマルな計器デザインを採用し、Android (Pixel 9 / Chrome) および iOS (Safari) における傾き補正・高精度な追従性を実現しています。

---

## ✨ Features

- 🧭 **3D 傾き補正コンパス (Tilt Compensation)**  
  W3C準拠の姿勢計算により、スマートフォンを手で斜めに持った状態や直立させた状態でも正確な真北基準方位を算出。
- ⚡ **超滑らかな 60fps 追従 & RAF 最適化**  
  高頻度なセンサー更新を `requestAnimationFrame` でスロットリングし、ブレを抑えつつ俊敏に反応する動的ローパスフィルターを搭載。
- 🎯 **皇居アライメント・フィードバック**  
  端末の正面が皇居の方向（±5° 以内）を捉えると、コンパス外周と指針が上品に発光して通知。
- 📏 **高精度な直線距離 & 方位角計算**  
  大圏航路の測地計算（Haversine式・標準地球平均半径 6371km）による高精度な距離と16方位を表示。
- 📱 **クロスプラットフォーム対応**  
  iOS (Safari: `webkitCompassHeading`) および Android (Chrome: `deviceorientationabsolute`) の両方に最適化。
- 🤍 **モダン・モノトーン UI**  
  Tailwind CSS v4 と Google Fonts (`Plus Jakarta Sans` / `Noto Sans JP`) による洗練されたデザイン。

---

## 🛠️ Tech Stack

| カテゴリ       | 技術                                                      |
| :------------- | :-------------------------------------------------------- |
| **Framework**  | [React 19](https://react.dev/)                            |
| **Language**   | [TypeScript 5.9](https://www.typescriptlang.org/)         |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com/) / Vanilla CSS |
| **Build Tool** | [Vite 7](https://vitejs.dev/)                             |
| **Testing**    | [Vitest](https://vitest.dev/) / React Testing Library     |
| **CI / CD**    | GitHub Actions (Auto Deploy to GitHub Pages)              |

---

## 🚀 Getting Started

### 必要環境

- Node.js `>= 22.0.0`
- npm

### インストール & 開発

```bash
# リポジトリのクローン
git clone https://github.com/dgc3141/royal_beacon.git
cd royal_beacon

# 依存関係のインストール
npm install

# ローカル開発サーバーの起動 (Vite)
npm run dev

# ユニットテストの実行 (Vitest)
npm test

# プロダクションビルド
npm run build
```

---

## 📍 Target Coordinates

- **皇居 (Tokyo Imperial Palace)**: `35.685175° N, 139.752800° E`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Crafted with precision by <a href="https://github.com/dgc3141">dgc3141</a></sub>
</div>
