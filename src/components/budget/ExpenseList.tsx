import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { CrossIcon } from '../ui/icons/akar-icons-cross'
import { PencilIcon } from '../ui/icons/akar-icons-pencil'
import { ExpenseForm } from './ExpenseForm'
import { TagDisplay } from './TagDisplay'
import { showError, getErrorMessage } from '../../utils/errorHandler'
import { getPaymentMethodLabel } from '../../constants'
import { useItemEditor } from '../../hooks/useItemEditor'
import { confirmDelete } from '../../utils/confirmation'
import * as tagService from '../../services/tagService'
import type { PaymentMethod } from '../../constants'
import type { Tables } from '../../types/supabase'

type Expense = Tables<'expenses'>
type Tag = Tables<'tags'>

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => Promise<void>
  onSubmitExpense: (amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null, tagIds?: string[]) => Promise<void>
  onUpdateExpense: (id: string, amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null, tagIds?: string[]) => Promise<void>
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
  const [expenseTags, setExpenseTags] = useState<Record<string, Tag[]>>({})
  const { editingId, startEdit, cancelEdit, isEditing, isAnyEditing } = useItemEditor<Expense>()

  // 支出に紐づくタグを取得
  useEffect(() => {
    const expenseIds = expenses.map((e) => e.id).filter((id): id is string => !!id)
    if (expenseIds.length === 0) {
      setExpenseTags({})
      return
    }

    tagService
      .getTagsForExpenses(expenseIds)
      .then((tags) => {
        setExpenseTags(tags)
      })
      .catch((error) => {
        console.error('タグの取得に失敗しました:', error)
      })
  }, [expenses])

  const handleDelete = async (id: string) => {
    if (!confirmDelete('この支出')) return

    try {
      await onDelete(id)
    } catch (error) {
      showError(getErrorMessage(error, '支出の削除に失敗しました'))
    }
  }

  const handleSubmitExpense = async (amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null, tagIds?: string[]) => {
    if (editingId) {
      try {
        await onUpdateExpense(editingId, amount, date, description, paymentMethod, tagIds)
        cancelEdit()
      } catch (error) {
        showError(getErrorMessage(error, '支出の更新に失敗しました'))
      }
    } else {
      try {
        await onSubmitExpense(amount, date, description, paymentMethod, tagIds)
      } catch (error) {
        showError(getErrorMessage(error, '支出の登録に失敗しました'))
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
        {!editingId && (
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
              const expenseIsEditing = isEditing(expense)
              const editingExpense = expenseIsEditing ? expense : null

              return expenseIsEditing ? (
                <div key={expense.id}>
                  <ExpenseForm
                    onSubmit={handleSubmitExpense}
                    isSubmitting={isSubmittingExpense}
                    expense={editingExpense}
                    onCancel={cancelEdit}
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
                        {expense.payment_method && (
                          <p className="text-xs px-2 py-1 bg-muted rounded-md">
                            {getPaymentMethodLabel(expense.payment_method)}
                          </p>
                        )}
                      </div>
                      {expense.id && expenseTags[expense.id] && expenseTags[expense.id].length > 0 && (
                        <div className="mt-2">
                          <TagDisplay tags={expenseTags[expense.id]} />
                        </div>
                      )}
                    </div>
                  </div>
                  {expense.id && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="icon"
                        onClick={() => startEdit(expense)}
                        className="rounded-full"
                        disabled={isAnyEditing()}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleDelete(expense.id!)}
                        className="rounded-full"
                        disabled={isAnyEditing()}
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

