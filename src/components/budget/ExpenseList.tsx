import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ExpenseForm } from './ExpenseForm'
import type { Tables } from '../../types/supabase'

type Expense = Tables<'expenses'>

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => Promise<void>
  onSubmitExpense: (amount: number, date: string, description?: string) => Promise<void>
  isSubmittingExpense: boolean
}

export function ExpenseList({
  expenses,
  onDelete,
  onSubmitExpense,
  isSubmittingExpense,
}: ExpenseListProps) {
  const [showAllExpenses, setShowAllExpenses] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('この支出を削除しますか？')) return

    try {
      await onDelete(id)
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">支出リスト</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 支出登録フォーム */}
        <ExpenseForm onSubmit={onSubmitExpense} isSubmitting={isSubmittingExpense} />
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">支出が登録されていません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(showAllExpenses ? expenses : expenses.slice(0, 10)).map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">
                      ¥{Number(expense.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {expense.date && (
                        <p>
                          {new Date(expense.date).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                      {expense.description && <p>{expense.description}</p>}
                    </div>
                  </div>
                </div>
                {expense.id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(expense.id!)}
                  >
                    削除
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {expenses.length > 10 && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAllExpenses(!showAllExpenses)}
            >
              {showAllExpenses
                ? '折りたたむ'
                : `残り${expenses.length - 10}件を表示`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

