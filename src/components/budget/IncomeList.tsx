import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { CrossIcon } from '../ui/icons/akar-icons-cross'
import { PencilIcon } from '../ui/icons/akar-icons-pencil'
import { IncomeForm } from './IncomeForm'
import { showError, getErrorMessage } from '../../utils/errorHandler'
import { useItemEditor } from '../../hooks/useItemEditor'
import { confirmDelete } from '../../utils/confirmation'
import type { Tables } from '../../types/supabase'

type Income = Tables<'incomes'>

interface IncomeListProps {
  incomes: Income[]
  onDelete: (id: string) => Promise<void>
  onSubmitIncome: (amount: number, date: string, description?: string) => Promise<void>
  onUpdateIncome: (id: string, amount: number, date: string, description?: string) => Promise<void>
  isSubmittingIncome: boolean
}

export function IncomeList({
  incomes,
  onDelete,
  onSubmitIncome,
  onUpdateIncome,
  isSubmittingIncome,
}: IncomeListProps) {
  const [showAllIncomes, setShowAllIncomes] = useState(false)
  const { editingId, startEdit, cancelEdit, isEditing, isAnyEditing } = useItemEditor<Income>()

  const handleDelete = async (id: string) => {
    if (!confirmDelete('この収入')) return

    try {
      await onDelete(id)
    } catch (error) {
      showError(getErrorMessage(error, '収入の削除に失敗しました'))
    }
  }

  const handleSubmitIncome = async (amount: number, date: string, description?: string) => {
    if (editingId) {
      try {
        await onUpdateIncome(editingId, amount, date, description)
        cancelEdit()
      } catch (error) {
        showError(getErrorMessage(error, '収入の更新に失敗しました'))
      }
    } else {
      try {
        await onSubmitIncome(amount, date, description)
      } catch (error) {
        showError(getErrorMessage(error, '収入の登録に失敗しました'))
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">収入リスト</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 収入登録フォーム（新規登録用） */}
        {!editingId && (
          <IncomeForm
            onSubmit={handleSubmitIncome}
            isSubmitting={isSubmittingIncome}
          />
        )}
        {incomes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">収入が登録されていません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(showAllIncomes ? incomes : incomes.slice(0, 10)).map((income) => {
              const incomeIsEditing = isEditing(income)
              const editingIncome = incomeIsEditing ? income : null

              return incomeIsEditing ? (
                <div key={income.id}>
                  <IncomeForm
                    onSubmit={handleSubmitIncome}
                    isSubmitting={isSubmittingIncome}
                    income={editingIncome}
                    onCancel={cancelEdit}
                    inline={true}
                  />
                </div>
              ) : (
                <div
                  key={income.id}
                  className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 text-left">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                      <p className="font-semibold">
                        ¥{Number(income.amount).toLocaleString()}
                      </p>
                      <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2 text-sm text-muted-foreground">
                        {income.date && (
                          <p>
                            {new Date(income.date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                        {income.description && <p>{income.description}</p>}
                      </div>
                    </div>
                  </div>
                  {income.id && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="icon"
                        onClick={() => startEdit(income)}
                        className="rounded-full"
                        disabled={isAnyEditing()}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleDelete(income.id!)}
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
        {incomes.length > 10 && (
          <div className="mt-4 text-center">
            <Button
              onClick={() => setShowAllIncomes(!showAllIncomes)}
            >
              {showAllIncomes
                ? '折りたたむ'
                : `残り${incomes.length - 10}件を表示`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

