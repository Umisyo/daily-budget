# サービス層規約

## 概要
`services/` ディレクトリはSupabaseとの通信を担当する層。
コンポーネントやフックから直接Supabaseを呼び出さない。

## ファイル構成

```
services/
├── budgetService.ts       # 予算CRUD
├── expenseService.ts      # 支出CRUD
├── incomeService.ts       # 収入CRUD
├── tagService.ts          # タグCRUD
└── budgetSettingsService.ts # 設定CRUD
```

## 命名規則

- ファイル名: `{機能名}Service.ts`
- 関数名: `get*`, `create*`, `update*`, `delete*`, `upsert*`

## 実装パターン

### ユーザーIDのハッシュ化
**重要**: ユーザーIDは必ずハッシュ化してからDBに保存

```typescript
import { hashUserId } from '@/utils/hashUserId'

export async function getBudget(userId: string, ...): Promise<...> {
  const hashedUserId = await hashUserId(userId)  // 必須

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('hashed_user_id', hashedUserId)  // hashed_user_id を使用

  if (error) throw error
  return data
}
```

### エラーハンドリング
- Supabaseエラーはそのまま throw
- `PGRST116` (行が見つからない) は null を返す

```typescript
const { data, error } = await supabase...

if (error && error.code !== 'PGRST116') {
  throw error
}

return data ?? null
```

## テスト
各サービスには対応する `*.test.ts` を作成
