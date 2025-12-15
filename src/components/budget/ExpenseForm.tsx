import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useExpenseForm } from '../../hooks/useExpenseForm'
import { TagSelector } from './TagSelector'
import { PAYMENT_METHODS } from '../../constants'
import { useAuth } from '../../contexts/AuthContext'
import * as tagService from '../../services/tagService'
import type { PaymentMethod } from '../../constants'
import type { Tables } from '../../types/supabase'

type Expense = Tables<'expenses'>

interface ExpenseFormProps {
  onSubmit: (amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null, tagIds?: string[]) => Promise<void>
  isSubmitting: boolean
  expense?: Expense | null
  onCancel?: () => void
  inline?: boolean
}

export function ExpenseForm({ onSubmit, isSubmitting, expense, onCancel, inline = false }: ExpenseFormProps) {
  const { user } = useAuth()
  const [initialTagIds, setInitialTagIds] = useState<string[]>([])

  // 編集モードの場合、既存のタグを取得
  useEffect(() => {
    if (expense?.id && user?.id) {
      tagService
        .getTagsForExpense(expense.id)
        .then((tags) => {
          setInitialTagIds(tags.map((tag) => tag.id))
        })
        .catch((error) => {
          console.error('タグの取得に失敗しました:', error)
        })
    } else {
      setInitialTagIds([])
    }
  }, [expense?.id, user?.id])

  const {
    expenseAmount,
    setExpenseAmount,
    expenseDate,
    setExpenseDate,
    expenseDescription,
    setExpenseDescription,
    paymentMethod,
    setPaymentMethod,
    selectedTagIds,
    setSelectedTagIds,
    amountInputRef,
    isEditMode,
    handleSubmit,
  } = useExpenseForm({ expense, onSubmit, isSubmitting, onCancel, initialTagIds })

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
      {user?.id && (
        <div className="mt-4">
          <TagSelector
            userId={user.id}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            disabled={isSubmitting}
          />
        </div>
      )}
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

