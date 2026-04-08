---
title: '主题深度定制与 Bug 修复'
published: 2026-04-08 16:17
updated: 2026-04-08 16:17
pinned: true
description: '对主题深度定制与 Bug 修复'
#cover: 'https://t.alcy.cc/pc'
tags: ["Github", "blog"]
category: blog
draft: false
---


# Twilight (Astro) 主题深度定制与 Bug 修复指南

本文档记录了对基于 Astro 框架的 Twilight 博客主题进行的一系列深度定制操作，包括功能拓展、UI 优化以及底层时区 Bug 的彻底修复。

---

## 1. 开启 Twikoo 评论系统

**目标：** 在文章底部显示 Twikoo 评论区。
**修改文件：** `twilight.config.yaml`（根目录）

**操作步骤：**
找到 `comment` 配置块，将 `enable` 设置为 `true`，并填入自己的 Twikoo 环境地址。

```yaml
# 评论配置
comment:
  # 启用评论功能
  enable: true
  # Twikoo 评论系统配置
  twikoo:
    # 环境ID
    envId: "[https://你的twikoo环境地址.vercel.app](https://你的twikoo环境地址.vercel.app)"
    lang: "zh-CN"
```

---

## 2. 侧边栏个人资料 (Profile) 定制

**目标：** 将默认的方形头像改为纯圆形，并精简底部统计信息（仅保留访问量，去除访客数）。
**修改文件：** `src/components/widget/Profile.astro`（或对应侧栏文件）

### 2.1 头像改为圆形
找到包含头像 `<ImageWrapper>` 的 `<a>` 标签，修改其 Tailwind 类名：
将 `rounded-xl` 改为 **`rounded-full`**。

```html
<a aria-label="Go to About Page" href={url('/about/')}
   class="group block relative mx-auto mt-1 lg:mx-0 lg:mt-0 mb-3
   max-w-48 lg:max-w-none overflow-hidden rounded-full active:scale-95">
```

### 2.2 精简站点统计信息
在文件底部的 `<script>` 标签内，找到 `generateStatsText` 函数，修改返回值。

```javascript
// 修改前：返回 views 和 visitors
// function generateStatsText(pageViews, visitors, i18n_views, i18n_visitors) {
//     return `${i18n_views} ${pageViews} · ${i18n_visitors} ${visitors}`;
// }

// 修改后：仅返回 views
function generateStatsText(pageViews, visitors, i18n_views, i18n_visitors) {
    return `${i18n_views} ${pageViews}`;
}
```

---

## 3. 彻底修复“最后编辑 8 小时时差”Bug

**背景：** 由于 Markdown 文件时间缺乏时区标识，Astro 默认将其转为 UTC（零时区）时间。浏览器读取时产生 8 小时偏差，导致“距离上次编辑”凭空多出 8 小时。
**修改文件：** `src/pages/posts/[...slug].astro`

**解决方案（釜底抽薪法）：**
在后端生成数据时，使用 `.toISOString()` 强制输出带 `Z`（标准时区标记）的字符串，让浏览器原生处理本地时区，无需在前端“打补丁”减去时间。

### 3.1 修改时间解析逻辑 (约第 38 行)
```javascript
// 修改前：会丢失时区信息
// const lastModified = dayjs(entry.data.updated || entry.data.published)
//     .utc()
//     .format("YYYY-MM-DDTHH:mm:ss");

// 修改后：输出标准 ISO 字符串
dayjs.extend(utc);
const lastModified = dayjs(entry.data.updated || entry.data.published).toISOString();
```

### 3.2 还原底部倒计时脚本 (文件最底部的 `<script>`)
由于源头时区已正确，客户端直接相减即可，无需修改为 `let` 或手动减去毫秒数。

```javascript
function runtime() {
    const lastModifiedElement = document.getElementById('last-modified');
    if (!lastModifiedElement) return;
    
    const startDate = new Date(lastModifiedElement.dataset.lastModified);
    const currentDate = new Date();
    
    // 直接相减，浏览器会自动对齐时区
    const diff = currentDate - startDate;
    const validDiff = diff < 0 ? 0 : diff; // 保底机制

    const seconds = Math.floor(validDiff / 1000);
    // ...后续计算逻辑保持不变
}
```

---

## 4. 版权卡片 (License) 融入“最后编辑时间”

**目标：** 在文章底部的版权协议卡片中，新增一列显示具体的“最后编辑”日期和时间。

### 4.1 传递数据给组件
**修改文件：** `src/pages/posts/[...slug].astro`
找到 `<License />` 组件的调用位置（约 66 行），新增传入 `upDate` 属性。

```astro
{
    postConfig.license.enable && (
        <License
            title={entry.data.title}
            id={entry.id}
            pubDate={entry.data.published}
            upDate={entry.data.updated}    
            author={entry.data.author}
            sourceLink={entry.data.sourceLink}
            // ...其他属性保持不变
        />
    )
}
```

### 4.2 渲染卡片 UI
**修改文件：** `src/components/post/license.astro`

**第一步：接收变量 (文件顶部)**
```astro
---
interface Props {
    title: string;
    id: string;
    pubDate: Date;
    upDate?: Date;    // 新增类型声明
    // ...其他声明
}

// 在解构赋值中加入 upDate
const { title, id, pubDate, upDate, author, sourceLink, licenseName, licenseUrl, postUrl: propPostUrl } = Astro.props;
---
```

**第二步：修改 HTML 结构**
加入 `flex-wrap` 优化移动端排版，并新增区块渲染 `upDate`（若无则退化显示 `pubDate`）。

```astro
<div class="flex flex-wrap gap-6 mt-2">
    <div>
        <div class="transition text-black/30 dark:text-white/30 text-sm">{i18n(I18nKey.author)}</div>
        <div class="transition text-black/75 dark:text-white/75 line-clamp-2">{author || profileConf.name}</div>
    </div>
    <div>
        <div class="transition text-black/30 dark:text-white/30 text-sm">{i18n(I18nKey.publishedAt)}</div>
        <div class="transition text-black/75 dark:text-white/75 line-clamp-2">{formatDateToYYYYMMDD(pubDate)}</div>
    </div>
    
    <div>
        <div class="transition text-black/30 dark:text-white/30 text-sm">最后编辑</div>
        <div class="transition text-black/75 dark:text-white/75 line-clamp-2">
            {formatDateToYYYYMMDD(upDate || pubDate)}
        </div>
    </div>

    <div>
        <div class="transition text-black/30 dark:text-white/30 text-sm">{i18n(I18nKey.license)}</div>
        <a href={licenseName ? (licenseUrl || undefined) : licenseConf.url} target="_blank" class="link text-(--primary) line-clamp-2">{licenseName || licenseConf.name}</a>
    </div>
</div>
```
