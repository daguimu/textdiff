# TextDiff

一个在线文本对比与合并工具（双栏编辑、差异高亮、逐块合并、结果导出）。

## 功能

- 行级 diff（新增 / 删除 / 修改）
- 行内 diff 高亮
- 双向逐块合并（`Accept left` / `Accept right`）
- 一键全量合并（`All Left` / `All Right`）
- 撤销（带编辑分组）
- Git 风格统计（`files changed` / `insertions` / `deletions`）
- 亮色 / 暗色主题
- 复制与下载结果（下载支持 `LF` / `CRLF`）

## 快捷键

- `Ctrl/Cmd + Z`：撤销（仅在编辑区聚焦时生效）
- `F7`：跳到下一个差异（仅在编辑区聚焦时生效）
- `Shift + F7`：跳到上一个差异（仅在编辑区聚焦时生效）

## 本地开发

```bash
npm install
npm run dev
```

## 质量检查

```bash
npm run lint
npm run build
npm run test
```

`npm run test` 使用 Node 内置测试运行器，覆盖关键回归场景（包括 EOF 换行合并）。

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- `diff`（文本差异计算）
