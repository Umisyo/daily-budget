# テスト規約

## テスト方針

サービス層とユーティリティ層のロジックテストを重視。
UIコンポーネントのテストは必須ではない。

## 対象

### 必須
- `services/*.ts` - API通信ロジック
- `utils/*.ts` - ユーティリティ関数

### 任意
- `hooks/*.ts` - カスタムフック
- `components/**/*.tsx` - UIコンポーネント

## テストファイル配置

対象ファイルと同階層に `*.test.ts` で配置:

```
services/
├── budgetService.ts
├── budgetService.test.ts    # ここに配置
├── expenseService.ts
└── expenseService.test.ts
```

## 実行コマンド

```bash
pnpm test              # テスト実行（watchモード）
pnpm test:coverage     # カバレッジ付き実行
pnpm test:ui           # UIでテスト結果確認
```

## テストの書き方

### 基本構造

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBudget, upsertBudget } from './budgetService'

describe('budgetService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBudget', () => {
    it('予算が存在する場合、金額を返す', async () => {
      // Arrange
      vi.mocked(supabase.from).mockReturnValue(...)

      // Act
      const result = await getBudget('user-id', 1)

      // Assert
      expect(result).toBe(10000)
    })

    it('予算が存在しない場合、nullを返す', async () => {
      // ...
    })
  })
})
```

### 命名規則

- describe: 対象の関数名やモジュール名
- it: 「〜の場合、〜を返す」「〜の場合、〜する」

```typescript
// Good
it('金額が0未満の場合、エラーを返す')
it('ユーザーIDが存在しない場合、nullを返す')

// Bad
it('test getBudget')
it('should work')
```

## モック

Supabaseのモックは `vi.mock()` を使用:

```typescript
vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn()
        })
      })
    })
  }
}))
```
