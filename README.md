# Tonight Drink AI — 今晚喝什么

> 🍸 AI 智能鸡尾酒推荐 | Web PWA + 微信小程序双端

告诉我你有什么酒，AI 帮你找到最适合今晚的那杯。

---

## 📦 项目结构

```
├── src/                    # Next.js Web 应用
│   ├── app/                # App Router 页面
│   ├── components/         # UI 组件
│   └── lib/                # 工具库
├── miniapp/                # 微信小程序 (Taro + React)
│   ├── src/pages/          # 小程序页面
│   ├── src/services/       # API 客户端
│   └── config/             # 构建配置
├── prisma/                 # 数据库模型
└── public/                 # 静态资源（含 PWA 图标）
```

---

## 🚀 快速开始

### Web 端（Next.js PWA）

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npx prisma db push
npx prisma db seed

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY 等

# 4. 启动开发服务器
npm run dev
# 访问 http://localhost:3000

# Demo 账户
# 邮箱：demo@tonightdrink.ai
# 密码：password123
```

### PWA 安装

- 用手机浏览器打开你的站点
- Chrome/Safari 会自动提示「添加到主屏幕」
- 安装后即可像原生 App 一样使用，支持离线缓存

### 微信小程序

```bash
# 1. 进入小程序目录
cd miniapp

# 2. 安装依赖
npm install

# 3. 配置 AppID
# 在 project.config.json 中修改 appid 为你的小程序 AppID

# 4. 启动编译
npm run dev:weapp

# 5. 打开微信开发者工具
# 导入项目，选择 miniapp/dist 目录
```

#### 小程序上线前配置

1. 在 `.env` 中设置 `WECHAT_APPID` 和 `WECHAT_APPSECRET`
2. 修改 `miniapp/src/services/api.ts` 中的 `API_BASE` 为你的后端地址
3. 在微信公众平台配置服务器域名白名单
4. 将 `miniapp/src/assets/` 下的 tab 图标替换为金色选中态的版本

---

## 🎯 核心功能

| 功能 | Web | 小程序 |
|------|-----|--------|
| 浏览 400+ 经典鸡尾酒 | ✅ | ✅（内置 12 款经典） |
| AI 智能推荐 | ✅ GPT-4o-mini | ✅ |
| AI 创意调酒 | ✅ | ✅ |
| 库存管理 | ✅ | ✅ |
| 收藏配方 | ✅ | ✅ |
| 饮用记录 | ✅ | 🚧 |
| 用户登录 | ✅ 邮箱 | ✅ 微信登录 |
| PWA 离线支持 | ✅ | - |
| 移动端底部导航 | ✅ Tab Bar | ✅ Tab Bar |

---

## 🛠 技术栈

### Web 端
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS（暗色主题 + 金色强调）
- **数据库**: SQLite (Prisma ORM)
- **认证**: NextAuth.js v4
- **AI**: OpenAI GPT-4o-mini
- **动画**: Framer Motion
- **PWA**: Service Worker + Web Manifest

### 微信小程序
- **框架**: Taro 4.x (React)
- **语言**: TypeScript
- **样式**: SCSS
- **认证**: 微信一键登录

### 后端 API
- Next.js API Routes
- **双认证**：NextAuth Session（Web）+ Bearer Token（小程序）
- 微信 `code2Session` 登录接口

---

## 📱 移动端特性

- ✅ **PWA**：可安装到手机主屏幕，支持离线访问
- ✅ **底部导航栏**：适配 iOS/Android 安全区
- ✅ **触摸优化**：44px 最小点击区域，按压反馈
- ✅ **暗色主题**：省电的深色背景
- ✅ **响应式布局**：自适应手机/平板/桌面
- ✅ **安全区适配**：`safe-area-inset` 全面屏支持

---

## 🔧 环境变量

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# OpenAI
OPENAI_API_KEY=sk-xxx

# 微信小程序
WECHAT_APPID=wx1234567890
WECHAT_APPSECRET=abcdef123456

# 数据库
DATABASE_URL="file:./dev.db"
```

---

## 📄 许可证

MIT License · 请适量饮酒 · 未满18岁禁止饮酒
