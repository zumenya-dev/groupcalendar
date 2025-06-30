# 汎用グループカレンダー

Google Apps Script（GAS）で作成した、個人利用からGoogle Workspace組織利用まで対応可能な汎用グループカレンダーアプリケーションです。

## 🎯 特徴

- **週単位でのカレンダー表示**（7日間）
- **複数カレンダーの同時表示**（グループ+個人）
- **組織階層に基づく自動カレンダー表示**（Google Workspace利用時）
- **レスポンシブデザイン**（PC・スマホ対応）
- **簡単な設定でカスタマイズ可能**

## 📋 セットアップ

### 1. Google Apps Scriptプロジェクトの作成
1. [Google Apps Script](https://script.google.com/) で新しいプロジェクトを作成
2. 必要なサービスを有効化：
   - Calendar（Google Calendar API v3）
   - AdminDirectory（組織利用の場合のみ）

### 2. ファイルの配置
- `code.gs`: バックエンドロジック
- `Index.html`: フロントエンドUI

### 3. 設定のカスタマイズ
`code.gs`の`CONFIG`オブジェクトを編集してください。

#### 個人利用の場合:
```javascript
const CONFIG = {
  USE_GOOGLE_WORKSPACE: false,
  DEFAULT_CALENDARS: [
    // 共有カレンダーがあれば追加
  ]
};
```

#### 組織利用の場合:
```javascript
const CONFIG = {
  USE_GOOGLE_WORKSPACE: true,
  OU_TO_CALENDAR: {
    "/Sales": [{
      id: "sales@yourcompany.com",
      name: "営業部カレンダー"
    }]
  }
};
```

### 4. Webアプリとして公開
1. 「デプロイ」→「新しいデプロイ」
2. 種類：「ウェブアプリ」
3. 適切なアクセス権限を設定

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, Tailwind CSS, Vanilla JavaScript
- **バックエンド**: Google Apps Script
- **API**: Google Calendar API, Admin Directory API

## 📖 詳細ドキュメント

詳細な設定方法やカスタマイズについては、`docs/`フォルダ内のドキュメントをご参照ください。

## 🤝 コントリビューション

プルリクエストやイシューの報告をお待ちしています！

## 📄 ライセンス

MIT License

## 🔗 関連リンク

- [Google Apps Script公式ドキュメント](https://developers.google.com/apps-script)
- [Google Calendar API](https://developers.google.com/calendar/api)
