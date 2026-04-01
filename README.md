# ERP 报表系统

> **说明**：当前版本使用 `frontend-admin/src/api/mockData.ts` 提供的 **Mock 模拟数据**，未对接真实后端 API，仅用于演示与开发。

## How to Run

```bash
# 使用 Docker Compose 构建并启动
docker-compose up --build -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

本地开发：
```bash
cd frontend-admin
npm install
npm run dev
```

## Services

| 服务 | 端口 | 说明 |
|------|------|------|
| frontend-admin | 8081 | Vue 报表管理后台 |

## 测试账号

| 用户名 | 密码 | 角色/权限 |
|--------|------|----------|
| admin | admin123 | 管理员：可访问全部报表 |
| user  | user123  | 普通用户：仅可访问「业务流程管理\\系统报表\\BPM系统利用率」 |

## 题目内容
以下是erp系统报表接口返回数据，请用vue搭建一个报表网站：报表目录： [ { "text": "DEMO", "glyph": 60178, "id": "DEMO", "children": [ { "text": "D11.Grid", "glyph": 60178, "id": "DEMO\\D11.Grid", "children": [], "tabs": [ { "text": "BPM系统利用率", "xclass": "YZSoft.report.rpt.Panel", "config": { "path": "DEMO\\D11.Grid\\BPM系统利用率" } } ] } ] }, { "text": "工段冲突汇总表", "glyph": 60178, "id": "工段冲突汇总表", "children": [], "tabs": [ { "text": "工段冲突汇总表", "xclass": "YZSoft.report.rpt.Panel", "config": { "path": "工段冲突汇总表\\工段冲突汇总表" } } ] } ] 报表定义： { "success": true, "name": "BPM系统利用率", "MonthOffset": 0, "MonthDay": 1, "Paging": false, "PageItems": 20, "views": [ { "ViewName": "Grid视图", "ViewType": "Grid" }, { "ViewName": "MSChart视图", "ViewType": "MSChart" }, { "ViewName": "Excel视图", "ViewType": "Excel" } ], "queryParams": [ { "Name": "@Year", "DataType": { "name": "Int32", "fullName": "System.Int32" }, "DisplayName": "", "Description": null, "ParameterUIBindType": "Normal", "DefaultValue": 2025 }, { "Name": "@ProcessName", "DataType": { "name": "String", "fullName": "System.String" }, "DisplayName": null, "Description": null, "ParameterUIBindType": "Hidden", "DefaultValue": null }, { "Name": "@Date1", "DataType": null, "DisplayName": null, "Description": null, "ParameterUIBindType": "StartDate", "DefaultValue": null }, { "Name": "@Date2", "DataType": null, "DisplayName": null, "Description": null, "ParameterUIBindType": "EndDate", "DefaultValue": null } ] } 报表视图： { "reportName": "BPM系统利用率", "columnInfos": [ { "ColumnName": "Month", "DataType": null, "DisplayName": "月份", "LinkType": "None", "LinkTo": null, "ParametersFill": [] }, { "ColumnName": "Approved", "DataType": null, "DisplayName": "核准", "LinkType": "None", "LinkTo": null, "ParametersFill": [] } ], "view": { "ColumnInfos": [ { "ColumnName": "Month", "Width": "200", "Flex": null, "Group": false, "Align": "left", "Visible": true }, { "ColumnName": "Approved", "Width": null, "Flex": "1", "Group": false, "Align": "left", "Visible": true }, { "ColumnName": "Rejected", "Width": null, "Flex": "1", "Group": false, "Align": "left", "Visible": true }, { "ColumnName": "Running", "Width": null, "Flex": "1", "Group": false, "Align": "left", "Visible": true }, { "ColumnName": "Aborted", "Width": null, "Flex": "1", "Group": false, "Align": "left", "Visible": true }, { "ColumnName": "Deleted", "Width": null, "Flex": "1", "Group": false, "Align": "left", "Visible": true }, { "ColumnName": "Total", "Width": null, "Flex": "1", "Group": false, "Align": "left", "Visible": true } ], "ViewType": "Grid", "ViewName": "Grid视图" } } 报表查询返回： { "total": 1, "children": [ { "Month": 1, "Approved": 0, "Rejected": 0, "Running": 0, "Aborted": 0, "Deleted": 0, "Total": 0, "AvgMinutes": 0, "ROWSTAT": 1 } ] }

---

## 项目介绍

这是一个基于 Vue 3 + TypeScript + Element Plus 构建的 ERP 报表管理后台。

### 技术栈

- Vue 3 + Composition API
- TypeScript
- Element Plus UI 组件库
- Vue Router 路由管理
- Pinia 状态管理
- ECharts 图表库
- Vite 构建工具
- Docker + Nginx 部署

### 功能特性

- 📊 树形报表目录导航
- 📈 多视图切换（Grid 表格 / Chart 图表 / Excel 预览）
- 🔍 动态查询参数表单
- 📱 响应式布局设计
- 🎨 统一的视觉风格

### 数据说明（重要）

**本前端目前使用本地 Mock 数据，未连接真实后端 API。**

- 报表目录、报表定义、报表视图及查询结果等数据均来自 **`frontend-admin/src/api/mockData.ts`**。
- 页面上的所有报表数据均为**静态模拟数据**，仅用于功能演示与本地开发，**并非真实接口返回**。
- 若需对接真实 ERP 报表接口，请将 `stores/report.ts` 及相关调用处改为实际 HTTP 请求。

### 项目结构

```
├── README.md                 # 项目文档
├── docker-compose.yml        # Docker 编排配置
├── .gitignore               # Git 忽略文件
└── frontend-admin/          # Vue 管理后台
    ├── Dockerfile           # Docker 构建文件
    ├── nginx.conf           # Nginx 配置
    ├── index.html           # 入口 HTML
    ├── package.json         # 项目依赖
    ├── tsconfig.json        # TypeScript 配置
    ├── tsconfig.node.json   # Node TypeScript 配置
    ├── vite.config.ts       # Vite 配置
    ├── public/              # 静态资源
    │   └── favicon.svg      # 网站图标
    └── src/
        ├── App.vue          # 根组件
        ├── main.ts          # 入口文件
        ├── vite-env.d.ts    # Vite 类型声明
        ├── api/             # API 接口层
        │   └── mockData.ts  # Mock 数据
        ├── components/      # 公共组件
        │   ├── ChartView.vue    # 图表视图
        │   ├── ExcelView.vue    # Excel 预览视图
        │   ├── GridView.vue     # 表格视图
        │   ├── QueryForm.vue    # 查询表单
        │   ├── ReportTree.vue   # 报表目录树
        │   └── ViewTabs.vue     # 视图切换标签
        ├── layouts/         # 布局组件
        │   └── MainLayout.vue   # 主布局
        ├── router/          # 路由配置
        │   └── index.ts     # 路由定义
        ├── stores/          # Pinia 状态管理
        │   └── report.ts    # 报表状态
        ├── styles/          # 全局样式
        │   └── main.css     # 主样式文件
        ├── types/           # TypeScript 类型定义
        │   └── report.ts    # 报表类型
        └── views/           # 页面视图
            ├── HomeView.vue     # 首页
            ├── LoginView.vue    # 登录页
            └── ReportView.vue   # 报表详情页
```
