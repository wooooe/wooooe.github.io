---
title: 'Fork仓库同步与冲突解决'
published: '2026-04-07 23:12'
pinned: false
description: '关于对Fork仓库同步与冲突解决'
#cover: 'https://t.alcy.cc/pc'
tags: ["Github", "blog"]
category: Github
draft: false
---

---

# 🛠️ Fork 仓库同步与冲突解决终极指南

本指南专门用于处理 **Twilight** 主题（或任何基于 Astro 的 Fork 项目）在原作者更新后，如何安全地同步新功能并保留个人定制内容。

---

## 一、 准备工作（仅需执行一次）

在你的本地项目根目录（Git Bash）中执行，建立与原作者仓库的“上游”联系：

```bash
# 将原作者仓库添加为 upstream（上游）
git remote add upstream https://github.com/Spr-Aachen/Twilight.git
```

---

## 二、 常规同步流程（无冲突时执行）

每当看到原作者发布了新版本，按照以下顺序执行命令：

1. **同步网页端更改**（防止本地与 GitHub 网页端不同步）：
   ```bash
   git pull origin main
   ```
2. **抓取上游更新数据**：
   ```bash
   git fetch upstream
   ```
3. **尝试合并更新**：
   ```bash
   git merge upstream/main
   ```

---

## 三、 核心：解决合并冲突（Conflict）

如果执行 `merge` 后提示 **`CONFLICT`**，且分支名变为 **`(main|MERGING)`**，请按以下步骤操作：

### 1. 核心资产备份
在操作前，请确保你本地记事本中存有以下文件的最新副本：
* `twilight.config.yaml`（站点配置）
* 其他你已经更改的文件

### 2. VS Code 手动排雷
打开 VS Code，找到左侧文件树中带有 **红色感叹号 (!)** 的文件：

* **操作要领**：双击打开文件，会看到高亮冲突区（`<<<<<<< HEAD` 与 `>>>>>>>` 之间）。
* **根据需要选择需要的部分**
* **保存确认**：按下 **`Ctrl + S`**。确保文件左侧的红色感叹号消失。

---

## 四、 提交并推送（完成更新）

当所有文件的感叹号都清理干净后，回到 Git Bash 终端执行“胜利三连”：

```bash
# 0. 本地进行测试
pnpm dev

# 1. 将修复后的文件添加到暂存区
git add .

# 2. 提交更改，解除合并状态（引号内文字可自定义）
git commit -m "解决冲突：成功同步上游更新并保留个人定制"

# 3. 将最终代码推送到你的 GitHub 仓库
git push origin main
```

---

## 避坑小贴士

* **网页端的局限性**：GitHub 网页版的 `Sync Fork` 在遇到权限冲突（尤其是跨仓库修改）时经常失效。**本地命令行是解决冲突的唯一稳健方案。**
* **保持频率**：建议每两周同步一次。积压的更新越多，产生复杂冲突的概率就越大。

---
**提示**：执行完上述操作后，你的博客会自动触发 GitHub Actions 进行重新部署。只需等待 2 分钟，即可在你的域名下看到带新功能的博客！