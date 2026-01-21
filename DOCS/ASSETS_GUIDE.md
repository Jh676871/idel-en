# 資產清單（Producer 交付用）

本文件用來追蹤專案中所有需要準備的圖片與音效資產（放置於 `public/` 下，路徑以網站根目錄 `/` 為起點）。

## Member Avatars

| 項目 | 說明 |
|---|---|
| 用途 | 拍檔選擇、聊天介面頭像 |
| 建議尺寸 | 400×400px（1:1） |
| 格式 | WebP（`.webp`） |
| 路徑 | `public/assets/images/members/`（對應網址：`/assets/images/members/`） |
| 檔名規則 | `member_[memberId].webp` |
| memberId | `soyeon`, `miyeon`, `minnie`, `yuqi`, `shuhua` |

## Backgrounds

| 項目 | 說明 |
|---|---|
| 用途 | Hero / 全站舞台背景 |
| 建議尺寸 | Desktop：1920×1080px（16:9） / Mobile：1080×1920px（9:16） |
| 格式 | WebP（`.webp`） |
| 路徑 | `public/assets/images/backgrounds/`（對應網址：`/assets/images/backgrounds/`） |
| 檔名 | `bg_desktop.webp`, `bg_mobile.webp` |

## Photocards（Binder）

| 項目 | 說明 |
|---|---|
| 用途 | 收藏系統（寶藏盒 / 抽卡展示） |
| 建議尺寸 | 600×900px（2:3） |
| 格式 | WebP（`.webp`） |
| 路徑 | `public/assets/images/cards/`（對應網址：`/assets/images/cards/`） |
| 檔名規則 | `card_[cardId].webp`（例：`card_soyeon_01.webp`） |

## Icons & Sound Effects

| 類別 | 用途 | 建議格式 | 路徑 | 檔名規則 / 清單 |
|---|---|---|---|---|
| UI Icons（程式內建） | 導覽列、按鈕圖示 | N/A | N/A | 目前使用 `lucide-react`，不需準備檔案 |
| UI Icons（自訂檔案） | 自訂 SVG/PNG 圖示 | SVG / PNG | `public/assets/icons/`（對應網址：`/assets/icons/`） | `icon_[name].svg`（或 `.png`） |
| SFX | 點擊/選擇/抽卡等音效 | MP3（`.mp3`） | `public/assets/audio/sfx/`（對應網址：`/assets/audio/sfx/`） | `click.mp3`, `hover.mp3`, `success.mp3`, `select.mp3`, `gacha_shake.mp3`, `gacha_open.mp3`, `gacha_reveal.mp3` |

