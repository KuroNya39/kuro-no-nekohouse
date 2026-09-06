# AGENTS.md - 黒の猫窝 (Kuro no Nekohouse)

## Project Overview

同人文章收藏站，纯前端静态网站，部署在 GitHub Pages。

- **Live URL**: https://kuronya39.github.io/kuro-no-nekohouse/
- **Repository**: https://github.com/KuroNya39/kuro-no-nekohouse
- **Branch**: `main`
- **Tech Stack**: Vanilla HTML + CSS + JavaScript (no framework, no build step)

## File Structure

```
├── index.html          # Single-page app shell (HTML structure)
├── app.js              # All application logic (~118KB)
├── style.css           # All styles including 5 theme definitions (~73KB)
├── data.json           # Site content data (novels, categories, about, timeline, links)
├── DESIGN_SYSTEM.md    # 设计系统规范（动效时长、图标、对齐等权威定义）
├── images/             # All image assets
│   ├── favicon.jpg     # Site icon (cute black cat side profile, square, no rounded corners)
│   ├── avatar.png      # Site avatar image
│   ├── miku.jpg        # Miku category cover
│   ├── izumileo.jpg    # Enstars category cover
│   ├── reiritsu.jpg    # Reiritsu category cover
│   ├── vol6.jpg        # Novel cover image
│   ├── vol13.jpg       # Novel cover image
│   └── vol15.jpg       # Novel cover image
├── cursors/            # Custom cursor files (.cur primary + .ani source) - Windows-style anime cursors
│   ├── miku/           # Light theme cursors (Arrow.cur, Link.cur, IBeam.cur, Wait.cur, Busy.cur)
│   ├── snowmiku/       # Dark theme cursors (Arrow.cur, Link.cur, Wait.cur, Busy.cur)
│   ├── MikuDesktopAni/ # Original .ani sources (Miku)
│   ├── SnowMikuCursor/ # Original .ani sources (Snow Miku)
│   └── backup/         # Unused original system cursor pack (not referenced by CSS)
├── 字体/               # Reader font files (on-demand loading via FontFace API)
│   ├── MiSans/woff2/MiSans-Regular.woff2
│   ├── 思源黑体/SourceHanSansCN-Regular#1.otf
│   ├── 朱雀仿宋/ZhuqueFangsong-Regular.ttf
│   └── 霞鹜文楷/LXGWWenKai-Regular.ttf
└── 备份文件（勿删）/    # DO NOT DELETE OR MODIFY - project backups
```

## Architecture

Single-page application using hash-based routing (`#/reader/...`, `#/about`, `#/guestbook`, etc.). All pages are rendered dynamically by JavaScript into the DOM.

### Data Flow

- **Read**: `data.json` is fetched from `raw.githubusercontent.com` (no auth needed, no rate limit)
- **Write**: Admin panel uses GitHub Contents API with a user-provided token stored in `localStorage`
- **Font loading**: FontFace API with on-demand loading (files downloaded only when user selects a font, then cached by browser)

### Routing (Hash-based)

- `#/` or empty → Homepage
- `#/category/{catId}` → Category page (novel list)
- `#/reader/{catId}/{novelIdx}/{chapterIdx}` → Reader page
- `#/about` → About page
- `#/guestbook` → Guestbook / message board
- `#/timeline` → Timeline page
- `#/links` → Friend links page

### Color Schemes (5 themes, each with light + dark mode)

| ID | Name | Style | Dot indicator |
|----|------|-------|---------------|
| `miku` | Miku 青 | Single-color teal (`#39c5bb`) | Solid dot |
| `mono` | 墨黑白 | Pure black + white (`#222`) | Gradient `#111`/`#eee` |
| `rose` | 蔷薇粉 | Single-color pink (`#F23172`) | Solid dot |
| `coral` | 珊瑚橘 | Dual-color (`#ED6D52` + `#BADBF2`) | 135deg split |
| `night` | 深夜蓝 | Dual-color (`#001E44` + `#46266E`) | 135deg split |

Theme persistence: `localStorage` key `colorScheme`, dark mode key `theme`.

### Admin Panel

Accessible via the ⚙ button in the top toolbar. Requires GitHub token input. Contains 7 tabs:
- 站点设置, 分类管理, 添加文章, 编辑文章, 关于页, 时间轴, 友链

All user-facing text in the admin panel uses "文章" (not "小说").

### Comments

Giscus comments (GitHub Discussions based) on reader pages. Config:
- `data-mapping="url"` (full URL including hash)
- `data-theme="preferred_color_scheme"`

### External Dependencies

- Google Fonts: Noto Serif SC, Noto Sans SC, LXGW WenKai (preloaded in index.html)
- Giscus: Loaded via external script on reader pages
- Font files: Hosted locally in `字体/` directory, loaded on-demand via FontFace API

## Critical Rules for Modifications

### Deployment

- Deploy script uses GitHub Git Trees API with font SHA caching (never re-uploads large font files)
- Token: stored in deploy script, Classic token with `repo` scope
- Font files (>5MB) must use Contents API with `-TimeoutSec 600` (Git Trees blob API has implicit timeout)
- Deploy script must whitelist `.json` extension to prevent `data.json` exclusion
- **Protected files**: `data.json`, `index.html`, `app.js`, `style.css` must always be in deploy scope

### CSS / Theming

- All 5 themes use CSS custom properties under `[data-color-scheme="xxx"]`
- Dark mode: `[data-theme="dark"]` overrides
- Background: circular dot chessboard pattern via `body::before` with `background-position: 0 0, 12px 12px`
- Dot pattern opacity varies by theme (Miku/Coral light: 0.12, Night dark: 0.12 with brighter colors, others: 0.06 light / 0.10 dark)
- Dual-color themes (Coral, Night) use two-color chessboard; single-color themes use monochrome
- Tag styles: monochrome background for single-color themes; alternating colors for dual-color themes
- Navigation bar: `position: sticky` after footer (desktop: `relative`, mobile <=600px: `fixed` bottom)
- Form elements use `font-family: var(--font-serif)`
- Mobile: `appearance: none` on inputs to remove default browser rounded corners

### JavaScript Conventions

- Hash-based SPA routing with `popstate` event handling
- `showPage()` uses `behavior: 'auto'` for back navigation (popstate), `'smooth'` for normal navigation
- `history.scrollRestoration = 'manual'` to disable browser auto scroll restoration
- Page transitions: 200ms opacity fade-in/out (excluded on popstate)
- Font loading: `loadFontFace(name, url)` with `loadedFonts` cache; must also call on page revisit when restoring from `localStorage`
- Toast notifications: centered via `top:50%;left:50%;transform:translate(-50%,-50%)` with `toastFadeIn` animation (no transform in keyframes)
- All `prompt()` / `alert()` replaced with inline inputs (mobile browser compatibility)
- Management panel uses `font-family: var(--font-serif)` for form elements
- `setColorScheme()` saves to `localStorage` and updates `data-color-scheme` attribute on `<html>`

### Content / UX

- Sort label "默认" displays as "按首字母" in UI
- Novels without multiple chapters display "1 章" (not "0 章")
- Chapter reading order: 前言 → chapter title → body text
- Meta info format: `2026-06-14 · 26454 字 · 约 88 分钟 · 3 章`
- Reading speed estimate: ~400 Chinese characters per minute
- Empty tags (default "标签" value) must be filtered out
- Share links use `#/reader/catId/novelIdx/chapterIdx` format
- Social links implement XSS protection via protocol whitelisting
- Back button from reader → category page (not previous chapter via `history.back()`)
- Management panel width: 800px desktop, full-width mobile
- Management panel background: opaque (not transparent) for readability
- Top toolbar order: 配色按钮组 → ⚙ → ☾
- Mobile: `body { padding-bottom: 56px }` to prevent bottom nav overlap
- Back-to-top button: `transition: visibility 0.3s ease`
- `overflow-x: clip` instead of `overflow-x: hidden` to eliminate screenshot shadow
- Custom cursor: only on devices with `hover` support (`@media (hover: hover) and (pointer: fine)`)
- Scroll hiding for top-toolbar and nav-bar: only on mobile (<=600px)
- Bottom nav uses `transform: translateY` for show/hide animation
- Reader settings (font, size, line height) persist when switching novels

### Known Pitfalls

- `file://` protocol blocks Giscus and GitHub API; use `npx http-server -p 8768 -c-1` for local preview
- `backdrop-filter: blur()` causes rendering artifacts in long screenshots — do not use
- `contain: paint` and `will-change: transform` on body/toolbar cause performance issues — do not use
- Unconditional `pushState` in `popstate` listener causes infinite history loops — only push when `e.state` is null
- Font files with `#` in filename: use `%23` in URL path (e.g., `SourceHanSansCN-Regular%231.otf`)
- Large font uploads via Git Trees blob API fail with timeout; use Contents API with explicit 600s timeout
- PowerShell 5 does not have `System.Net.Http.HttpClient`; use `Invoke-RestMethod` with `-TimeoutSec`
- PowerShell string keys like `'key' = 'value'` are invalid in hashtable literals
- Chinese characters in PowerShell paths may encoding-mismatch; use `[string]([char]0xXXXX + [char]0xXXXX)` concatenation
- `.ani` cursor files only work in IE — modern browsers need `.cur`; convert via `ani2cur.ps1` (ANI frame chunk is a complete ICO/CUR image: copy chunk as-is, patch hotspot at bytes 10-13)
- Slider animation: preset clicks use rAF loop (300ms easeOutCubic, `settingsAnimId` token); manual drag cancels via `input` listener — programmatic `.value` set does not fire `input`, so no conflict
- `GITHUB_CONFIG` must be declared at top of script to avoid temporal dead zone `ReferenceError`

## Common Tasks

### Local Preview
```bash
npx http-server -p 8768 -c-1
```
Open http://localhost:8768

### Deploy
```bash
powershell -ExecutionPolicy Bypass -File deploy2.ps1
```
Deploy script is maintained in the TRAE work directory (not in the project folder). It uses Git Trees API with font SHA caching.

### Add a New Color Scheme
1. Add `[data-color-scheme="xxx"]` block in `style.css` (after existing scheme blocks, before `/* Text selection */`)
2. Add `[data-color-scheme="xxx"][data-theme="dark"]` block for dark mode
3. Add `<button>` in `index.html` color scheme menu (inside `#colorSchemeMenu`)
4. If dot pattern visibility needs adjustment, add opacity override in the dot section of `style.css`
5. Deploy

### Add Font Files
1. Place font file in `字体/{fontName}/` directory
2. Add entry to `fontMap` in `setReaderFont()` function in `app.js`
3. Add matching entry to `restoreFontMap` in `showNovel()` function in `app.js`
4. Deploy (deploy script auto-caches existing font SHAs, new files will be uploaded as blobs)