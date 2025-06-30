# セットアップガイド

## 概要
この汎用版グループカレンダーは、個人利用からGoogle Workspace組織利用まで対応できるよう設計されています。

## セットアップ手順

### 1. Google Apps Scriptプロジェクトの作成
1. [Google Apps Script](https://script.google.com/) にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「グループカレンダー」に変更

### 2. 必要なサービスの有効化
Apps Scriptエディタで以下のサービスを有効にしてください：

#### サービス > ライブラリから追加:
- **Calendar**: Google Calendar API v3
- **AdminDirectory**: Admin SDK Directory API (組織利用の場合のみ)

#### 手順:
1. 左サイドバーの「サービス」をクリック
2. 「＋ サービスを追加」をクリック
3. 「Calendar」を検索して追加
4. （組織利用の場合）「AdminDirectory」も同様に追加

### 3. コードの配置

#### code.gs
srcフォルダ内のcode.gsの内容をGoogle Apps Scriptのcode.gsファイルにコピーしてください。

#### Index.html
srcフォルダ内のIndex.htmlの内容をGoogle Apps ScriptのIndex.htmlファイルにコピーしてください。

### 4. 設定のカスタマイズ

code.gsの上部にあるCONFIGオブジェクトを編集してください：

#### 個人利用の場合:
```javascript
const CONFIG = {
  APP_NAME: "マイカレンダー",
  DEFAULT_CALENDARS: [
    // 共有カレンダーがある場合のみ追加
  ],
  OU_TO_CALENDAR: {
    // 空のままでOK
  },
  USE_GOOGLE_WORKSPACE: false, // 必ずfalseに設定
  HELP_URL: "https://support.google.com/calendar/",
  WEEK_START_DAY: 0 // 0:日曜開始, 1:月曜開始
};
```

#### Google Workspace組織利用の場合:
```javascript
const CONFIG = {
  APP_NAME: "会社カレンダー",
  DEFAULT_CALENDARS: [
    {
      id: "company-all@yourcompany.com",
      name: "全社カレンダー"
    }
  ],
  OU_TO_CALENDAR: {
    "/Sales": [
      {
        id: "sales@yourcompany.com",
        name: "営業部カレンダー"
      }
    ],
    "/Engineering": [
      {
        id: "engineering@yourcompany.com",
        name: "エンジニアリング部カレンダー"
      }
    ]
  },
  USE_GOOGLE_WORKSPACE: true, // 必ずtrueに設定
  HELP_URL: "https://yourcompany.com/calendar-help",
  WEEK_START_DAY: 1 // 月曜開始の場合
};
```

### 5. Webアプリケーションとして公開

1. 右上の「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 種類として「ウェブアプリ」を選択
4. 説明を入力（例：「グループカレンダー v1.0」）
5. 実行ユーザー：「自分」
6. アクセスできるユーザー：
   - 個人利用：「自分のみ」
   - 組織利用：「組織内の全員」または「誰でも」
7. 「デプロイ」をクリック

### 6. 権限の承認

初回実行時に以下の権限が要求されます：
- Google Calendarの表示と編集
- （組織利用の場合）組織のユーザー情報へのアクセス

「詳細」→「プロジェクト名に移動（安全ではありません）」をクリックして承認してください。

## 設定例

### カレンダーIDの取得方法:
1. Google Calendarを開く
2. 対象カレンダーの設定を開く
3. 「カレンダーの統合」で「カレンダーID」を確認

### 複数の共有カレンダーを追加:
```javascript
DEFAULT_CALENDARS: [
  {
    id: "calendar1@group.calendar.google.com",
    name: "イベントカレンダー"
  },
  {
    id: "calendar2@group.calendar.google.com", 
    name: "会議室カレンダー"
  }
]
```

### 組織階層の設定例:
```javascript
OU_TO_CALENDAR: {
  "/本社": [
    { id: "hq@company.com", name: "本社カレンダー" }
  ],
  "/本社/営業部": [
    { id: "sales@company.com", name: "営業部カレンダー" }
  ],
  "/本社/営業部/東京営業所": [
    { id: "tokyo-sales@company.com", name: "東京営業所カレンダー" }
  ]
}
```
