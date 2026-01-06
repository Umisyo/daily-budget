# Daily Budget - 開発ガイドライン

## プロジェクト概要

月間予算を日割り計算して表示する家計管理Webアプリケーション。
Supabaseを使用した認証とデータ永続化、プライバシー保護のためのユーザーIDハッシュ化を実装。

## 技術スタック

- **フレームワーク**: React 19 + TypeScript (strict mode)
- **ビルド**: Vite 7 + SWC
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: shadcn/ui (Radix UI ベース)
- **バックエンド**: Supabase (認証 + PostgreSQL)
- **テスト**: Vitest + React Testing Library
- **パッケージ管理**: pnpm
- **PWA**: vite-plugin-pwa

## 開発コマンド

```bash
pnpm dev           # 開発サーバー起動
pnpm build         # 本番ビルド (tsc + vite build)
pnpm lint          # ESLint実行
pnpm test          # テスト実行
pnpm test:coverage # カバレッジ付きテスト
```

## ディレクトリ構造

```
src/
├── components/
│   ├── ui/          # shadcn/ui コンポーネント（汎用UI）
│   ├── budget/      # 予算機能コンポーネント
│   └── auth/        # 認証関連コンポーネント
├── pages/           # ページコンポーネント
├── hooks/           # カスタムフック
├── services/        # Supabase APIサービス層
├── utils/           # ユーティリティ関数
├── contexts/        # React Context
├── constants/       # 定数定義
├── types/           # TypeScript型定義
└── test/            # テストセットアップ
```

## パスエイリアス

`@/` は `src/` にマッピング。インポートは `@/components/ui/button` のように記述。

## コーディング規約

### 言語
- コメント、JSDoc、エラーメッセージは**日本語**で記述

### コンポーネント
- UIコンポーネントは `components/ui/` に配置（shadcn/uiスタイル）
- 機能コンポーネントは `components/{機能名}/` に配置
- ページコンポーネントは `pages/` に配置

### データフロー
- **Service層**: Supabaseとの通信を担当（`services/`）
- **Hooks**: 状態管理とService層の呼び出し（`hooks/`）
- **Components**: UIのみに集中

### セキュリティ
- ユーザーIDは必ず `hashUserId()` でハッシュ化してからDBに保存
- 環境変数は `VITE_` プレフィックス必須

## Git規約

### コミットメッセージ (Conventional Commits)

```
<type>: <description>

[optional body]
```

**type一覧:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードスタイル（動作に影響なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・ツール設定

### ブランチ戦略

- `main`: 本番ブランチ
- `feature/*`: 新機能開発
- `bugfix/*`: バグ修正
- `refactor/*`: リファクタリング

## テスト方針

- **必須**: `services/` と `utils/` のロジック層
- テストファイルは対象ファイルと同階層に `*.test.ts` で配置
- モックは `src/__mocks__/` に配置

## エラーハンドリング

1. Service層でSupabaseエラーをキャッチし、適切なErrorをthrow
2. Hooks層でエラーを受け取り、状態として保持
3. Components層で `showError()` を使用してユーザーに通知

```typescript
// Service層
if (error) throw error

// Hooks層
catch (err) {
  setError(err instanceof Error ? err : new Error('メッセージ'))
}

// Components層
import { showError, getErrorMessage } from '@/utils/errorHandler'
showError(getErrorMessage(error, 'デフォルトメッセージ'))
```
