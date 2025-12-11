import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import type { Tables } from '../types/supabase'

type Expense = Tables<'expenses'>

export function ExpensePage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expenseAmount, setExpenseAmount] = useState<string>('')
  const [expenseDate, setExpenseDate] = useState<string>('')
  const [expenseDescription, setExpenseDescription] = useState<string>('')

  useEffect(() => {
    if (!user) return

    const fetchExpenses = async () => {
      try {
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1

        // 現在の月の支出を取得
        const monthStart = new Date(currentYear, currentMonth - 1, 1)
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)

        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', monthStart.toISOString().split('T')[0])
          .lte('date', monthEnd.toISOString().split('T')[0])
          .order('date', { ascending: false })
          .order('created_at', { ascending: false })

        if (expensesError) {
          console.error('支出取得エラー:', expensesError)
        } else if (expensesData) {
          setExpenses(expensesData)
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchExpenses()

    // 日付フィールドの初期値を今日の日付に設定
    const today = new Date().toISOString().split('T')[0]
    setExpenseDate(today)
  }, [user])

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

    setIsSubmitting(true)
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
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const monthStart = new Date(currentYear, currentMonth - 1, 1)
      const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)

      const { data: expensesData, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (expensesData) {
        setExpenses(expensesData)
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
      setIsSubmitting(false)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('この支出を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      // データを再取得
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      const monthStart = new Date(currentYear, currentMonth - 1, 1)
      const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)

      const { data: expensesData, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (expensesData) {
        setExpenses(expensesData)
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

  const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">支出を登録</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitExpense} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-description">説明（任意）</Label>
                  <Input
                    id="expense-description"
                    type="text"
                    placeholder="例: 昼食代"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '登録中...' : '登録'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">支出一覧</CardTitle>
                <p className="text-sm text-muted-foreground">
                  合計: ¥{totalAmount.toLocaleString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">支出が登録されていません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-lg">
                            ¥{Number(expense.amount).toLocaleString()}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            <p>{new Date(expense.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            {expense.description && (
                              <p className="mt-1">{expense.description}</p>
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
            </CardContent>
          </Card>
    </div>
  )
}

