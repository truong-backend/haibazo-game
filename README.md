# 🎮 Haibazo Number Click Game

> A number-sequencing game built with **React + TypeScript + Vite**.  
> Click nodes from **1 → N** in order before time runs out — or let Auto Play do it for you!

---

## 📸 Preview

```
┌─────────────────────────────────┐
│  LET'S PLAY                     │
│  Points: [  10  ]               │
│  Time:   2.4s                   │
│  [Restart]  [Auto Play OFF]     │
│ ┌─────────────────────────────┐ │
│ │  ○47  ○12  ○3   ○28  ○9    │ │
│ │  ○5   ○31  ○18  ○7   ○24   │ │
│ │  ○15  ○2   ○40  ○11  ○33   │ │
│ └─────────────────────────────┘ │
│  Next: 1                        │
└─────────────────────────────────┘
```

---

## 🚀 Getting Started

### Yêu cầu hệ thống

| Tool | Version |
|------|---------|
| Node.js | >= 18.x |
| npm | >= 9.x |

### Cài đặt & chạy local

```bash
# 1. Clone repo
git clone https://github.com/your-username/haibazo-game.git
cd haibazo-game

# 2. Cài dependencies
npm install

# 3. Chạy development server
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

### Build production

```bash
npm run build
```

Output nằm tại thư mục `/dist` — sẵn sàng deploy.

---

## 🎯 Luật chơi

1. Nhập số **N Points** (1 – 300) vào ô input
2. Nhấn **Play** để bắt đầu — N node số sẽ xuất hiện ngẫu nhiên trên bảng
3. Click các node **theo thứ tự tăng dần từ 1 → N**
4. Kết quả:
   - ✅ Click đúng thứ tự hết → **ALL CLEARED**
   - ❌ Click sai thứ tự → **GAME OVER**

---

## ✅ Các Case đã implement

| # | Case | Mô tả |
|---|------|--------|
| 1 | **ALL CLEARED** | Click đúng thứ tự 1→N, thông báo chỉ hiện sau khi **tất cả node đã fade xong** |
| 2 | **GAME OVER** | Click sai thứ tự → thông báo ngay lập tức |
| 3 | **Restart** | Có thể restart bất cứ lúc nào, reset toàn bộ trạng thái |
| 4 | **Auto Play** | Bật Auto Play → tự động click từ node hiện tại đến N |
| 5 | **Toggle Auto Play** | Có thể bật/tắt Auto Play trong lúc đang chơi |
| 6 | **Auto Play từ đầu** | Nhập N → bật Auto Play → tự chơi từ 1 đến N |
| + | **Validation** | Points không được để trống, không được là số âm hoặc bằng 0 |

---

## 🏗️ Cấu trúc project

```
haibazo-game/
├── src/
│   ├── App.tsx          # Game logic chính (React hooks)
│   ├── App.css          # Styling
│   ├── linkedList.ts    # DSA: Singly Linked List + generateNodes()
│   ├── main.tsx         # Entry point
│   └── index.css        # Global reset
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🧠 DSA — Singly Linked List

Game sử dụng **danh sách liên kết đơn (Singly Linked List)** để quản lý các node:

```
ListNode(1) → ListNode(7) → ListNode(3) → ListNode(9) → null
```

```typescript
// linkedList.ts
class ListNode {
  data: NodeData;
  next: ListNode | null = null;
}

class LinkedList {
  append(data: NodeData): void   // thêm node vào cuối
  toArray(): NodeData[]          // convert sang array để render
  updateNode(id, updates): void  // cập nhật trạng thái node
  clear(): void
}
```

`generateNodes(n)` tạo ra n node với:
- Số từ 1→n được **xáo trộn ngẫu nhiên** (Fisher-Yates shuffle)
- Vị trí đặt có **collision detection** để tránh node chồng lên nhau

---

## 🛠️ Tech Stack

| Công nghệ | Mục đích |
|-----------|----------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool / Dev server |
| CSS3 | Animation (fade, pulse, pop) |
| Google Fonts | Share Tech Mono + Rajdhani |

---

## 📦 Deploy

### Vercel (khuyến nghị)

```bash
npm install -g vercel
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
# Drag & drop thư mục /dist lên netlify.com/drop
```

### GitHub Pages

```bash
# vite.config.ts: thêm base: '/haibazo-game/'
npm run build
npx gh-pages -d dist
```

---

## 📝 Scripts

```bash
npm run dev      # Chạy dev server (hot reload)
npm run build    # Build production
npm run preview  # Preview bản build
npm run lint     # Kiểm tra code
```

---

## 📄 License

MIT © 2025