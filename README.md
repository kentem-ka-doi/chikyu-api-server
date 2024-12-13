# Chikyu API Server

このプロジェクトは、Chikyu API サーバーのサンプル実装です。以下にプロジェクトの内容、構成、および設定方法を説明します。

## プロジェクト構造

```
chikyu-api-server/
├── Dockerfile              # Dockerの設定ファイル
├── docker-compose.yml      # Docker Compose設定
├── package.json            # プロジェクトの依存関係とスクリプト
├── tsconfig.json           # TypeScriptの設定
├── node_modules/           # Node.jsの依存関係
├── README.md               # プロジェクトの説明 (このファイル)
├── LICENSE                 # ライセンス情報
├── src/                    # アプリケーションのソースコード
└── tests/                  # テストコード
```

## 必須ツール

- Docker (推奨: 最新版)
- Docker Compose (推奨: 最新版)

## セットアップ手順

1. リポジトリをクローンします。

   ```bash
   git clone <リポジトリのURL>
   cd chikyu-api-server
   ```

2. Docker コンテナをビルドして起動します。

   ```bash
   docker-compose up --build
   ```

3. サーバーが正常に起動したことを確認します。デフォルトでは `http://localhost:3000` にアクセス可能です。

## スクリプト

以下の npm スクリプトが`package.json`に含まれています。

- `npm run dev`: 開発用サーバーの起動 (ホットリロード対応)
- `npm run build`: プロジェクトのビルド
- `npm run start`: ビルド後のプロダクションサーバーの起動

## 環境変数設定

`.env` ファイルをプロジェクトルートに作成し、必要な環境変数を定義してください。

例:

```
COMPOSE_PROJECT_NAME=chikyu-api-server
TOKEN_NAME="example-chikyu-api-server"
PORT=3000
ORGANIZATION_ID=10561
EMAIL=example@kentem.co.jp
PASSWORD=example
```

## ソースコードの説明

### src フォルダの構成

```
src/
├── handlers.ts    # リクエスト処理ロジック
├── server.ts      # サーバーのエントリーポイント
├── session.ts     # セッション管理
├── utils.ts       # 汎用関数やヘルパーメソッド
├── routes.ts      # APIルートの定義
└── types/
    └── chikyu-sdk.d.ts  # TypeScript用の型定義
```

#### ファイルの詳細

- **`handlers.ts`**: API エンドポイントごとのリクエスト処理ロジックが定義されています。各エンドポイントに対するビジネスロジックを実装し、HTTP リクエストを処理します。

- **`server.ts`**: Express.js のサーバー設定ファイルです。サーバーの初期化、ミドルウェアの設定、ルートの登録を行います。

- **`session.ts`**: セッション管理用モジュールです。ユーザーのログイン状態を追跡し、セッションの生成、検証、破棄を管理します。

- **`utils.ts`**: 汎用関数のコレクションです。データ変換、バリデーション、エラーハンドリングなど、さまざまな共通機能を提供します。

- **`routes.ts`**: API ルート定義ファイルです。すべてのエンドポイントのパスとそれに紐づくハンドラー関数を登録し、ルーティングを管理します。

- **`types/chikyu-sdk.d.ts`**: TypeScript 用の型定義ファイルです。Chikyu SDK と連携するための型定義が含まれており、型安全なコード記述を支援します。

## 利用制限

このプロジェクトは社内利用に限定され、非商用・商用利用の両方が許可されます。ただし、無断の再配布や公開は禁止されています。詳細なライセンス条件については `LICENSE` ファイルを参照してください。

## 貢献方法

1. 内部リポジトリで新しいブランチを作成してください。
2. 機能を追加またはバグを修正してください。
3. レビューを依頼してください。

## ライセンス

このプロジェクトは社内利用を前提としており、非商用・商用利用が許可されています。詳細は `LICENSE` ファイルを参照してください。
