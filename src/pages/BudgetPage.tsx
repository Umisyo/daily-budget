import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBudgetData } from '../hooks/useBudgetData'
import { useBudgetSettings } from '../hooks/useBudgetSettings'
import { useExpenses } from '../hooks/useExpenses'
import { useIncomes } from '../hooks/useIncomes'
import { BudgetCard } from '../components/budget/BudgetCard'
import { BudgetSettingsForm } from '../components/budget/BudgetSettingsForm'
import { ExpenseList } from '../components/budget/ExpenseList'
import { IncomeList } from '../components/budget/IncomeList'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { showError, getErrorMessage } from '../utils/errorHandler'
import type { PaymentMethod } from '../constants'

export function BudgetPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false)
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false)
  const [isSubmittingIncome, setIsSubmittingIncome] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // カスタムフックを使用
  const { startDay, isLoading: settingsLoading, updateStartDay } = useBudgetSettings(user?.id ?? null)
  const { budget, isLoading: budgetLoading, updateBudget } = useBudgetData(user?.id ?? null, startDay, selectedDate)
  const { expenses, totalExpenses, isLoading: expensesLoading, addExpense, updateExpense, deleteExpense } = useExpenses(
    user?.id ?? null,
    startDay,
    selectedDate
  )
  const { incomes, totalIncomes, isLoading: incomesLoading, addIncome, updateIncome, deleteIncome } = useIncomes(
    user?.id ?? null,
    startDay,
    selectedDate
  )

  const dataLoading = settingsLoading || budgetLoading || expensesLoading || incomesLoading

  const handleSubmitBudget = async (amount: number) => {
    setIsSubmitting(true)
    try {
      await updateBudget(amount)
      setIsEditing(false)
    } catch (error) {
      showError(getErrorMessage(error, '予算の登録に失敗しました'))
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
      showError(getErrorMessage(error, '設定の登録に失敗しました'))
      throw error
    } finally {
      setIsSubmittingSettings(false)
    }
  }

  const handleSubmitExpense = async (amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null) => {
    setIsSubmittingExpense(true)
    try {
      await addExpense(amount, date, description, paymentMethod)
    } catch (error) {
      showError(getErrorMessage(error, '支出の登録に失敗しました'))
      throw error
    } finally {
      setIsSubmittingExpense(false)
    }
  }

  const handleUpdateExpense = async (id: string, amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null) => {
    setIsSubmittingExpense(true)
    try {
      await updateExpense(id, amount, date, description, paymentMethod)
    } catch (error) {
      showError(getErrorMessage(error, '支出の更新に失敗しました'))
      throw error
    } finally {
      setIsSubmittingExpense(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id)
    } catch (error) {
      showError(getErrorMessage(error, '支出の削除に失敗しました'))
      throw error
    }
  }

  const handleSubmitIncome = async (amount: number, date: string, description?: string) => {
    setIsSubmittingIncome(true)
    try {
      await addIncome(amount, date, description)
    } catch (error) {
      showError(getErrorMessage(error, '収入の登録に失敗しました'))
      throw error
    } finally {
      setIsSubmittingIncome(false)
    }
  }

  const handleUpdateIncome = async (id: string, amount: number, date: string, description?: string) => {
    setIsSubmittingIncome(true)
    try {
      await updateIncome(id, amount, date, description)
    } catch (error) {
      showError(getErrorMessage(error, '収入の更新に失敗しました'))
      throw error
    } finally {
      setIsSubmittingIncome(false)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome(id)
    } catch (error) {
      showError(getErrorMessage(error, '収入の削除に失敗しました'))
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
            totalIncomes={totalIncomes}
            startDay={startDay}
            referenceDate={selectedDate}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onCancel={() => setIsEditing(false)}
            onSubmit={handleSubmitBudget}
            isSubmitting={isSubmitting}
            onEditSettings={() => setIsEditingSettings(true)}
          />

          {/* 収入・支出リスト（タブで切り替え） */}
          {budget !== null && !isEditing && (
            <Tabs defaultValue="expenses" className="w-full">
              <TabsList>
                <TabsTrigger value="expenses" className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted text-muted-foreground'>
                  支出
                </TabsTrigger>
                <TabsTrigger value="incomes" className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-muted text-muted-foreground'>
                  収入
                </TabsTrigger>
              </TabsList>
              <TabsContent value="expenses">
                <ExpenseList
                  expenses={expenses}
                  onDelete={handleDeleteExpense}
                  onSubmitExpense={handleSubmitExpense}
                  onUpdateExpense={handleUpdateExpense}
                  isSubmittingExpense={isSubmittingExpense}
                />
              </TabsContent>
              <TabsContent value="incomes">
                <IncomeList
                  incomes={incomes}
                  onDelete={handleDeleteIncome}
                  onSubmitIncome={handleSubmitIncome}
                  onUpdateIncome={handleUpdateIncome}
                  isSubmittingIncome={isSubmittingIncome}
                />
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  )
}
