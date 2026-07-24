---
name: PinPrompt v7
register: product
status: active
reference: PinPrompt_拼好词_v7.html
---

# 1. Intent
Reproduce the v7 PinPrompt prototype faithfully inside the existing React product. The public experience uses a horizontal sticky header and editorial learning pages. Logged-in users receive a learning dashboard while retaining favorites, legacy prompt data, and existing account behavior.

# 2. Information Architecture
- Top navigation: 首页 / 系统课程 / 实战教程 / 工具指南 / 提示词库
- Primary action: 开始学习
- Public home: immersive hero, tool ticker, value explanation, featured courses, learning method, work gallery, community, final CTA
- Content lists: filter controls followed by v7-style sticky-note cards
- Detail pages: editorial content with outcome, steps, practice, common errors, and copy/favorite actions
- Logged-in home: 我的学习工作台 with progress, recommendations, tools, cases, and saved prompts

# 3. Visual Language
- Page background: warm dotted paper, `#f5f1e8`
- Dot color: `#e8e0d0`, 20px repeat
- Text: `#2d3748`; body `#5b5348`; muted `#8a7a63`
- Accent: PinPrompt pink `#e91e63`, dark pink `#c2185b`
- Sticky notes: mint `#c8e6c9`, sakura `#f8bbd9`, lemon `#fff59d`
- Header: translucent warm white with blur and subtle bottom border
- Type: Noto Sans SC/system sans for interface; Space Grotesk-style fallback for English labels; Kalam-style fallback for handwritten labels
- Shadows are soft and shallow. Note cards may rotate subtly but text remains level and readable.
- Hero uses the exact v7 photographic background with a dark readability overlay.

# 4. Components
- Brand lockup: three stacked note sheets, PinPrompt wordmark, short subtitle
- Header search: compact rounded field centered in desktop header
- Navigation: text links with pink active state
- Hero: full-width image, bottom-left content, two actions
- Course cards: photographic cover with warm white body
- Tutorial/template cards: colored sticky notes with pin detail, badges, and explicit action
- Filters: rounded pills and compact select controls
- Dashboard: editorial bands and useful progress modules, not a sidebar-heavy admin surface

# 5. Motion
- Hero background drifts very slowly at low amplitude.
- Sections reveal with short opacity and vertical movement.
- Cards lift 4px on hover and deepen their shadow.
- Tool ticker scrolls continuously and pauses on hover.
- All motion is disabled when `prefers-reduced-motion: reduce` is set.

# 6. Responsive Behavior
- Desktop content max width: 1200px with 20px side gutters.
- Header wraps search and navigation without clipping.
- Course and tutorial grids collapse from 3/4 columns to 2 and then 1.
- Hero remains image-led, with reduced height and type scale on mobile.
- Filters become horizontally scrollable or stacked.
- Detail actions and login forms become full-width on narrow screens.
