import { useState, useEffect, useCallback } from 'react'
import * as expenseService from '../services/expenseService'
import type { Tables } from '../types/supabase'

type Expense = Tables<'expenses'>

export function useExpenses(userId: string | null, startDay: number, referenceDate?: Date) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const expensesData = await expenseService.getExpenses(userId, startDay, referenceDate)
      setExpenses(expensesData)
      const total = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0)
      setTotalExpenses(total)
    } catch (err) {
      console.error('支出取得エラー:', err)
      setError(err instanceof Error ? err : new Error('支出の取得に失敗しました'))
    } finally {
      setIsLoading(false)
    }
  }, [userId, startDay, referenceDate])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = async (amount: number, date: string, description?: string, paymentMethod?: string | null) => {
    if (!userId) return

    try {
      await expenseService.createExpense(userId, amount, date, description, paymentMethod)
      // データを再取得
      await fetchExpenses()
    } catch (err) {
      console.error('支出登録エラー:', err)
      throw err
    }
  }

  const updateExpense = async (id: string, amount: number, date: string, description?: string, paymentMethod?: string | null) => {
    if (!userId) return

    try {
      await expenseService.updateExpense(id, amount, date, description, paymentMethod)
      // データを再取得
      await fetchExpenses()
    } catch (err) {
      console.error('支出更新エラー:', err)
      throw err
    }
  }

  const deleteExpense = async (id: string) => {
    if (!userId) return

    try {
      await expenseService.deleteExpense(id)
      // データを再取得
      await fetchExpenses()
    } catch (err) {
      console.error('支出削除エラー:', err)
      throw err
    }
  }

  return {
    expenses,
    totalExpenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}

