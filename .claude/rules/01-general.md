# 基本ルール

## 言語設定
- コード内のコメント、JSDoc、エラーメッセージは日本語で記述すること
- 変数名、関数名、クラス名は英語（camelCase / PascalCase）

## パッケージ管理
- パッケージマネージャーは `pnpm` を使用
- `npm` や `yarn` は使用しない

## インポート
- パスエイリアス `@/` を使用してインポート
- 相対パスは同一ディレクトリ内のみ許可

```typescript
// Good
import { Button } from '@/components/ui/button'
import { useBudgetData } from '@/hooks/useBudgetData'

// Bad
import { Button } from '../../components/ui/button'
```

## TypeScript
- strict モードを維持
- `any` 型の使用は極力避ける
- 型定義は `src/types/` に集約
