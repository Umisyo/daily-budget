import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function BudgetPage() {
  const { user } = useAuth()
  const [budget, setBudget] = useState<number | null>(null)
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [budgetAmount, setBudgetAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchBudgetData = async () => {
      try {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1

        // 現在の月の予算を取得
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('amount')
          .eq('user_id', user.id)
          .eq('year', currentYear)
          .eq('month', currentMonth)
          .single()

        if (budgetError && budgetError.code !== 'PGRST116') {
          console.error('予算取得エラー:', budgetError)
        } else if (budgetData) {
          setBudget(Number(budgetData.amount))
        }

        // 現在の月の支出合計を取得
        const monthStart = new Date(currentYear, currentMonth - 1, 1)
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)

        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString().split('T')[0])
          .lte('date', monthEnd.toISOString().split('T')[0])

        if (expensesError) {
          console.error('支出取得エラー:', expensesError)
        } else if (expensesData) {
          const total = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0)
          setTotalExpenses(total)
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchBudgetData()
  }, [user])

  const handleSubmitBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const amount = parseFloat(budgetAmount)
    if (isNaN(amount) || amount < 0) {
      alert('有効な金額を入力してください')
      return
    }

    setIsSubmitting(true)
    try {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      // 既存の予算を確認
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .single()

      if (existingBudget) {
        // 更新
        const { error } = await supabase
          .from('budgets')
          .update({ amount, updated_at: new Date().toISOString() })
          .eq('id', existingBudget.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('budgets')
          .insert({
            user_id: user.id,
            year: currentYear,
            month: currentMonth,
            amount,
          })

        if (error) throw error
      }

      // データを再取得
      setBudget(amount)
      setIsEditing(false)
      setBudgetAmount('')
    } catch (error) {
      console.error('予算登録エラー:', error)
      alert('予算の登録に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setBudgetAmount(budget?.toString() || '')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setBudgetAmount('')
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

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const remainingBudget = budget !== null ? budget - totalExpenses : null
  const budgetPercentage = budget !== null && budget > 0 ? (totalExpenses / budget) * 100 : 0

  return (
    <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                  {currentYear}年{currentMonth}月の予算
                </CardTitle>
                {budget !== null && !isEditing && (
                  <Button onClick={handleEditClick}>
                    編集
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {budget === null || isEditing ? (
                <div className="py-8">
                  <form onSubmit={handleSubmitBudget} className="space-y-4 max-w-md mx-auto">
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
                      <p className={`text-6xl font-bold ${remainingBudget !== null && remainingBudget < 0 ? 'text-destructive' : 'text-primary'}`}>
                        ¥{remainingBudget !== null ? remainingBudget.toLocaleString() : '0'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">設定予算</p>
                        <p className="text-2xl font-semibold">¥{budget.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">消費金額</p>
                        <p className="text-2xl font-semibold">¥{totalExpenses.toLocaleString()}</p>
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
    </div>
  )
}

