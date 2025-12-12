import { useState, useEffect, useRef } from 'react'
import { validateAmount, validateDate } from '../utils/validation'
import { showError } from '../utils/errorHandler'
import type { Tables } from '../types/supabase'

type Income = Tables<'incomes'>

interface UseIncomeFormOptions {
  income?: Income | null
  onSubmit: (amount: number, date: string, description?: string) => Promise<void>
  isSubmitting: boolean
  onCancel?: () => void
}

export function useIncomeForm({ income, onSubmit, isSubmitting: _isSubmitting, onCancel: _onCancel }: UseIncomeFormOptions) {
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

    const amountValidation = validateAmount(incomeAmount)
    if (!amountValidation.isValid) {
      if (amountValidation.errorMessage) {
        showError(amountValidation.errorMessage)
      }
      return
    }

    const dateValidation = validateDate(incomeDate)
    if (!dateValidation.isValid) {
      if (dateValidation.errorMessage) {
        showError(dateValidation.errorMessage)
      }
      return
    }

    const amount = parseFloat(incomeAmount)
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

  return {
    incomeAmount,
    setIncomeAmount,
    incomeDate,
    setIncomeDate,
    incomeDescription,
    setIncomeDescription,
    amountInputRef,
    isEditMode,
    handleSubmit,
  }
}

