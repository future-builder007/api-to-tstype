# TypeQuick Converter

> 🚀 将 API 响应自动转换为 TypeScript 类型定义的智能工具

[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3+-38B2AC.svg)](https://tailwindcss.com/)

## ✨ 功能特性

- 🔄 **多种 HTTP 方法支持** - 支持 GET、POST、PUT、PATCH、DELETE 请求
- 🔧 **自定义请求头** - 灵活添加 Authorization、Content-Type 等请求头
- 🤖 **智能类型推断** - 自动分析 API 响应结构，生成准确的 TypeScript 接口
- 📋 **一键复制/导出** - 支持复制到剪贴板或下载为 .ts 文件
- 🎨 **现代化 UI** - 基于 Tailwind CSS 的精美响应式界面
- 🌐 **丰富示例** - 内置多种公开 API 示例，快速上手

## 🖥️ 界面预览

TypeQuick Converter 提供直观的用户界面：
- 输入 API URL 和选择 HTTP 方法
- 配置自定义请求头（可选）
- 一键生成 TypeScript 类型定义
- 支持复制或下载生成的代码

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

## 📖 使用指南

### 基础使用

1. **输入 API URL**：在输入框中输入你要分析的 API 端点
2. **选择 HTTP 方法**：点击相应的方法按钮（GET/POST/PUT/PATCH/DELETE）
3. **配置请求头**（可选）：点击"高级设置"添加自定义请求头
4. **生成类型**：点击"生成 TypeScript 类型"按钮
5. **导出使用**：复制生成的代码或下载为 .ts 文件

### 示例 API

应用内置了多种示例 API，根据选择的 HTTP 方法显示相应示例：

- **GET**: JSONPlaceholder、GitHub API、DummyJSON 等
- **POST**: 创建用户、发布文章等
- **PUT**: 更新用户信息、修改文章等
- **PATCH**: 部分更新操作
- **DELETE**: 删除资源操作

### 自定义请求头

支持添加常用请求头：
- `Authorization: Bearer <token>`
- `Content-Type: application/json`
- `X-API-Key: <your-api-key>`
- 其他自定义头部

## 🛠️ 技术栈

- **React 19** - 现代化前端框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide React** - 精美的图标库

## 📁 项目结构

```
src/
├── components/
│   └── TypeQuickConverter.tsx    # 主组件
├── services/
│   └── typeConverter.ts          # 类型转换服务
├── types/
│   └── index.ts                  # TypeScript 类型定义
├── App.tsx                       # 应用入口
└── index.tsx                     # React 入口
```

## 🔧 开发说明

### 核心功能

- **API 请求处理**: 支持多种 HTTP 方法和自定义请求头
- **类型推断算法**: 智能分析 JSON 结构，生成嵌套接口定义
- **代码生成**: 输出格式化的 TypeScript 接口代码

### 扩展开发

如需添加新功能：

1. 修改 `types/index.ts` 添加新的类型定义
2. 在 `services/typeConverter.ts` 中实现业务逻辑
3. 更新 `TypeQuickConverter.tsx` 组件界面

## 📝 脚本命令

| 命令 | 描述 |
|------|------|
| `npm start` | 启动开发服务器 |
| `npm test` | 运行测试 |
| `npm run build` | 构建生产版本 |
| `npm run eject` | 弹出 CRA 配置（不可逆） |

## 🤝 贡献指南

欢迎提交 Issues 和 Pull Requests！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

🎯 **让 API 类型定义变得简单！** - Powered by TypeQuick