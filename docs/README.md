# Expo Updates Admin 文档

## 文档目录

- [需求文档](./requirements.md) - 完整的功能需求和非功能需求说明

## 快速开始

详细的需求说明请查看 [需求文档](./requirements.md)。

## 核心功能概览

1. **用户认证** - 登录/登出、会话管理
2. **应用管理** - 应用列表、应用详情
3. **热更新管理** - 版本列表、发布更新、全量更新、版本回滚
4. **用户分发** - 用户列表、定向更新、用户版本回滚、用户分组
5. **统计与分析** - 更新统计、操作日志

## 项目结构

本项目是一个基于 Next.js 15 + React 19 的 monorepo 项目，使用 pnpm workspaces + Turbo 管理。

```
expo-updates-admin/
├── apps/
│   └── web/              # Web 应用
├── packages/
│   ├── ui/               # 共享 UI 组件库
│   ├── eslint-config/    # ESLint 配置
│   └── typescript-config/ # TypeScript 配置
└── docs/                  # 项目文档
    ├── README.md          # 本文档
    └── requirements.md    # 需求文档
```

## 相关链接

- [项目 README](../README.md)
- [技术栈规范](../.cursor/rules/tech-stack.mdc)
- [项目结构规范](../.cursor/rules/project-structure.mdc)

