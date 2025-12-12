import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { Tables } from '../../types/supabase'

type Expense = Tables<'expenses'>

export type PaymentMethod = 'credit_card' | 'cash' | 'electronic_money' | 'other'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit_card', label: 'クレジットカード' },
  { value: 'cash', label: '現金' },
  { value: 'electronic_money', label: '電子マネー' },
  { value: 'other', label: 'その他' },
]

interface ExpenseFormProps {
  onSubmit: (amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null) => Promise<void>
  isSubmitting: boolean
  expense?: Expense | null
  onCancel?: () => void
  inline?: boolean
}

export function ExpenseForm({ onSubmit, isSubmitting, expense, onCancel, inline = false }: ExpenseFormProps) {
  const [expenseAmount, setExpenseAmount] = useState<string>('')
  const [expenseDate, setExpenseDate] = useState<string>('')
  const [expenseDescription, setExpenseDescription] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const amountInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!expense

  useEffect(() => {
    if (expense) {
      // 編集モード: 既存の支出データを初期値として設定
      setExpenseAmount(expense.amount.toString())
      setExpenseDate(expense.date)
      setExpenseDescription(expense.description || '')
      setPaymentMethod((expense.payment_method as PaymentMethod) || '')
      // 金額フィールドにフォーカス
      setTimeout(() => {
        amountInputRef.current?.focus()
      }, 0)
    } else {
      // 新規登録モード: 日付フィールドの初期値を今日の日付に設定
      const today = new Date().toISOString().split('T')[0]
      setExpenseDate(today)
      setExpenseAmount('')
      setExpenseDescription('')
      setPaymentMethod('')
    }
  }, [expense])

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
      await onSubmit(amount, expenseDate, expenseDescription, paymentMethod || null)
      // フォームをリセット（編集モードの場合はonCancelが呼ばれる）
      if (!isEditMode) {
        setExpenseAmount('')
        setExpenseDescription('')
        setPaymentMethod('')
        const today = new Date().toISOString().split('T')[0]
        setExpenseDate(today)
      }
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  return (
    <form onSubmit={handleSubmit} className={inline ? "space-y-4 p-3 border rounded-lg" : "space-y-4 mb-6 pb-6 border-b"}>
      <div className={inline ? "grid grid-cols-1 md:grid-cols-4 gap-3" : "grid grid-cols-1 md:grid-cols-4 gap-4"}>
        <div className="space-y-2">
          <Label htmlFor="expense-amount">金額（円）</Label>
          <Input
            ref={amountInputRef}
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
        <div className="space-y-2">
          <Label htmlFor="expense-payment-method">支払い方法（任意）</Label>
          <select
            id="expense-payment-method"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
            disabled={isSubmitting}
          >
            <option value="">選択してください</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditMode ? '更新中...' : '登録中...') : (isEditMode ? '更新' : '登録')}
        </Button>
      </div>
    </form>
  )
}

