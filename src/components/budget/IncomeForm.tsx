import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { Tables } from '../../types/supabase'

type Income = Tables<'incomes'>

interface IncomeFormProps {
  onSubmit: (amount: number, date: string, description?: string) => Promise<void>
  isSubmitting: boolean
  income?: Income | null
  onCancel?: () => void
  inline?: boolean
}

export function IncomeForm({ onSubmit, isSubmitting, income, onCancel, inline = false }: IncomeFormProps) {
  const [incomeAmount, setIncomeAmount] = useState<string>('')
  const [incomeDate, setIncomeDate] = useState<string>('')
  const [incomeDescription, setIncomeDescription] = useState<string>('')
  const amountInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!income

  useEffect(() => {
    if (income) {
      // 編集モード: 既存の収入データを初期値として設定
      setIncomeAmount(income.amount.toString())
      setIncomeDate(income.date)
      setIncomeDescription(income.description || '')
      // 金額フィールドにフォーカス
      setTimeout(() => {
        amountInputRef.current?.focus()
      }, 0)
    } else {
      // 新規登録モード: 日付フィールドの初期値を今日の日付に設定
      const today = new Date().toISOString().split('T')[0]
      setIncomeDate(today)
      setIncomeAmount('')
      setIncomeDescription('')
    }
  }, [income])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(incomeAmount)
    if (isNaN(amount) || amount < 0) {
      alert('有効な金額を入力してください')
      return
    }

    if (!incomeDate) {
      alert('日付を入力してください')
      return
    }

    try {
      await onSubmit(amount, incomeDate, incomeDescription)
      // フォームをリセット（編集モードの場合はonCancelが呼ばれる）
      if (!isEditMode) {
        setIncomeAmount('')
        setIncomeDescription('')
        const today = new Date().toISOString().split('T')[0]
        setIncomeDate(today)
      }
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  return (
    <form onSubmit={handleSubmit} className={inline ? "space-y-4 p-3 border rounded-lg" : "space-y-4 mb-6 pb-6 border-b"}>
      <div className={inline ? "grid grid-cols-1 md:grid-cols-3 gap-3" : "grid grid-cols-1 md:grid-cols-3 gap-4"}>
        <div className="space-y-2">
          <Label htmlFor="income-amount">金額（円）</Label>
          <Input
            ref={amountInputRef}
            id="income-amount"
            type="number"
            min="0"
            step="1"
            placeholder="例: 30000"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="income-date">日付</Label>
          <Input
            id="income-date"
            type="date"
            value={incomeDate}
            onChange={(e) => setIncomeDate(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="income-description">説明（任意）</Label>
          <Input
            id="income-description"
            type="text"
            placeholder="例: 給与"
            value={incomeDescription}
            onChange={(e) => setIncomeDescription(e.target.value)}
            disabled={isSubmitting}
          />
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

