import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { calculateBudgetPeriod, formatBudgetPeriod } from '../utils/budgetPeriod'

export function BudgetPage() {
  const { user } = useAuth()
  const [budget, setBudget] = useState<number | null>(null)
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [dataLoading, setDataLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [budgetAmount, setBudgetAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDay, setStartDay] = useState<number>(1)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [settingsStartDay, setSettingsStartDay] = useState<string>('1')
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchBudgetData = async () => {
      try {
        // 予算期間設定を取得
        const { data: settingsData, error: settingsError } = await supabase
          .from('budget_settings')
          .select('start_day')
          .eq('user_id', user.id)
          .single()

        let currentStartDay = 1
        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('設定取得エラー:', settingsError)
        } else if (settingsData) {
          currentStartDay = settingsData.start_day
          setStartDay(currentStartDay)
          setSettingsStartDay(currentStartDay.toString())
        }

        // 予算期間を計算
        const now = new Date()
        const period = calculateBudgetPeriod(currentStartDay, now)

        // 予算期間に対応する予算を取得
        // 予算は開始月のyear/monthで保存されていると仮定
        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('amount')
          .eq('user_id', user.id)
          .eq('year', period.startYear)
          .eq('month', period.startMonth)
          .single()

        if (budgetError && budgetError.code !== 'PGRST116') {
          console.error('予算取得エラー:', budgetError)
        } else if (budgetData) {
          setBudget(Number(budgetData.amount))
        }

        // 予算期間内の支出合計を取得
        const periodStartStr = period.start.toISOString().split('T')[0]
        const periodEndStr = period.end.toISOString().split('T')[0]

        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', periodStartStr)
          .lte('date', periodEndStr)

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
      const period = calculateBudgetPeriod(startDay, now)

      // 既存の予算を確認
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('year', period.startYear)
        .eq('month', period.startMonth)
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
            year: period.startYear,
            month: period.startMonth,
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

  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const day = parseInt(settingsStartDay)
    if (isNaN(day) || day < 1 || day > 31) {
      alert('有効な日付（1-31）を入力してください')
      return
    }

    setIsSubmittingSettings(true)
    try {
      // 既存の設定を確認
      const { data: existingSettings } = await supabase
        .from('budget_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingSettings) {
        // 更新
        const { error } = await supabase
          .from('budget_settings')
          .update({ start_day: day })
          .eq('id', existingSettings.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('budget_settings')
          .insert({
            user_id: user.id,
            start_day: day,
          })

        if (error) throw error
      }

      setStartDay(day)
      setIsEditingSettings(false)
      
      // データを再取得
      window.location.reload()
    } catch (error) {
      console.error('設定登録エラー:', error)
      alert('設定の登録に失敗しました')
    } finally {
      setIsSubmittingSettings(false)
    }
  }

  const handleEditSettingsClick = () => {
    setIsEditingSettings(true)
    setSettingsStartDay(startDay.toString())
  }

  const handleCancelSettingsEdit = () => {
    setIsEditingSettings(false)
    setSettingsStartDay(startDay.toString())
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
  const remainingBudget = budget !== null ? budget - totalExpenses : null
  const budgetPercentage = budget !== null && budget > 0 ? (totalExpenses / budget) * 100 : 0

  return (
    <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl">
                    予算期間
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatBudgetPeriod(startDay, now)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isEditingSettings && (
                    <Button onClick={handleEditSettingsClick}>
                      期間設定
                    </Button>
                  )}
                  {budget !== null && !isEditing && !isEditingSettings && (
                    <Button onClick={handleEditClick}>
                      編集
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingSettings ? (
                <div className="py-4">
                  <form onSubmit={handleSubmitSettings} className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-2">
                      <Label htmlFor="start-day">予算期間の開始日（1-31）</Label>
                      <Input
                        id="start-day"
                        type="number"
                        min="1"
                        max="31"
                        step="1"
                        placeholder="例: 15"
                        value={settingsStartDay}
                        onChange={(e) => setSettingsStartDay(e.target.value)}
                        required
                        disabled={isSubmittingSettings}
                      />
                      <p className="text-xs text-muted-foreground">
                        例: 15を設定すると、毎月15日から翌月14日までが1期間となります
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        onClick={handleCancelSettingsEdit}
                        disabled={isSubmittingSettings}
                      >
                        キャンセル
                      </Button>
                      <Button type="submit" disabled={isSubmittingSettings}>
                        {isSubmittingSettings ? '保存中...' : '保存'}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : budget === null || isEditing ? (
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

