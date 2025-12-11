import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBudgetData } from '../hooks/useBudgetData'
import { useBudgetSettings } from '../hooks/useBudgetSettings'
import { useExpenses } from '../hooks/useExpenses'
import { BudgetCard } from '../components/budget/BudgetCard'
import { BudgetSettingsForm } from '../components/budget/BudgetSettingsForm'
import { ExpenseList } from '../components/budget/ExpenseList'

export function BudgetPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false)
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false)

  // カスタムフックを使用
  const { startDay, isLoading: settingsLoading, updateStartDay } = useBudgetSettings(user?.id ?? null)
  const { budget, isLoading: budgetLoading, updateBudget } = useBudgetData(user?.id ?? null, startDay)
  const { expenses, totalExpenses, isLoading: expensesLoading, addExpense, updateExpense, deleteExpense } = useExpenses(
    user?.id ?? null,
    startDay
  )

  const dataLoading = settingsLoading || budgetLoading || expensesLoading

  const handleSubmitBudget = async (amount: number) => {
    setIsSubmitting(true)
    try {
      await updateBudget(amount)
      setIsEditing(false)
    } catch (error) {
      alert('予算の登録に失敗しました')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitSettings = async (day: number) => {
    setIsSubmittingSettings(true)
    try {
      await updateStartDay(day)
      setIsEditingSettings(false)
      // 設定変更後はページをリロードしてデータを再取得
      window.location.reload()
    } catch (error) {
      alert('設定の登録に失敗しました')
      throw error
    } finally {
      setIsSubmittingSettings(false)
    }
  }

  const handleSubmitExpense = async (amount: number, date: string, description?: string) => {
    setIsSubmittingExpense(true)
    try {
      await addExpense(amount, date, description)
    } catch (error) {
      alert('支出の登録に失敗しました')
      throw error
    } finally {
      setIsSubmittingExpense(false)
    }
  }

  const handleUpdateExpense = async (id: string, amount: number, date: string, description?: string) => {
    setIsSubmittingExpense(true)
    try {
      await updateExpense(id, amount, date, description)
    } catch (error) {
      alert('支出の更新に失敗しました')
      throw error
    } finally {
      setIsSubmittingExpense(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id)
    } catch (error) {
      alert('支出の削除に失敗しました')
      throw error
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {isEditingSettings ? (
        <BudgetSettingsForm
          startDay={startDay}
          onSubmit={handleSubmitSettings}
          onCancel={() => setIsEditingSettings(false)}
          isSubmitting={isSubmittingSettings}
        />
      ) : (
        <>
          <BudgetCard
            budget={budget}
            totalExpenses={totalExpenses}
            startDay={startDay}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            onSubmit={handleSubmitBudget}
            isSubmitting={isSubmitting}
            onEditSettings={() => setIsEditingSettings(true)}
          />

          {/* 支出リスト */}
          {budget !== null && !isEditing && (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDeleteExpense}
              onSubmitExpense={handleSubmitExpense}
              onUpdateExpense={handleUpdateExpense}
              isSubmittingExpense={isSubmittingExpense}
            />
          )}
        </>
      )}
    </div>
  )
}
