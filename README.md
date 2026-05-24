# MarketInsightChat — 用户需求洞察与产品机会分析

基于 **Claude Agent SDK** 的用户需求洞察平台。用户输入产品/服务描述后，系统调用 `insight` 技能执行三段式洞察框架（用户画像 → 情绪洞察 → 产品机会），10分钟内完成传统方法需要数周的深度分析。

## 架构

```
用户浏览器 ←WebSocket→ Express Server ←→ Claude Agent SDK ←→ Insight Skill
                          ↓
                   insight_reports/  (结构化洞察报告)
```

- **后端**: Express + WebSocket + Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`)
- **前端**: React + Tailwind CSS + Vite，三栏布局（洞察报告侧栏 + 对话区 + 执行日志）
- **AI 引擎**: 通过 Skills 系统驱动 `insight` 技能

## 三段式洞察框架

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ 阶段一：用户画像    │ →  │ 阶段二：情绪洞察    │ →  │ 阶段三：产品机会    │
│ 4类潜在用户       │    │ 痛点/痒点/爽点     │    │ P0/P1/P2优先级    │
│ +核心用户判断     │    │ +可直接用的文案     │    │ +可落地的清单      │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

| 阶段 | 核心目标 | 输出成果 |
|------|----------|----------|
| **用户画像识别** | 找到最有价值的目标用户 | 4类具象用户画像 + 核心用户推荐 |
| **情绪动因分析** | 痛点/痒点/爽点三维拆解 | 可直接用于营销文案的情绪洞察 |
| **产品机会转化** | 优先级排序的可落地需求 | P0/P1/P2级产品机会清单 |

## 产出物结构

```
insight_reports/[产品名称]/
├── README.md                  # 概览导航
├── executive_summary.md       # 执行摘要
├── user_personas.md           # 用户画像分析
├── emotional_insights.md      # 情绪动因分析
├── product_opportunities.md   # 产品机会清单
└── full_report.md             # 完整洞察报告
```

## 快速开始

### 1. 环境要求

- Node.js >= 18
- npm >= 9

### 2. 配置环境变量

确认项目根目录的 `.env` 文件：

```env
ANTHROPIC_API_KEY=your-api-key
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
MODEL=deepseek-v4-flash
PORT=3008
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发模式

```bash
npm run dev
```

同时启动 Vite 前端（热更新）和 Express 后端。访问 `http://localhost:5173`。

### 5. 生产构建

```bash
npm run build
npm start
```

访问 `http://localhost:3008`。

## 使用方式

1. **直接描述** — 输入产品/服务描述，如「帮我分析胡辣汤水煎包的用户需求洞察」
2. **快捷模板** — 点击欢迎页的四个模板：
   - 🎯 产品洞察
   - 🍜 餐饮分析
   - 💻 SaaS洞察
   - 📱 消费品洞察
3. **上传资料** — 点击 📎 上传 PDF/Word/TXT/CSV 等参考资料
4. **查看报告** — 左侧「洞察报告」面板实时展示分析结果，点击可预览
5. **执行日志** — 右侧面板显示 AI 调用的工具和执行状态

## 行业适配

| 行业 | 侧重方向 |
|------|----------|
| 餐饮食品 | 生理体验细节、仪式感场景 |
| SaaS/B2B | 决策链角色、ROI量化、风险厌恶 |
| 电商/消费品 | 社交信号、身份投射、痛点文案 |
| 内容/教育 | 知识焦虑、成就感路径、社交货币 |

## 项目结构

```
market-insight-chat/
├── server/
│   ├── index.ts           # Express + WebSocket 服务器
│   ├── agent-client.ts    # Claude Agent SDK 封装
│   ├── message-queue.ts   # 异步消息队列
│   └── logger.ts          # 文件日志
├── src/
│   ├── App.tsx            # 主界面（三栏翡翠绿主题）
│   ├── types.ts           # TypeScript 类型
│   ├── hooks/
│   │   ├── useWebSocket.ts  # WebSocket 连接管理
│   │   └── useFileUpload.ts # 文件上传管理
│   ├── index.css
│   └── main.tsx
├── .claude/skills/insight/  # 洞察技能
├── insight_reports/         # 生成的报告
├── uploads/                 # 上传的文件
└── package.json
```

## 技术栈

- **Claude Agent SDK** — AI Agent 调度和技能系统
- **Express** — HTTP + WebSocket 服务器
- **React 18** — 前端 UI
- **Tailwind CSS 4** — 样式（翡翠绿主题）
- **Vite 6** — 构建工具
- **TypeScript** — 类型安全



## 感谢和参考
https://linux.do/  感谢佬友，

https://github.com/liangdabiao/claudesdk-skill  AI生成claude-agent-sdk 项目
