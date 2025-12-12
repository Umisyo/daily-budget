import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useIncomeForm } from '../../hooks/useIncomeForm'
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
  const {
    incomeAmount,
    setIncomeAmount,
    incomeDate,
    setIncomeDate,
    incomeDescription,
    setIncomeDescription,
    amountInputRef,
    isEditMode,
    handleSubmit,
  } = useIncomeForm({ income, onSubmit, isSubmitting, onCancel })

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

