# TCMSeek Web Frontend

[English](README.md) | [简体中文](README.zh-CN.md)

TCMSeek Web Frontend 是 TCMSeek 平台的 Vue 3 前端应用。项目面向中医药知识图谱与大模型问答场景，提供知识检索、图谱可视化、智能问答、分子结构搜索、富集分析、PPI Hub 蛋白分析、X2K Analysis 和靶点预测等功能。

## 相关仓库

- 前端仓库：[TCMSeek-Web-Frontend](https://github.com/Able034/TCMSeek-Web-Frontend)
- 后端仓库：[TCMSeek-Backend](https://github.com/Able034/TCMSeek-Backend)

## 功能特性

- 知识图谱可视化：展示中药材、方剂、化合物、基因、疾病、症状、证候、通路、表型等实体关系。
- 中医药智能问答：支持学术模式与通用模式，适用于研究、教学和科普场景。
- 中医药数据浏览：提供中药材、方剂、化合物、基因、医案、通路等实体的列表和详情页。
- 分子结构搜索：集成 ChemDoodle Web Components，支持结构绘制与结构检索。
- 分析工具：包含富集分析、PPI Hub Proteins、X2K Analysis 和 3DSTarPred 靶点预测。
- 国际化：支持中文、英文和中英双语显示模式。

## 技术栈

- Vue 3
- Vite
- Vue Router
- Vue I18n
- Element Plus
- Axios
- ECharts
- D3
- Sigma.js / Graphology
- ChemDoodle Web Components

## 快速开始

### 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

默认情况下，Vite 开发服务会把 `/api` 请求代理到 `http://localhost:8090`。

如需指定后端网关地址：

```bash
VITE_GATEWAY_TARGET=http://localhost:8090
```

### 构建

```bash
npm run build
```

### 本地预览

```bash
npm run preview
```

## 项目结构

```text
Frontend/
|-- public/                 # 浏览器直接加载的静态资源
|-- src/
|   |-- api/                # API 请求模块
|   |-- assets/             # 图片、图标与全局样式
|   |-- components/         # 可复用 Vue 组件
|   |-- composables/        # 可复用组合式函数
|   |-- i18n/               # 多语言文本与 i18n 配置
|   |-- router/             # 路由定义与导航守卫
|   |-- utils/              # 请求、认证、RDKit 等工具函数
|   `-- views/              # 页面级 Vue 组件
|-- index.html
|-- package.json
|-- package-lock.json
`-- vite.config.js
```

## 环境变量

前端应用通过 `/api/web` 调用后端接口。开发环境中，Vite 会把 `/api` 代理到配置的后端网关。

| 变量 | 是否必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `VITE_GATEWAY_TARGET` | 否 | `http://localhost:8090` | Vite 开发代理使用的后端网关地址 |

## 仓库整理说明

此仓库只应提交前端源码和基础项目配置。`.gitignore` 已忽略依赖目录、构建产物、本地日志、环境变量文件、SQL 文件、额外 Markdown 文档、Office 文档、PDF、CSV/TSV 导出文件和压缩包。

公开发布前，请确认 Git 跟踪历史中没有私有数据、账号密钥、数据库导出、生成报告或其他敏感文件。

## 许可证

当前目录暂未包含许可证文件。如需公开开源分发，请先补充 `LICENSE` 文件。
