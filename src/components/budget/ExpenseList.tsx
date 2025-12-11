import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { CrossIcon } from '../ui/icons/akar-icons-cross'
import { PencilIcon } from '../ui/icons/akar-icons-pencil'
import { ExpenseForm } from './ExpenseForm'
import type { Tables } from '../../types/supabase'

type Expense = Tables<'expenses'>

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => Promise<void>
  onSubmitExpense: (amount: number, date: string, description?: string) => Promise<void>
  onUpdateExpense: (id: string, amount: number, date: string, description?: string) => Promise<void>
  isSubmittingExpense: boolean
}

export function ExpenseList({
  expenses,
  onDelete,
  onSubmitExpense,
  onUpdateExpense,
  isSubmittingExpense,
}: ExpenseListProps) {
  const [showAllExpenses, setShowAllExpenses] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('この支出を削除しますか？')) return

    try {
      await onDelete(id)
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id)
  }

  const handleCancelEdit = () => {
    setEditingExpenseId(null)
  }

  const handleSubmitExpense = async (amount: number, date: string, description?: string) => {
    if (editingExpenseId) {
      try {
        await onUpdateExpense(editingExpenseId, amount, date, description)
        setEditingExpenseId(null)
      } catch (error) {
        // エラーは親コンポーネントで処理
      }
    } else {
      try {
        await onSubmitExpense(amount, date, description)
      } catch (error) {
        // エラーは親コンポーネントで処理
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">支出リスト</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 支出登録フォーム（新規登録用） */}
        {!editingExpenseId && (
          <ExpenseForm
            onSubmit={handleSubmitExpense}
            isSubmitting={isSubmittingExpense}
          />
        )}
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">支出が登録されていません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(showAllExpenses ? expenses : expenses.slice(0, 10)).map((expense) => {
              const isEditing = editingExpenseId === expense.id
              const editingExpense = isEditing ? expense : null

              return isEditing ? (
                <div key={expense.id}>
                  <ExpenseForm
                    onSubmit={handleSubmitExpense}
                    isSubmitting={isSubmittingExpense}
                    expense={editingExpense}
                    onCancel={handleCancelEdit}
                    inline={true}
                  />
                </div>
              ) : (
                <div
                  key={expense.id}
                  className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                      <p className="font-semibold">
                        ¥{Number(expense.amount).toLocaleString()}
                      </p>
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2 text-sm text-muted-foreground">
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
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="icon"
                        onClick={() => handleEdit(expense)}
                        className="rounded-full"
                        disabled={!!editingExpenseId}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleDelete(expense.id!)}
                        className="rounded-full"
                        disabled={!!editingExpenseId}
                      >
                        <CrossIcon />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {expenses.length > 10 && (
          <div className="mt-4 text-center">
            <Button
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

