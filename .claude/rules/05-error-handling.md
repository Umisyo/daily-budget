# エラーハンドリング規約

## 概要
エラーは層ごとに適切に処理し、ユーザーに分かりやすいメッセージを表示する。

## 層別の責務

### Service層
- Supabaseエラーをそのままthrow
- 特定のエラーコード（PGRST116など）は適切に処理

```typescript
// services/budgetService.ts
const { data, error } = await supabase.from('budgets').select()

if (error && error.code !== 'PGRST116') {
  throw error  // そのままthrow
}
```

### Hooks層
- Service層のエラーをcatch
- Error型に変換して状態に保持
- 必要に応じて再throw

```typescript
// hooks/useBudgetData.ts
try {
  const data = await getBudget(userId, startDay)
  setData(data)
} catch (err) {
  console.error('予算取得エラー:', err)
  setError(err instanceof Error ? err : new Error('予算の取得に失敗しました'))
}
```

### Components層
- `errorHandler` ユーティリティを使用
- ユーザーにトースト通知を表示

```typescript
// pages/BudgetPage.tsx
import { showError, getErrorMessage } from '@/utils/errorHandler'

const handleSubmit = async (amount: number) => {
  try {
    await updateBudget(amount)
  } catch (error) {
    showError(getErrorMessage(error, '予算の登録に失敗しました'))
    throw error  // 必要に応じて再throw
  }
}
```

## エラーメッセージ

- 日本語で記述
- ユーザーが理解できる内容
- 技術的詳細は console.error に出力

```typescript
// Good
'予算の登録に失敗しました'
'支出の削除に失敗しました'

// Bad
'PGRST116: Row not found'
'Network error'
```

## ユーティリティ関数

```typescript
// utils/errorHandler.ts
export function showError(message: string): void
export function getErrorMessage(error: unknown, defaultMessage: string): string
```
