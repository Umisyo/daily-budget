import { useState, useEffect, useRef } from 'react'
import { validateAmount, validateDate } from '../utils/validation'
import { showError } from '../utils/errorHandler'
import type { Tables } from '../types/supabase'
import type { PaymentMethod } from '../constants'

type Expense = Tables<'expenses'>

interface UseExpenseFormOptions {
  expense?: Expense | null
  onSubmit: (amount: number, date: string, description?: string, paymentMethod?: PaymentMethod | null) => Promise<void>
  isSubmitting: boolean
  onCancel?: () => void
}

export function useExpenseForm({ expense, onSubmit, isSubmitting: _isSubmitting, onCancel: _onCancel }: UseExpenseFormOptions) {
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

    const amountValidation = validateAmount(expenseAmount)
    if (!amountValidation.isValid) {
      if (amountValidation.errorMessage) {
        showError(amountValidation.errorMessage)
      }
      return
    }

    const dateValidation = validateDate(expenseDate)
    if (!dateValidation.isValid) {
      if (dateValidation.errorMessage) {
        showError(dateValidation.errorMessage)
      }
      return
    }

    const amount = parseFloat(expenseAmount)
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

  return {
    expenseAmount,
    setExpenseAmount,
    expenseDate,
    setExpenseDate,
    expenseDescription,
    setExpenseDescription,
    paymentMethod,
    setPaymentMethod,
    amountInputRef,
    isEditMode,
    handleSubmit,
  }
}

