# プロジェクト規約チェックリスト

このプロジェクト固有の規約。`.claude/rules/` に定義された内容に基づく。

## 目次

1. [基本ルール](#基本ルール)
2. [コンポーネント規約](#コンポーネント規約)
3. [サービス層規約](#サービス層規約)
4. [カスタムフック規約](#カスタムフック規約)
5. [エラーハンドリング規約](#エラーハンドリング規約)
6. [Git規約](#git規約)
7. [テスト規約](#テスト規約)

---

## 基本ルール

### 言語設定
- [ ] コメント、JSDoc、エラーメッセージは**日本語**
- [ ] 変数名、関数名、クラス名は**英語**（camelCase / PascalCase）

### パッケージ管理
- [ ] `pnpm` を使用（npm, yarnは不可）

### インポート
- [ ] パスエイリアス `@/` を使用
- [ ] 相対パスは同一ディレクトリ内のみ許可

```typescript
// Good
import { Button } from '@/components/ui/button'

// Bad
import { Button } from '../../components/ui/button'
```

### TypeScript
- [ ] strict モードを維持
- [ ] `any` 型の使用は極力避ける
- [ ] 型定義は `src/types/` に集約

---

## コンポーネント規約

### ディレクトリ配置
- [ ] UIコンポーネント → `components/ui/`
- [ ] 機能コンポーネント → `components/{機能名}/`
- [ ] ページ → `pages/` （ファイル名は `*Page.tsx`）

### shadcn/ui パターン
- [ ] Radix UI プリミティブを使用
- [ ] `class-variance-authority` でバリアント定義
- [ ] `cn()` ユーティリティでクラス結合

### データフロー
- [ ] コンポーネント内でSupabase直接呼び出しは**禁止**
- [ ] カスタムフックでデータ取得・状態管理
- [ ] コンポーネントはUIのみに集中

```typescript
// Good
function BudgetPage() {
  const { budget, isLoading, updateBudget } = useBudgetData(userId, startDay)
  // UIのみ
}

// Bad - コンポーネント内でSupabase直接呼び出し
function BudgetPage() {
  useEffect(() => {
    supabase.from('budgets').select()... // NG
  }, [])
}
```

---

## サービス層規約

### ファイル配置
- [ ] `services/{機能名}Service.ts`

### 関数命名
- [ ] `get*`, `create*`, `update*`, `delete*`, `upsert*`

### ユーザーIDのハッシュ化
- [ ] ユーザーIDは**必ず** `hashUserId()` でハッシュ化してからDBに保存
- [ ] DBカラムは `hashed_user_id` を使用

```typescript
// 必須パターン
import { hashUserId } from '@/utils/hashUserId'

export async function getBudget(userId: string, ...): Promise<...> {
  const hashedUserId = await hashUserId(userId)  // 必須
  // ...
}
```

### エラーハンドリング
- [ ] Supabaseエラーはそのまま throw
- [ ] `PGRST116` (行が見つからない) は null を返す

---

## カスタムフック規約

### ファイル配置
- [ ] `hooks/use{機能名}.ts`

### 基本構造
- [ ] `data`, `isLoading`, `error` の状態を返す
- [ ] `userId` が null の場合は早期リターン
- [ ] エラーは throw して呼び出し元で処理
- [ ] 楽観的更新を行う場合は状態を即座に更新

```typescript
export function useSomething(userId: string | null, ...params) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }
    // fetch logic
  }, [userId, ...params])

  return { data, isLoading, error, update }
}
```

---

## エラーハンドリング規約

### 層別の責務

| 層 | 責務 |
|---|---|
| Service層 | Supabaseエラーをそのままthrow |
| Hooks層 | Error型に変換して状態に保持 |
| Components層 | `errorHandler` でトースト通知 |

### Components層での実装
- [ ] `showError()` と `getErrorMessage()` を使用
- [ ] 技術的詳細は console.error に出力

```typescript
import { showError, getErrorMessage } from '@/utils/errorHandler'

showError(getErrorMessage(error, '予算の登録に失敗しました'))
```

### エラーメッセージ
- [ ] 日本語で記述
- [ ] ユーザーが理解できる内容

---

## Git規約

### コミットメッセージ (Conventional Commits)
- [ ] `<type>: <description>` 形式
- [ ] 日本語で記述

| Type | 説明 |
|---|---|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント |
| `style` | コードスタイル |
| `refactor` | リファクタリング |
| `test` | テスト |
| `chore` | ビルド・設定 |

### ブランチ命名
- [ ] `feature/*` - 新機能
- [ ] `bugfix/*` - バグ修正
- [ ] `refactor/*` - リファクタリング

---

## テスト規約

### 必須テスト対象
- [ ] `services/*.ts`
- [ ] `utils/*.ts`

### ファイル配置
- [ ] 対象ファイルと同階層に `*.test.ts`

```
services/
├── budgetService.ts
└── budgetService.test.ts  ← ここ
```

### テスト命名
- [ ] describe: 対象の関数名やモジュール名
- [ ] it: 「〜の場合、〜を返す」形式

```typescript
describe('budgetService', () => {
  describe('getBudget', () => {
    it('予算が存在する場合、金額を返す', async () => {
      // ...
    })
  })
})
```
