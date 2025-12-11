# Daily Budget

月あたりの設定予算を日で割った値を表示し、日毎の予算を明確化するWebアプリケーションです。

## 概要

Daily Budgetは、月間予算を日割り計算して表示することで、1日あたりの予算を明確に把握できるようにするツールです。予算管理をより細かく、より分かりやすくすることを目的としています。

## 主な機能

- **ユーザー認証**: Supabaseを使用したログイン・新規登録機能
- **月間予算の設定**: 月あたりの予算を設定
- **日割り計算**: 設定した月間予算を日数で割り、1日あたりの予算を自動計算
- **日毎の予算表示**: 計算された日毎の予算を分かりやすく表示

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **ビルドツール**: Vite
- **認証**: Supabase Auth
- **UIコンポーネント**: Radix UI
- **スタイリング**: Tailwind CSS
- **パッケージマネージャー**: pnpm

## セットアップ

### 必要な環境

- Node.js (推奨バージョン: 18以上)
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 環境変数の設定

Supabaseを使用するため、環境変数の設定が必要です。`.env`ファイルを作成し、以下の変数を設定してください：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバーの起動

```bash
pnpm dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:5173` にアクセスしてください。

## ビルド

本番環境用のビルドを作成する場合：

```bash
pnpm build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

## プレビュー

ビルド結果をプレビューする場合：

```bash
pnpm preview
```

## プロジェクト構造

```
daily-budget/
├── src/
│   ├── components/        # Reactコンポーネント
│   │   ├── auth/          # 認証関連コンポーネント
│   │   └── ui/            # UIコンポーネント
|   ├── pages              # Pageコンポーネント
│   ├── contexts/          # React Context
│   ├── lib/               # ユーティリティ関数
│   ├── types/             # TypeScript型定義
│   ├── utils/             # ヘルパー関数
│   ├── App.tsx            # メインアプリケーションコンポーネント
│   └── main.tsx           # エントリーポイント
├── public/                # 静的ファイル
└── package.json           # プロジェクト設定
```
