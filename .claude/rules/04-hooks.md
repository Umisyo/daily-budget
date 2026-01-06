# カスタムフック規約

## 概要
`hooks/` ディレクトリはService層の呼び出しと状態管理を担当。

## 命名規則
- ファイル名・関数名: `use{機能名}.ts` / `use{機能名}()`

## 基本構造

```typescript
import { useState, useEffect } from 'react'
import { getSomething, updateSomething } from '@/services/someService'

export function useSomething(userId: string | null, ...params) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getSomething(userId, ...params)
        setData(result)
      } catch (err) {
        console.error('エラー:', err)
        setError(err instanceof Error ? err : new Error('取得に失敗しました'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, ...params])

  const update = async (newValue: T) => {
    if (!userId) return
    try {
      await updateSomething(userId, newValue, ...params)
      setData(newValue)
    } catch (err) {
      console.error('更新エラー:', err)
      throw err
    }
  }

  return { data, isLoading, error, update }
}
```

## 返り値の型

- `data`: 取得したデータ
- `isLoading`: ローディング状態
- `error`: エラー情報
- CRUD操作関数

## 注意点

- `userId` が null の場合は早期リターン
- エラーは throw して呼び出し元で処理
- 楽観的更新を行う場合は状態を即座に更新
