# 黒の猫窝 设计系统 v1.0

> 本文件是网站的权威设计规范，所有前端改动必须遵循。
> 技术栈：原生 HTML + CSS + JavaScript（无构建步骤），部署于 GitHub Pages。
> 相关文档：[AGENTS.md](./AGENTS.md)（工程约定与部署规则）

---

## 1. 设计原则

### 1.1 品牌气质
- **哥特可爱 × 精致衬线**：可爱但不幼稚，有温度但不奢华，一看就是"黒の猫窝"
- **尖角形状语言**：所有圆角恒为 0（`--radius-*` 全部 0px），这是品牌特征，禁止随意加圆角
- **8px 网格**：所有间距、尺寸建立在 8px 网格上
- **点阵棋盘背景**：`body::before` 圆形点阵，12px×12px 网格，透明度按主题微调
- **每主题双色规则**：单色主题（Miku 青 / 蔷薇粉）= 主色单色；双色主题（珊瑚橘 / 深夜蓝 / 墨黑白）= 双色棋盘

### 1.2 通用规则
- 文字永不用纯黑 `#000` / 纯白 `#fff`（用墨色系 / 暖白系）
- 尊重 `prefers-reduced-motion`，动效可全部关闭
- 移动端是"重新排列"而非"缩小"；不隐藏内容
- 不使用 `backdrop-filter: blur()`（长截图渲染伪影）、`contain: paint`、`will-change: transform`（性能问题）

---

## 2. 色彩系统

### 2.1 语义令牌分层

| 层级 | 令牌 | 说明 |
|------|------|------|
| 背景 | `--bg-primary` `--bg-secondary` `--bg-card` `--bg-popover` `--nav-bg` `--bg-card-hover` | 页面/次级/卡片/弹层/导航栏/卡片悬浮 |
| 文字 | `--text-primary` `--text-secondary` `--text-muted` | 正文 / 次级 / 弱化 |
| 强调 | `--accent-primary` `--accent-primary-light` `--accent-pink` `--accent-rose` `--accent-miku` `--accent-miku-light` `--accent-miku-glow` `--accent-tag-bg` | 主色及明暗变体 |
| 氛围 | `--accent-gothic` `--accent-gothic-light` `--accent-blood` `--accent-silver` | 哥特/血色/银灰氛围色 |
| 双色 | `--accent-secondary` `--accent-secondary-glow` `--accent-miku-alt` `--accent-miku-alt-light` | 仅双色主题存在 |
| 边框 | `--border-light` `--border-hover` | 默认 / 悬浮边框 |
| 阴影 | `--shadow-soft` `--shadow-card` `--shadow-hover` | 三级阴影 |

### 2.2 主题色值表（5 主题 × 明暗）

**Miku 青**（默认，单色主题）

| 令牌 | 浅色 | 深色 |
|------|------|------|
| bg-primary / bg-secondary | `#fafcfc` / `#f0f5f5` | `#0a1a1a` / `#0e2020` |
| bg-card / nav-bg | `rgba(255,255,255,.7)` / `rgba(250,252,252,.9)` | `rgba(20,40,38,.6)` / `rgba(10,26,26,.9)` |
| text-primary / secondary / muted | `#2a3a38` / `#5a7a76` / `#8aa8a4` | `#d0e8e4` / `#8ab8b0` / `#5a8a82` |
| accent-primary / light | `#39c5bb` / `#5bbfb8` | `#4dd4cc` / `#6de0d8` |
| accent-pink / rose | `#5bbfb8` / `#8dd8d2` | `#6de0d8` / `#8dd8d2` |
| accent-gothic / light | `#7a9e8a` / `#a0c4b0` | `#8ab8a0` / `#a8d4b8` |
| accent-blood / silver | `#b08080` / `#8a8a8a` | `#c89898` / `#7a746c` |
| border-light / hover | `rgba(57,197,187,.15)` / `.35` | `rgba(57,197,187,.12)` / `rgba(77,212,204,.3)` |

**蔷薇粉**（单色主题）

| 令牌 | 浅色 | 深色 |
|------|------|------|
| bg-primary / bg-secondary | `#fdf8fa` / `#f8f0f3` | `#1a0a10` / `#200e16` |
| text-primary / secondary / muted | `#3a2a2e` / `#7a5a62` / `#aa8a92` | `#e8d0d6` / `#b08a96` / `#806070` |
| accent-primary / light | `#F23172` / `#f5608e` | `#f54888` / `#f870a0` |
| accent-pink / rose | `#f5608e` / `#f8a0b8` | `#f870a0` / `#f8a0b8` |
| accent-gothic / light | `#c44a78` / `#e07098` | `#d05888` / `#e880a8` |
| accent-blood | `#d06060` | `#e07878` |

**珊瑚橘**（双色主题：`#ED6D52` + `#5A98C8`）

| 令牌 | 浅色 | 深色 |
|------|------|------|
| bg-primary / bg-secondary | `#fefcfa` / `#f8f4f0` | `#1a1410` / `#201a14` |
| text-primary / secondary / muted | `#2e2a28` / `#7a6a62` / `#aa9a92` | `#e0d8d0` / `#b0a090` / `#807060` |
| accent-primary / light | `#ED6D52` / `#f29078` | `#f08068` / `#f4a090` |
| accent-secondary | `#5a98c8`（glow `.2`） | `#78b0d8`（glow `.12`） |
| accent-miku / light | `#BADBF2` / `#d0e8f8` | `#c8e0f4` / `#dceaf8` |
| accent-rose | `#f8b8a8` | `#f8c8b8` |
| accent-gothic / light | `#8a9ab8` / `#a8b8d0` | `#a0b0c8` / `#b8c8e0` |
| accent-blood | `#b08070` | `#d89888` |

**深夜蓝**（双色主题：`#001E44` + `#46266E`）

| 令牌 | 浅色 | 深色 |
|------|------|------|
| bg-primary / bg-secondary | `#f5f6fa` / `#eef0f5` | `#0a0a1a` / `#0e0e22` |
| text-primary / secondary / muted | `#1a1a2e` / `#5a5a7a` / `#8a8aaa` | `#d0d0e8` / `#a0a0c8` / `#6a6a8a` |
| accent-primary / light | `#3a5a9a` / `#4a6ab0` | `#4a6ab0` / `#6a8ac8` |
| accent-secondary | `#46266E`（glow `.12`） | `#5a3888`（glow `.15`） |
| accent-miku / light | `#001E44` / `#1a3a6a` | `#1a3a6a` / `#2a5090` |
| accent-rose | `#7a8ac0` | `#8a9ad0` |
| accent-gothic / light | `#6a4a8a` / `#8a6aa8` | `#7a4ea8` / `#9a70c0` |
| accent-blood | `#7a4060` | `#a86888` |
| shadow | 蓝调（`rgba(0,30,68,…)`） | 黑色加深 |

**墨黑白**（双色主题：`#222222` + `#111111`）

| 令牌 | 浅色 | 深色 |
|------|------|------|
| bg-primary / bg-secondary | `#fefefe` / `#f6f6f6` | `#0a0a0a` / `#111111` |
| text-primary / secondary / muted | `#111111` / `#555555` / `#999999` | `#e8e8e8` / `#aaaaaa` / `#777777` |
| accent-primary / light | `#222222` / `#444444` | `#cccccc` / `#dddddd` |
| accent-secondary | `#111111`（glow `.06`） | `#aaaaaa`（glow `.08`） |
| accent-rose | `#666666` | `#bbbbbb` |
| accent-gothic / light | `#555555` / `#777777` | `#aaaaaa` / `#bbbbbb` |
| accent-blood | `#666666` | `#999999` |

### 2.3 配色用法规则
- 比例：主色 60% / 强调色 30% / 点缀色 10%（点缀色永远是点缀）
- 标签双色规则：单数标签用配色 1，双数标签用配色 2（`nth-child(odd/even)`），全部主题统一
- 点阵背景：单色主题用单色棋盘，双色主题（珊瑚橘/深夜蓝）用双色棋盘；透明度浅色 0.06–0.12、深色 0.10–0.12 按主题微调
- 选中高亮 `::selection`：`color-mix(in srgb, var(--accent-primary) 12%, transparent)` 背景 + 继承文字色

### 2.4 弹层背景（`--bg-popover` ★ 必须遵守）
- 定义：`--bg-popover: color-mix(in srgb, var(--bg-primary) 93%, transparent)`，在各主题下自动派生（无需逐主题定义）
- 用途：**需要清晰可读的悬浮层** —— 自定义下拉触发器（`.select-trigger`）、下拉选项列表（`.select-options`）、配色菜单（`.color-scheme-menu`）等
- 规则：弹层背景不透明度恒为 **93%**（允许 7% 透出氛围，但不允许透出底层文字）；卡片（`--bg-card` 半透明质感）与弹层（`--bg-popover` 高不透明度）必须区分，禁止混用
- 弹层内滚动：下拉列表等弹层滚动容器**隐藏滚动条**（`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`），滚轮仍可滚动；按钮/控件一律不使用 `title` 悬浮提示（以 `aria-label` 承担无障碍说明）
- **弹层脱离容器裁剪（★ 必须遵守）**：下拉选项列表展开时用 `position: fixed` 视口定位（portal 模式），不受祖先 `overflow: hidden`（如 `.settings-panel`）裁剪；按触发器下方/上方可用空间自动决定展开方向，`max-height` 取 `min(200px, 可用空间)`；页面滚动或窗口缩放时自动关闭列表
- **fixed 包含块陷阱（★ 必须遵守）**：任何祖先的 `transform`（即使是 `translateY(0) scale(1)` 恒等变换）都会劫持 `position: fixed` 的包含块，导致下拉列表相对祖先偏移。页面容器 `.page.active` 禁止使用 transform（恒用 `transform: none`），页面切换只靠 opacity 过渡；移动端 ≤600px 下拉预留 64px 底部空间避开固定底栏
- 头像描边恒为 `1px`（与卡片一致），悬停时仅变 `border-color` 高亮，禁止加粗描边

---

## 3. 字体系统

### 3.1 字体栈
| 令牌 | 字体栈 | 用途 |
|------|--------|------|
| `--font-serif` | `'Noto Serif SC', 'Georgia', serif` | **默认**，正文/按钮/表单 |
| `--font-display` | `'Noto Serif SC', 'Georgia', serif` | 标题/数字 |
| `--font-sans` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif` | 备用无衬线 |

阅读器可切换字体（本地自托管，FontFace 按需加载，非默认字体）：
| 名称 | 文件 |
|------|------|
| 霞鹜文楷 | `字体/霞鹜文楷/LXGWWenKai-Regular.ttf` |
| MiSans | `字体/MiSans/woff2/MiSans-Regular.woff2` |
| 思源黑体 | `字体/思源黑体/SourceHanSansCN-Regular%231.otf` |
| 朱雀仿宋 | `字体/朱雀仿宋/ZhuqueFangsong-Regular.ttf` |

### 3.2 字号刻度（★ 必须为 4 的倍数，兜底 2 的倍数）

根字号 16px，以下 px = rem × 16：

| Token | px | rem | 用途 | 现状（需改） |
|-------|-----|-----|------|--------------|
| `--text-display-xl` | 48 | 3rem | 站点标题 site-title | `2.8rem`=44.8 ✗ |
| `--text-display-l` | 32 | 2rem | 预留大标题 | — |
| `--text-display-m` | 28 | 1.75rem | 页面标题 page-header h2、统计数字 stat-number | `1.7rem`=27.2 ✗ / `1.8rem`=28.8 ✗ |
| `--text-title-xl` | 24 | 1.5rem | 阅读页标题 reader-title、首页 hero h2 | `1.5rem` ✓ / `1.4rem`=22.4 ✗ |
| `--text-title-m` | 20 | 1.25rem | 区块标题 section-title | `1.3rem`=20.8 ✗ |
| `--text-title-s` | 18 | 1.125rem | 分类名 category-name、文章标题 novel-title、阅读章节标题 | `1.15rem`=18.4 ✗ / `1.05rem`=16.8 ✗ |
| `--text-body` | 16 | 1rem | 正文、按钮、导航 | `1rem` ✓ |
| `--text-body-sm` | 14 | 0.875rem | 次级文字、作者、meta | `0.85–0.9rem` ✗ |
| `--text-caption` | 12 | 0.75rem | 标签、元信息、muted、按钮小字 | `0.7–0.8rem` ✗ |
| `--text-micro` | 10 | 0.625rem | 最小标注（装饰星、角标） | `0.6rem`=9.6 ✗ |

校验：48/32/28/24/20/16 均为 4 的倍数；18/14/12/10 为 2 的倍数（兜底规则允许）。

### 3.3 阅读字号与行高
- 阅读正文默认 `--reader-font-size: 16px`
- 字号滑条：**14–24，步长 1**（阅读字号是用户个人偏好，自由调节，不受设计字号倍数规则约束）
- 行高：正文 `1.8`；阅读默认 `--reader-line-height: 1.9`（滑条 1.5–2.5 步长 0.1，行高为比值，不受倍数约束）
- 阅读排版预设：默认 / 紧凑 / 宽松

### 3.4 字距规则
- 站点标题 `letter-spacing: 10px`；副标题 6px；区块标题 2px；微标签 1px
- **对齐陷阱**：使用 `letter-spacing` 的文字必须用负外边距抵消尾随间距（如 `LOADING` 文字 `letter-spacing: 6px` + `margin-right: -6px`），否则视觉不居中

---

## 4. 间距系统（8px 网格）

| Token | px | 常用场景 |
|-------|-----|----------|
| `--space-xs` | 4 | 标签内边距、图标微距 |
| `--space-sm` | 8 | 紧凑间距、元素间 |
| `--space-md` | 12 | 卡片内边距、区块内 |
| `--space-base` | 16 | 段落间距、卡片 padding |
| `--space-lg` | 20 | 区块标题下方 |
| `--space-xl` | 24 | 区块间距 |
| `--space-2xl` | 32 | 大区块间距 |
| `--space-3xl` | 40 | 页面留白 |
| `--space-4xl` | 48 | 页面顶部/底部留白 |

Gap 刻度：`--gap-compact: 8px` / `--gap-standard: 12px` / `--gap-relaxed: 16px`

**规则**：
- 禁止魔法数字，一律使用 `--space-*` / `--gap-*`
- 区块间距 ≥ 24px；卡片内边距 12–24px；图标与文字间距固定 8px
- 容器宽度：主容器 `1100px`（`.app-container`）、阅读器 `680px`（`.reader-container`）、关于页 `700px`、搜索框 `500px`、弹窗 `360px`，全部 `margin: 0 auto` 居中

---

## 5. 形状与阴影

### 5.1 形状
- **圆角恒为 0**：`--radius-sm/md/lg: 0px`（哥特尖角，品牌语言）
- 表单元素统一 `appearance: none` 去掉浏览器默认圆角
- 装饰边框：强调色描边统一 40px 以上的视觉块，不用过细装饰线

### 5.2 阴影三级（随明暗变化）
| Token | 浅色 | 深色 |
|-------|------|------|
| `--shadow-soft` | `0 2px 12px rgba(0,0,0,.04)` | `0 2px 12px rgba(0,0,0,.3)` |
| `--shadow-card` | `0 1px 4px rgba(0,0,0,.03)` | `0 1px 4px rgba(0,0,0,.2)` |
| `--shadow-hover` | `0 4px 16px rgba(0,0,0,.06)` | `0 4px 16px rgba(0,0,0,.35)` |

深夜蓝主题的阴影带蓝调（`rgba(0,30,68,…)`）。禁止使用 `drop-shadow` 大面积泛光。

### 5.3 边框
- `--border-light` / `--border-hover` 主题化，用于卡片描边、下划线、标签
- 虚线分隔（如时间轴/侧栏 `border-bottom: 1px dashed`）保留为轻量分隔方式

---

## 6. 动效系统

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | 弹入（仅小元素） |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | 默认退场/入场 |
| `--ease-in-out` | `cubic-bezier(0.65,0,0.35,1)` | 双向过渡 |
| `--ease-out-expo` | `cubic-bezier(0.16,1,0.3,1)` | 大幅位移 |
| `--duration-fast` | 150ms | 悬停/按下 |
| `--duration-normal` | 300ms | 默认过渡 |
| `--duration-slow` | 500ms | 页面级过渡 |

**规则**：
- 页面切换：View Transitions 纯淡入淡出（旧页 0.2s 淡出、新页 0.2s 淡入），禁止 translateY/scale 弹跳错位
- 配色切换：View Transitions 0.3s 交叉淡入淡出
- 禁止 bounce/elastic 类过度弹性；装饰星闪烁只允许 `opacity` 动画
- `prefers-reduced-motion: reduce` 时关闭所有动画（见第 9 节）
- 悬停/过渡类一律 `0.3s`（`--duration-normal`），同类型动效时长必须一致，禁止自造 0.2s/0.4s/0.6s
- 滚动显现（`.scroll-reveal`）：`0.5s`（`--duration-slow`）+ `--ease-out`，级联延迟 d1–d5 按 100ms 递增
- 入场编排（hero 头像/内容/标签、分类卡片、小说列表）：统一 `0.5s`（`--duration-slow`）
- 阅读设置滑条：点击预设按钮（默认/紧凑/宽松）时，字号+行距滑条由 rAF 驱动平滑滑动（300ms `easeOutCubic`，`settingsAnimId` 令牌取消机制）；**手动拖动/键盘调整即时生效，不带动画**；点击滑条轨道同样以 300ms `easeOutCubic` 平滑滑动（仅轨道命中时触发，命中滑块本体交给原生拖动）
- 自定义光标：CSS 仅引用 `.cur` 格式（现代浏览器不支持 `.ani`，仅 IE 支持；`.cur` 由 `ani2cur.ps1` 从 ANI 首帧转换，ANI 帧块即完整 ICO/CUR 图像，复制后修补热点字节 10-13）；仅 `@media (hover:hover) and (pointer:fine)` 生效

### 6.1 点击与悬停反馈（缩放统一 ★ 必须遵守）

所有可点元素的反馈缩放只允许使用以下档位，禁止自造数值：

**按压反馈（`:active`，2 档）**

| 档位 | 值 | 适用元素 |
|------|-----|---------|
| 标准控件 | `scale(0.98)` | 按钮、导航按钮、图标钮、标签、选项行、社交链接、返回顶部等常规控件 |
| 大尺寸/通栏 | `scale(0.99)` | 分类卡片、通栏触发器（`.select-trigger`）等宽元素 |

- 按压过渡统一 `transform 0.1s var(--ease-spring-sm)`，使用 `!important` 覆盖元素自身 transform 过渡
- 宽元素（如字体下拉触发器）收缩幅度必须更小（0.99），避免 4% 收缩在通栏尺寸上视觉过重

**悬停反馈（`:hover`，3 档）**

| 档位 | 值 | 适用元素 |
|------|-----|---------|
| 图标圆钮 | `scale(1.06)` | 顶栏主题切换、配色切换、管理面板等圆形小钮 |
| 标签 | `scale(1.05)` | 小说标签 |
| 卡片内媒体 | `scale(1.03)` | 分类卡片封面图（内部图片放大，元素本体不动） |

**规则**：
- 悬停→按压的落差：圆钮档 hover 1.06 → active 0.98（落差 ≤8%），禁止出现 hover 1.1 → active 0.96 这类 14% 大跳变
- **头像悬停 = 分类卡片式突出**：`translateY(-2px)` 上浮 + 边框高亮 + 柔和色晕阴影（`box-shadow: 0 4px 20px var(--accent-miku-glow)`），**禁止 `scale` 放大与静态 `rotate` 倾斜**（与分类卡片 `.category-card:hover` 完全同构）；桌面端（`hover: fine`）首页头像叠加分类卡片的鼠标倾斜效果（`perspective(600px)` + `rotateX/rotateY` ±3deg，JS `initAvatarTilt()` 实现，`mouseleave` 清除内联 transform 回弹），移动端不启用
- 装饰性动画（加载星闪烁等）不受本表约束

---

## 7. 图标系统（★ 核心）

### 7.1 图标库选型
- **Google Material Symbols**（Apache 2.0 协议）
- 变体：**Outlined**（默认）；视觉参数统一：`weight: 400`、`fill: 0`、`optical size: 24`
- Material 图标是 **fill 型**，取色用 `fill: currentColor`（随主题色变化），不用 stroke
- 来源：官方 SVG 自托管（Google Material Symbols 库 / GitHub google/material-design-icons）
- **图标浏览与下载**：
  - 官方图标浏览器（按名称搜索、选变体/字重、直接下载 SVG）：https://fonts.google.com/icons
  - Material Symbols 官方文档（Outlined/Rounded/Sharp 变体与 fill/weight/grade/optical size 可变轴说明）：https://developers.google.com/fonts/docs/material_symbols
  - Material Design 图标设计规范页：https://m3.material.io/styles/icons/overview
  - GitHub 源码仓库（全部图标 SVG，可打包自托管）：https://github.com/google/material-design-icons

### 7.2 硬性规则（必须遵守）
1. 同一产品只能使用同一套功能图标，禁止混用其他图标库
2. 禁止使用 Emoji 作为功能图标
3. 禁止使用 Unicode 字符代替图标（**例外**：品牌装饰符号——随机按钮 ♫、加载动画星字符 ⋆˚✩☽——不属于功能图标，不受此限）
4. 禁止临时手写/生成 SVG 图标——只能使用库内官方 SVG 路径
5. 图标尺寸、线宽、间距必须统一
6. 找不到精确图标时，选择同库**近义图标**（如表 7.4 的 `˚`→`radio_button_unchecked`）

### 7.3 尺寸与间距令牌
| Token | 尺寸 | 场景 |
|-------|------|------|
| `--icon-sm` | 16px | 行内文字图标 |
| `--icon-md` | 20px | 按钮/工具栏默认 |
| `--icon-lg` | 24px | 大场景/空状态 |

- 图标与文字间距固定 8px（`--gap-compact`）
- 图标按钮触控区 ≥ 40×40px，必须有 `aria-label`/`title`

### 7.4 图标映射表（现状 → Material Symbols）

| 现状 | 用途 | Material 名 |
|------|------|-------------|
| `⚙` | 管理面板 | `settings` |
| `☾` | 深色模式 | `dark_mode`（新月） |
| `☀` | 浅色模式 | `light_mode`（太阳） |
| `♫` | 随机文章 | `shuffle` |
| `↑` | 返回顶部 | `arrow_upward` |
| `←` | 返回 / 上一章 | `arrow_back` |
| `→` | 下一章 / 列表箭头 | `arrow_forward` |
| `↓` / `↑` | 排序切换 | `arrow_downward` / `arrow_upward`（或 `swap_vert`） |
| `✕` | 同步失败 | `close` |
| `○` | 未同步 | `radio_button_unchecked` |
| `◎` | 同步中 | `sync` |
| `●` | 已同步 | `check_circle` |
| `✦` | 站点标题装饰星 | `auto_awesome`（四角星，与 ✦ 同形） |
| `☽` | 加载页月亮 | `dark_mode`（或 `nights_stay`） |
| `✩` / `⋆` | 加载页星星 | `star`（小尺寸） |
| `˚` | 加载页圆环装饰 | `radio_button_unchecked`（空心圆，近义） |
| `｡` | 加载页圆点 | `circle`（实心小点，近义） |
| `≡左/中/右` | 对齐按钮 | `format_align_left` / `format_align_center` / `format_align_right` |
| select 箭头（临时 data-URI SVG） | 下拉指示 | `expand_more` |
| `...`（加载省略号） | loading 动效 | `more_horiz`（可选） |

**例外（品牌标识，不属于功能图标，允许保留）**：
- 社交链接 favicon（bilibili / GitHub / QQ空间 / 微博 / 小红书 / X）——品牌 logo，统一 16px
- 友链文字标记（LOF / AO3 / 晋 / Wiki）——站点品牌文字标

### 7.5 落地方式（后续实施）
1. 官方 Material Symbols SVG 自托管至 `icons/` 目录
2. 提供 `icon(name)` 帮助函数（返回带 `fill: currentColor` 的 `<svg>`），HTML 与 JS 均通过它渲染
3. 加载页装饰星替换后，动画由文字 twinkle 改为 SVG `opacity/scale` 动画，保持现有对称布局
4. **deploy.ps1 白名单必须加入 `icons/**`**（当前只推送 index.html/app.js/style.css/data.json，不扩展则图标不会上线）

---

## 8. 组件规范

### 8.1 工具栏（`.top-toolbar`）
顺序固定：配色切换按钮组 → ⚙（管理）→ ☾（主题）。图标按钮 20px（`--icon-md`），触控区 ≥40px。移动端 ≤600px 滚动隐藏（`transform: translateY`）。

### 8.2 导航栏（`.nav-bar`）
- 桌面端 `position: relative`，移动端 ≤600px `position: fixed` 底部
- `justify-content: center` 居中；每个按钮等宽 `5rem`（保证 ♫ 按钮严格居中）
- 悬停/激活：下划线从中间展开至 80%，用 `--accent-primary`
- 顺序：首页 → 时间轴 → ♫（随机文章）→ 友链 → 关于

### 8.3 卡片族
| 卡片 | 结构 | 规范 |
|------|------|------|
| 分类卡片 `.category-card` | 封面图 + 分类名 + 描述 + 数量 | 封面 3rem 装饰数字角标 |
| 文章条目 `.novel-item` | 编号框 + 标题 + 作者 + 标签 + meta + 箭头 | 编号框 36×36px、标签双色规则 |
| 友链卡片 `.link-card` | 图标 + 标题 + 描述 | 图标区统一尺寸 |
| 兴趣卡片 `.interest-card` | 标签列表 | 标签 12px（`--text-caption`） |

### 8.4 表单
- 全局 `appearance: none` 去默认圆角，`font-family: var(--font-serif)`
- 下拉框使用自定义组件 `.custom-select`（`initCustomSelect(selectEl)`）：触发按钮 + `expand_more` 图标 + 选项列表；原生 `select` 保留在 DOM（`.native-hidden`）维护值与语义；支持键盘导航（↑/↓/Enter/Esc）与 aria；选项变化通过 `MutationObserver` 自动重绘
- 输入框/文本域：1px `--border-light` 描边、`--bg-primary` 背景

### 8.5 阅读器
- 容器 680px 居中；阅读正文 16px 默认，字号 14–24 步长 1
- 章节阅读顺序：前言 → 章节标题 → 正文
- 设置面板：字体（默认=思源宋体）、字号、行距、排版预设（默认/紧凑/宽松）；字体顺序：思源宋体 → 霞鹜文楷 → 思源黑体 → 朱雀仿宋 → MiSans
- 底部导航：`← 上一章` / `返回列表` / `下一章 →`

### 8.6 其他组件
- **Toast**：`top:50%;left:50%` 居中 + `toastFadeIn` 动画（keyframes 内无 transform）
- **加载屏**：对称星星行 + `LOADING`（letter-spacing 尾随补偿）+ 三圆点省略号
- **滚动条**：6px 宽，thumb 用 `--accent-primary`
- **返回顶部**：`transition: visibility .3s ease`，滚动显示
- **头像**：`.hero-avatar` 悬停 `translateY(-2px)` + 主色边框 + 发光阴影（禁 `scale`/静态 `rotate`），桌面端叠加鼠标倾斜（同分类卡片 `initAvatarTilt()`）；入场动画结束后需清除内联 transform（防内联样式覆盖 CSS）
- **搜索空态**：`--text-body-sm` 字号 + `text-align: center` 居中
- **管理面板**：桌面 800px / 移动全宽，背景不透明，7 个标签页（站点设置/分类管理/添加文章/编辑文章/关于页/时间轴/友链），用户可见文案统一用"文章"

---

## 9. 无障碍与响应式

### 9.1 断点（现状）
| 断点 | 行为 |
|------|------|
| ≤768px | 两栏 → 单栏 |
| ≤600px | 底部固定导航、工具栏滚动隐藏、`body { padding-bottom: 56px }` 防遮挡 |
| ≤480px | 字号微缩 |
| `prefers-reduced-motion: reduce` | 关闭全部动画 |
| `@media print` | 打印样式 |

### 9.2 无障碍清单
- `focus-visible`：`outline: 2px solid var(--accent-primary)` + `outline-offset: 2px`
- 图标按钮必须有 `aria-label`/`title`
- 文本对比度：正文/次级 ≥ 4.5:1；`--text-muted` 需抽检（浅色主题下最弱）
- 触控目标 ≥ 40×40px
- 键盘可操作：所有交互元素为原生 button/a/input

---

## 10. 实施路线图

| 阶段 | 内容 | 涉及文件 | 状态 |
|------|------|----------|------|
| 1. 字号归一 | 按第 3.2 节映射表替换字号（目标px ÷ 16 = rem）；阅读滑条改 14–24 步长 1 | `style.css`、`index.html` | ✅ 已完成 |
| 2. 图标落地 | Material Symbols Outlined（weight 400 / optical 24）图标路径内联至 `ICON_PATHS` + `icon(name)` 帮助函数；替换 index.html + app.js 全部功能图标；select 箭头换 `expand_more`；字号/行距滑条改用 Material 风格 | `index.html`、`app.js`、`style.css` | ✅ 已完成 |
| 3. 自定义下拉 | `initCustomSelect()` 替换 3 处原生 select（章节/字体/管理分类），悬停底色主题化，支持键盘与 aria | `app.js`、`style.css` | ✅ 已完成 |
| 4. 交互细节 | 头像悬停动效、搜索空态居中、字体顺序（思源宋体→霞鹜文楷→思源黑体→朱雀仿宋→MiSans）、阅读设置持久化同步下拉框 | `style.css`、`index.html`、`app.js` | ✅ 已完成 |
| 5. 部署扩展 | deploy 白名单确认（`index.html`/`app.js`/`style.css`/`data.json` 均在部署范围；无新增资源目录） | `deploy2.ps1` | 无需改动 |
| 6. 回归验证 | 5 主题 × 明暗、移动断点、阅读器（自定义下拉）、管理面板、Giscus 评论区 | 浏览器验证 | 进行中 |

---

*文档版本 v1.0 · 2026-09-06 · 与 AGENTS.md 配套使用*
