# 汎用グループカレンダー

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com/)
[![Calendar API](https://img.shields.io/badge/Google%20Calendar%20API-34A853?logo=google-calendar&logoColor=white)](https://developers.google.com/calendar/api)

Google Apps Script（GAS）で作成した、**個人利用からGoogle Workspace組織利用まで対応可能**な汎用グループカレンダーアプリケーションです。

## 🌟 特徴

- 📅 **週単位でのカレンダー表示**（7日間）
- 👥 **複数カレンダーの同時表示**（グループ+個人）
- 🏢 **組織階層に基づく自動カレンダー表示**（Google Workspace利用時）
- 📱 **レスポンシブデザイン**（PC・スマホ対応）
- ⚙️ **簡単な設定でカスタマイズ可能**
- 🔒 **セキュアな認証・認可機能**
- ➕ **直感的な予定作成機能**

## 📸 スクリーンショット

![カレンダー表示例](https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Group+Calendar+UI)

## 🚀 クイックスタート

### 1. Google Apps Scriptプロジェクトの作成
```bash
1. https://script.google.com/ にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「グループカレンダー」に変更
```

### 2. 必要なサービスの有効化
Google Apps Scriptエディタで以下のサービスを有効にしてください：

- ✅ **Calendar**（Google Calendar API v3）
- ✅ **AdminDirectory**（組織利用の場合のみ）

### 3. ファイルの配置
- `src/code.gs` → Google Apps Scriptの`code.gs`にコピー
- `src/Index.html` → Google Apps Scriptの`Index.html`にコピー

### 4. 設定のカスタマイズ

#### 🏠 個人利用の場合
```javascript
const CONFIG = {
  USE_GOOGLE_WORKSPACE: false,
  DEFAULT_CALENDARS: [
    // 共有カレンダーがあれば追加
    {
      id: "your-shared-calendar@group.calendar.google.com",
      name: "共有カレンダー"
    }
  ]
};
```

#### 🏢 組織利用の場合
```javascript
const CONFIG = {
  USE_GOOGLE_WORKSPACE: true,
  OU_TO_CALENDAR: {
    "/Sales": [{
      id: "sales@yourcompany.com",
      name: "営業部カレンダー"
    }],
    "/Engineering": [{
      id: "engineering@yourcompany.com",
      name: "エンジニアリング部カレンダー"
    }]
  }
};
```

### 5. Webアプリとして公開
```bash
1. 「デプロイ」→「新しいデプロイ」
2. 種類：「ウェブアプリ」
3. 適切なアクセス権限を設定
4. デプロイURLを取得
```

## 🛠️ 技術スタック

| カテゴリ | 技術 |
|---------|------|
| **フロントエンド** | HTML5, [Tailwind CSS](https://tailwindcss.com/), Vanilla JavaScript |
| **バックエンド** | [Google Apps Script](https://developers.google.com/apps-script) |
| **API** | [Google Calendar API](https://developers.google.com/calendar/api), [Admin Directory API](https://developers.google.com/admin-sdk/directory) |
| **認証** | Google OAuth 2.0 |

## 📖 ドキュメント

| ドキュメント | 説明 |
|-------------|------|
| [セットアップガイド](./docs/setup.md) | 詳細なインストール手順 |
| [トラブルシューティング](./docs/troubleshooting.md) | よくある問題と解決方法 |
| [カスタマイズガイド](./docs/customization.md) | UI/機能のカスタマイズ方法 |

## 🎯 利用シーン

### 💼 ビジネス利用
- 部署間での予定共有
- 会議室の予約状況確認
- プロジェクトスケジュール管理

### 🏠 個人・家族利用
- 家族のスケジュール共有
- 趣味グループの予定管理
- 複数カレンダーの統合表示

### 🏫 教育機関
- 授業スケジュール表示
- 学校行事の共有
- 先生・生徒間の予定調整

## ⚙️ カスタマイズ例

### 週の開始日を月曜日にする
```javascript
WEEK_START_DAY: 1 // 0: 日曜, 1: 月曜
```

### アプリ名を変更する
```javascript
APP_NAME: "あなたの組織カレンダー"
```

### 複数の共有カレンダーを追加
```javascript
DEFAULT_CALENDARS: [
  { id: "events@example.com", name: "イベントカレンダー" },
  { id: "meetings@example.com", name: "会議室カレンダー" }
]
```

## 🔒 セキュリティ機能

- ✅ **Google OAuth 2.0認証**: 安全なログイン
- ✅ **組織ベースアクセス制御**: 部署に応じた表示制限
- ✅ **XSS対策**: HTMLエスケープ処理
- ✅ **最小権限の原則**: 必要最小限の権限のみ要求

## 🏆 ライセンス

このプロジェクトは[MIT License](./LICENSE)の下で公開されています。

---
