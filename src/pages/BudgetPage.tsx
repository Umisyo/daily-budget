import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { calculateBudgetPeriod, formatBudgetPeriod } from '../utils/budgetPeriod'
import type { Tables } from '../types/supabase'

type Expense = Tables<'expenses'>

export function BudgetPage() {
  const { user } = useAuth()
  const [budget, setBudget] = useState<number | null>(null)
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [budgetAmount, setBudgetAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startDay, setStartDay] = useState<number>(1)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [settingsStartDay, setSettingsStartDay] = useState<string>('1')
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false)
  const [showAllExpenses, setShowAllExpenses] = useState(false)
  const [expenseAmount, setExpenseAmount] = useState<string>('')
  const [expenseDate, setExpenseDate] = useState<string>('')
  const [expenseDescription, setExpenseDescription] = useState<string>('')
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false)

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

        // 予算期間内の支出を取得
        const periodStartStr = period.start.toISOString().split('T')[0]
        const periodEndStr = period.end.toISOString().split('T')[0]

        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', periodStartStr)
          .lte('date', periodEndStr)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })

        if (expensesError) {
          console.error('支出取得エラー:', expensesError)
        } else if (expensesData) {
          setExpenses(expensesData)
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

    // 日付フィールドの初期値を今日の日付に設定
    const today = new Date().toISOString().split('T')[0]
    setExpenseDate(today)
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

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const amount = parseFloat(expenseAmount)
    if (isNaN(amount) || amount < 0) {
      alert('有効な金額を入力してください')
      return
    }

    if (!expenseDate) {
      alert('日付を入力してください')
      return
    }

    setIsSubmittingExpense(true)
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount,
          date: expenseDate,
          description: expenseDescription || null,
        })

      if (error) throw error

      // データを再取得
      const now = new Date()
      const period = calculateBudgetPeriod(startDay, now)
      const periodStartStr = period.start.toISOString().split('T')[0]
      const periodEndStr = period.end.toISOString().split('T')[0]

      const { data: expensesData, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', periodStartStr)
        .lte('date', periodEndStr)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (expensesData) {
        setExpenses(expensesData)
        const total = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0)
        setTotalExpenses(total)
      }

      // フォームをリセット
      setExpenseAmount('')
      setExpenseDescription('')
      const today = new Date().toISOString().split('T')[0]
      setExpenseDate(today)
    } catch (error) {
      console.error('支出登録エラー:', error)
      alert('支出の登録に失敗しました')
    } finally {
      setIsSubmittingExpense(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('この支出を削除しますか？')) return
    if (!user) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      // データを再取得
      const now = new Date()
      const period = calculateBudgetPeriod(startDay, now)
      const periodStartStr = period.start.toISOString().split('T')[0]
      const periodEndStr = period.end.toISOString().split('T')[0]

      const { data: expensesData, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', periodStartStr)
        .lte('date', periodEndStr)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (expensesData) {
        setExpenses(expensesData)
        const total = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0)
        setTotalExpenses(total)
      }
    } catch (error) {
      console.error('支出削除エラー:', error)
      alert('支出の削除に失敗しました')
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

          {/* 支出リスト */}
          {budget !== null && !isEditing && !isEditingSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">支出リスト</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 支出登録フォーム */}
                <form onSubmit={handleSubmitExpense} className="space-y-4 mb-6 pb-6 border-b">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expense-amount">金額（円）</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="例: 1500"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        required
                        disabled={isSubmittingExpense}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense-date">日付</Label>
                      <Input
                        id="expense-date"
                        type="date"
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        required
                        disabled={isSubmittingExpense}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense-description">説明（任意）</Label>
                      <Input
                        id="expense-description"
                        type="text"
                        placeholder="例: 昼食代"
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        disabled={isSubmittingExpense}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmittingExpense}>
                      {isSubmittingExpense ? '登録中...' : '登録'}
                    </Button>
                  </div>
                </form>

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
                            <p>{new Date(expense.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            {expense.description && (
                              <p>{expense.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        削除
                      </Button>
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
                      {showAllExpenses ? '折りたたむ' : `残り${expenses.length - 10}件を表示`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
    </div>
  )
}

