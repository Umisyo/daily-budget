import { useState } from 'react'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { getRemainingDays } from '../../utils/budgetPeriod'
import {
  calculateRemainingBudget,
  calculateAvailableBudget,
  calculateBudgetPercentage,
  calculateDailyBudget,
  getBudgetColorClass,
  isBudgetOverdrawn,
} from '../../utils/budgetCalculations'
import { validateAmount } from '../../utils/validation'
import { showError } from '../../utils/errorHandler'
import { PeriodSelector } from './PeriodSelector'

interface BudgetCardProps {
  budget: number | null
  totalExpenses: number
  totalIncomes: number
  startDay: number
  referenceDate?: Date
  selectedDate: Date
  onDateChange: (date: Date) => void
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSubmit: (amount: number) => Promise<void>
  isSubmitting: boolean
  onEditSettings?: () => void
}

export function BudgetCard({
  budget,
  totalExpenses,
  totalIncomes,
  startDay,
  referenceDate,
  selectedDate,
  onDateChange,
  isEditing,
  onEdit,
  onCancel,
  onSubmit,
  isSubmitting,
  onEditSettings,
}: BudgetCardProps) {
  const [budgetAmount, setBudgetAmount] = useState<string>('')

  const handleEditClick = () => {
    setBudgetAmount(budget?.toString() || '')
    onEdit()
  }

  const handleCancelEdit = () => {
    setBudgetAmount('')
    onCancel()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateAmount(budgetAmount)
    if (!validation.isValid) {
      if (validation.errorMessage) {
        showError(validation.errorMessage)
      }
      return
    }

    const amount = parseFloat(budgetAmount)
    try {
      await onSubmit(amount)
      setBudgetAmount('')
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  const now = referenceDate || new Date()
  const remainingBudget = calculateRemainingBudget(budget, totalIncomes, totalExpenses)
  const availableBudget = calculateAvailableBudget(budget, totalIncomes)
  const budgetPercentage = calculateBudgetPercentage(totalExpenses, availableBudget)
  const remainingDays = getRemainingDays(startDay, now)
  const dailyBudget = calculateDailyBudget(remainingBudget, remainingDays)

  return (
    <Card>
      <CardHeader className="min-w-0 overflow-hidden">
        <div className="flex flex-col gap-4 min-w-0">
          <PeriodSelector
            startDay={startDay}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
          <div className="flex gap-2 justify-end">
            {onEditSettings && !isEditing && (
              <Button onClick={onEditSettings}>期間</Button>
            )}
            {budget !== null && !isEditing && (
              <Button onClick={handleEditClick}>予算</Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {budget === null || isEditing ? (
          <div className="py-8">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="budget-amount">月予算（円）</Label>
                <Input
                  id="budget-amount"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="例: 50000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex gap-2 justify-end">
                {budget !== null && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '登録中...' : budget === null ? '登録' : '更新'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">残り予算</p>
                <p
                  className={`text-6xl font-bold ${
                    isBudgetOverdrawn(remainingBudget) ? 'text-destructive' : 'text-primary'
                  }`}
                >
                  ¥{remainingBudget !== null ? remainingBudget.toLocaleString() : '0'}
                </p>
              </div>
              {dailyBudget !== null && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">1日あたりの予算</p>
                  <p className="text-2xl font-bold text-primary">
                    ¥{dailyBudget >= 0 ? Math.floor(dailyBudget).toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    残り{remainingDays}日
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">設定予算</p>
                  <p className="text-2xl font-semibold">¥{budget.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">収入合計</p>
                  <p className="text-2xl font-semibold text-green-600">¥{totalIncomes.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">支出合計</p>
                  <p className="text-2xl font-semibold text-destructive">¥{totalExpenses.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4">
                <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getBudgetColorClass(budgetPercentage)}`}
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  使用率: {budgetPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

