# 🤖 AI Pet - 虚拟 AI 宠物

一个基于 React + HTML5 Canvas 的交互式虚拟 AI 宠物应用。

## ✨ 特性

- 🎨 Canvas 渲染的可爱宠物形象
- 💬 AI 驱动的对话交互
- 🍖 喂食、玩耍等互动功能
- 📱 响应式设计，支持移动端

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
ai-pet/
├── src/
│   ├── components/      # React 组件
│   │   ├── PetCanvas.tsx    # 宠物画布组件
│   │   └── ChatBox.tsx      # 聊天框组件
│   ├── canvas/          # Canvas 绘制逻辑
│   │   └── PetRenderer.ts   # 宠物渲染器
│   ├── hooks/           # 自定义 Hooks
│   ├── types/           # TypeScript 类型
│   ├── App.tsx          # 主应用
│   └── main.tsx         # 入口文件
├── public/              # 静态资源
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: CSS Modules
- **Canvas**: HTML5 Canvas API

## 📝 开发计划

- [x] 项目初始化
- [ ] 基础 Canvas 宠物渲染
- [ ] 宠物状态系统（饥饿、心情、精力）
- [ ] AI 对话集成
- [ ] 互动功能（喂食、玩耍、抚摸）

---
Made with ❤️ by 小满团队
