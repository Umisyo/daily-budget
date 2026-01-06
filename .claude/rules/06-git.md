# Git 規約

## コミットメッセージ

### フォーマット (Conventional Commits)

```
<type>: <description>

[optional body]
```

### Type 一覧

| Type | 説明 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat: タグ機能を追加` |
| `fix` | バグ修正 | `fix: 予算計算の端数処理を修正` |
| `docs` | ドキュメント | `docs: READMEにセットアップ手順を追加` |
| `style` | コードスタイル | `style: インデントを修正` |
| `refactor` | リファクタリング | `refactor: budgetServiceを分割` |
| `test` | テスト | `test: expenseServiceのテストを追加` |
| `chore` | ビルド・設定 | `chore: eslint設定を更新` |

### 例

```bash
# Good
feat: 支出のタグ機能を追加
fix: 予算期間の計算で月末が正しく処理されない問題を修正
refactor: useExpensesフックのエラーハンドリングを改善

# Bad
update  # typeがない
feat: Add tag feature  # 日本語で書く
```

## ブランチ戦略

### ブランチ命名規則

```
main              # 本番ブランチ
feature/*         # 新機能開発
bugfix/*          # バグ修正
refactor/*        # リファクタリング
```

### 例

```bash
feature/add-tag-filter
bugfix/fix-budget-calculation
refactor/split-budget-service
```

### フロー

1. `main` から新しいブランチを作成
2. 作業完了後、`main` へPRを作成
3. レビュー後マージ

## .gitignore

以下は必ず除外:
- `.env` (環境変数)
- `node_modules/`
- `dist/`
- `coverage/`
