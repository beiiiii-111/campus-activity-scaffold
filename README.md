# campus-activity-tutorial 三端脚手架

校园活动管理平台的三端工程骨架（对应大单元一：工程脚手架搭建，12 学时）。
本仓库只复现"可运行的三端基础 + 统一请求层 + 类型契约 + 字典"，业务功能不在本仓库范围内。

## 目录职责

| 目录 | 端 | 技术栈 | 端口 |
| --- | --- | --- | --- |
| `server/` | 后端接口 | Spring Boot 4.1.2 / Java 21 | 8016 |
| `app/` | 学生端小程序 | uni-app + Vue3 + TypeScript | 5174（H5 预览，仅调试用） |
| `admin/` | 管理后台 | Vite + Vue3 + TypeScript + Element Plus | 5173 |

> 端口为什么这样分：作业要求管理后台跑在 5173，而 uni-app 的 H5 预览默认也抢 5173。
> 后台是必验项、H5 只是调试手段，所以后台占 5173，小程序 H5 让到 5174。

## 启动方式

```bash
# 后端：http://127.0.0.1:8016
cd server && mvn spring-boot:run

# 管理后台：http://127.0.0.1:5173
cd admin && npm install && npm run dev

# 小程序：类型检查（作业检查项）
cd app && npm install && npm run type-check
```

三端都通过 `http://127.0.0.1:8016/api` 访问后端；两个前端各自的 `vite.config.ts` 里配置了 `/api` 代理，
业务代码里只写相对路径 `/api/xxx`，不出现硬编码的后端域名。

## 统一约定

- 响应体固定 `{ code, message, data }`，`code === 0` 为成功，其余按错误码分支处理（详见 `docs/02-接口与请求层约定.md`）。
- 提交信息遵循 Conventional Commits：`<type>(<scope>): <subject>`，`type` 取 `feat/fix/chore/docs/test/refactor`，`scope` 取 `shared/server/app/admin`。
- 时间字段一律用字符串（`yyyy-MM-dd HH:mm:ss`）传，不使用 `Date`，避免时区与序列化差异。
