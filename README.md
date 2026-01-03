# Chat Demo - React + TypeScript + DDD

一个基于领域驱动设计（DDD）的现代化聊天应用，使用 React 19 + TypeScript + Zustand + Tailwind CSS 构建。

## 🚀 功能特性

### 核心功能
- ✅ 实时消息发送和接收
- ✅ 用户身份标识（AI 助手 / 当前用户）
- ✅ 消息状态管理（发送中、已发送、失败）
- ✅ 消息时间显示
- ✅ 自动滚动到最新消息

### 高级功能（加分项）
- ✅ **历史记录分页加载** - 滚动到顶部自动加载更多历史消息
- ✅ **搜索和过滤** - 支持按内容搜索和发送者过滤
- ✅ **日期分组和粘性标题** - 消息按日期分组，日期标题粘性显示
- ✅ **离线重连机制** - 网络断开时自动重连，消息本地缓存
- ✅ **消息撤回/删除** - 支持2分钟内撤回自己发送的消息
- ✅ **草稿自动保存** - 输入框内容自动保存到本地存储
- ✅ **新消息提醒** - 滚动不在底部时显示新消息提醒按钮

## 🛠️ 技术栈

### 前端框架
- **React 19** - 最新的 React 版本
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 现代化构建工具

### 状态管理
- **Zustand** - 轻量级状态管理（替代 Redux/Dva）
- **Zustand Persist** - 持久化中间件
- **Zustand Subscribe With Selector** - 选择器订阅

### 样式设计
- **Tailwind CSS v3** - 实用优先的 CSS 框架
- **PostCSS** - CSS 后处理器
- **Autoprefixer** - CSS 自动添加前缀

### Mock 服务
- **Express.js** - Mock API 服务器
- **Faker.js** - 生成模拟数据
- **CORS** - 跨域支持

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript Compiler** - 类型检查
- **Rolldown** - 快速打包工具

## 📁 项目结构

```
chatDemo/
├── Makefile                 # 构建和启动脚本
├── package.json            # 项目依赖和脚本
├── README.md               # 项目文档
├── tsconfig.*.json         # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
├── eslint.config.js        # ESLint 配置
├── tailwind.config.js     # Tailwind CSS 配置
├── postcss.config.js      # PostCSS 配置
└── src/
    ├── domain/             # 领域层（DDD）
    │   ├── entities/       # 实体
    │   │   └── message/    # 消息实体
    │   ├── repositories/   # 仓储接口
    │   │   └── message-repository/
    │   └── services/       # 领域服务
    │       └── MessageDomainService.ts
    ├── application/        # 应用层（DDD）
    │   ├── services/       # 应用服务
    │   │   ├── ChatService.ts
    │   │   ├── MessageService.ts
    │   │   └── NetworkService.ts
    │   └── stores/         # 状态管理
    │       ├── chat-store.ts
    │       ├── message-store.ts
    │       └── network-store.ts
    ├── infrastructure/     # 基础设施层（DDD）
    │   ├── api/           # API 接口
    │   │   └── ChatApi.ts
    │   ├── repositories/   # 仓储实现
    │   │   └── MessageRepository.ts
    │   └── mock/          # Mock 服务
    │       ├── server.js  # Mock 服务器
    │       └── data/      # Mock 数据
    ├── presentation/      # 表现层（DDD）
    │   ├── components/    # 通用组件
    │   │   ├── input-box/
    │   │   ├── message-actions/
    │   │   ├── message-item/
    │   │   ├── message-list/
    │   │   ├── network-indicator/
    │   │   ├── new-message-alert/
    │   │   └── search-filter/
    │   └── pages/         # 页面组件
    │       └── chat/
    │           └── ChatPage.tsx
    ├── main.tsx           # 应用入口
    ├── App.tsx            # 根组件
    └── vite-env.d.ts      # Vite 类型声明
```

## 🎯 架构设计

### 领域驱动设计（DDD）
项目采用经典的 DDD 三层架构：

1. **领域层（Domain）** - 包含业务实体、仓储接口和领域服务
2. **应用层（Application）** - 包含应用服务、状态管理和业务逻辑
3. **基础设施层（Infrastructure）** - 包含 API 实现、Mock 服务和外部依赖
4. **表现层（Presentation）** - 包含 UI 组件和页面

### 核心实体设计

#### Message 实体
```typescript
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  status: MessageStatus;
  timestamp: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  
  // 业务方法
  canRecall(): boolean;
  recall(): void;
  delete(): void;
}
```

### 状态管理架构

#### Zustand Store 设计
- **chat-store.ts** - 聊天相关状态（连接状态、消息列表）
- **message-store.ts** - 消息相关状态（搜索、过滤、草稿）
- **network-store.ts** - 网络相关状态（在线状态、重连逻辑）

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
# 使用 Makefile（推荐）
make dev

# 或者直接使用 npm
npm run dev
```

这将同时启动：
- 开发服务器：http://localhost:5174
- Mock API 服务：http://localhost:3001

### 构建生产版本
```bash
# 使用 Makefile
make build

# 或者直接使用 npm
npm run build
```

### 运行类型检查
```bash
npm run typecheck
```

### 运行代码检查
```bash
npm run lint
```

## 🔧 Makefile 命令

```makefile
dev      # 启动开发服务器和 Mock 服务
build    # 构建生产版本
lint     # 运行代码检查
typecheck # 运行类型检查
clean    # 清理构建文件
install  # 安装依赖
```

## 📊 性能优化

### 代码分割
- 使用 React.lazy() 进行路由级别的代码分割
- 组件级别的动态导入

### 状态管理优化
- Zustand 的选择器订阅避免不必要的重渲染
- 使用 subscribeWithSelector 中间件优化订阅性能

### UI 渲染优化
- 使用 React.memo 优化组件渲染
- 虚拟滚动支持大量消息列表
- 防抖搜索优化

### 网络优化
- 离线消息队列减少网络请求
- 指数退避重连策略
- 消息分页加载减少初始加载时间

## 🎨 UI/UX 设计

### 设计原则
- **现代化设计** - 使用 Tailwind CSS 实现现代化界面
- **响应式布局** - 适配各种屏幕尺寸
- **微交互动画** - 流畅的过渡效果和用户反馈
- **无障碍访问** - 遵循 WCAG 无障碍指南

### 视觉特性
- 渐变色彩方案
- 圆角卡片设计
- 阴影层次感
- 状态颜色指示

### 交互体验
- 实时状态反馈
- 加载状态指示
- 错误状态处理
- 空状态设计

## 🧪 测试策略

### 测试类型
- **单元测试** - 测试纯函数和业务逻辑
- **集成测试** - 测试组件交互
- **端到端测试** - 测试完整用户流程

### 测试工具
- Vitest - 单元测试框架
- React Testing Library - React 组件测试
- Playwright - 端到端测试

## 🔒 安全考虑

### 数据安全
- 输入验证和清理
- XSS 防护
- CSRF 保护

### 隐私保护
- 本地存储数据加密
- 敏感信息脱敏
- 用户数据最小化

## 📈 监控和分析

### 性能监控
- Web Vitals 指标监控
- 组件渲染性能分析
- 内存使用监控

### 错误追踪
- 错误边界处理
- 错误日志收集
- 用户行为分析

## 🚀 部署指南

### 构建配置
```bash
npm run build
```

### 部署选项
- **静态托管** - Vercel, Netlify, GitHub Pages
- **容器化部署** - Docker + Kubernetes
- **云服务部署** - AWS, Azure, Google Cloud

### 环境变量
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=Chat Demo
VITE_APP_VERSION=1.0.0
```

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码更改
4. 创建 Pull Request

### 代码规范
- 遵循 ESLint 配置
- 使用 TypeScript 严格模式
- 编写清晰的提交信息
- 保持代码简洁（单文件不超过 70 行）

## 📝 更新日志

### v1.0.0 (2024-01-03)
- ✨ 初始版本发布
- ✅ 实现所有核心功能
- ✅ 完成所有高级功能（加分项）
- ✅ 完善的类型定义和错误处理
- ✅ 现代化 UI 设计

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/chatDemo/issues)
- 📖 文档: [项目文档](https://your-username.github.io/chatDemo)

---

**感谢使用 Chat Demo！** 🎉

如果这个项目对您有帮助，请考虑给它一个 ⭐️# chatDemo
