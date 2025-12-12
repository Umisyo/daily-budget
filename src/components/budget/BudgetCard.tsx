import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { formatBudgetPeriod, getRemainingDays } from '../../utils/budgetPeriod'

interface BudgetCardProps {
  budget: number | null
  totalExpenses: number
  totalIncomes: number
  startDay: number
  referenceDate?: Date
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

    const amount = parseFloat(budgetAmount)
    if (isNaN(amount) || amount < 0) {
      alert('有効な金額を入力してください')
      return
    }

    try {
      await onSubmit(amount)
      setBudgetAmount('')
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  const now = referenceDate || new Date()
  // 残り予算 = 予算 + 収入合計 - 支出合計
  const remainingBudget = budget !== null ? budget + totalIncomes - totalExpenses : null
  // 使用率の計算: 支出 / (予算 + 収入)
  const availableBudget = budget !== null ? budget + totalIncomes : 0
  const budgetPercentage = availableBudget > 0 ? (totalExpenses / availableBudget) * 100 : 0
  const remainingDays = getRemainingDays(startDay, now)
  const dailyBudget = remainingBudget !== null && remainingDays > 0 ? remainingBudget / remainingDays : null

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">予算期間</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatBudgetPeriod(startDay, now)}
            </p>
          </div>
          <div className="flex gap-2 self-center sm:self-auto">
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
                    remainingBudget !== null && remainingBudget < 0
                      ? 'text-destructive'
                      : 'text-primary'
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
                    className={`h-full transition-all duration-300 ${
                      budgetPercentage > 100
                        ? 'bg-destructive'
                        : budgetPercentage > 80
                        ? 'bg-yellow-500'
                        : 'bg-primary'
                    }`}
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

