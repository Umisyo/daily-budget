# コンポーネント規約

## ディレクトリ構成

```
components/
├── ui/          # 汎用UIコンポーネント（shadcn/ui）
├── budget/      # 予算機能コンポーネント
└── auth/        # 認証関連コンポーネント
```

## UIコンポーネント作成ルール

### shadcn/ui の利用
新しいUIコンポーネントは shadcn/ui のパターンに従う:
- Radix UI プリミティブを使用
- `class-variance-authority` でバリアント定義
- `cn()` ユーティリティでクラス結合

```typescript
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", destructive: "..." },
      size: { default: "...", sm: "...", lg: "..." }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
)
```

## 機能コンポーネント

### データフロー
1. カスタムフックでデータ取得・状態管理
2. コンポーネントはUIのみに集中
3. ビジネスロジックはフックに委譲

```typescript
// Good
function BudgetPage() {
  const { budget, isLoading, updateBudget } = useBudgetData(userId, startDay)
  // UIのみ
}

// Bad - コンポーネント内でSupabase直接呼び出し
function BudgetPage() {
  const [budget, setBudget] = useState(null)
  useEffect(() => {
    supabase.from('budgets').select()... // NG
  }, [])
}
```

## ページコンポーネント

- `pages/` ディレクトリに配置
- ファイル名は `*Page.tsx` の形式
- レイアウトとコンポーネントの組み立てのみ
