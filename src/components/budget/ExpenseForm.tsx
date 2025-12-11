import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface ExpenseFormProps {
  onSubmit: (amount: number, date: string, description?: string) => Promise<void>
  isSubmitting: boolean
}

export function ExpenseForm({ onSubmit, isSubmitting }: ExpenseFormProps) {
  const [expenseAmount, setExpenseAmount] = useState<string>('')
  const [expenseDate, setExpenseDate] = useState<string>('')
  const [expenseDescription, setExpenseDescription] = useState<string>('')

  useEffect(() => {
    // 日付フィールドの初期値を今日の日付に設定
    const today = new Date().toISOString().split('T')[0]
    setExpenseDate(today)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(expenseAmount)
    if (isNaN(amount) || amount < 0) {
      alert('有効な金額を入力してください')
      return
    }

    if (!expenseDate) {
      alert('日付を入力してください')
      return
    }

    try {
      await onSubmit(amount, expenseDate, expenseDescription)
      // フォームをリセット
      setExpenseAmount('')
      setExpenseDescription('')
      const today = new Date().toISOString().split('T')[0]
      setExpenseDate(today)
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 pb-6 border-b">
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
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '登録中...' : '登録'}
        </Button>
      </div>
    </form>
  )
}

