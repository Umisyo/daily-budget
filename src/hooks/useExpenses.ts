import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import { calculateBudgetPeriod } from '../utils/budgetPeriod'
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

      const now = referenceDate || new Date()
      const period = calculateBudgetPeriod(startDay, now)
      const periodStartStr = period.start.toISOString().split('T')[0]
      const periodEndStr = period.end.toISOString().split('T')[0]

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', periodStartStr)
        .lte('date', periodEndStr)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (expensesError) {
        throw expensesError
      }

      if (expensesData) {
        setExpenses(expensesData)
        const total = expensesData.reduce((sum, expense) => sum + Number(expense.amount), 0)
        setTotalExpenses(total)
      }
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
      const hashedUserId = await hashUserId(userId)

      const { error } = await supabase
        .from('expenses')
        .insert({
          hashed_user_id: hashedUserId,
          amount,
          date,
          description: description || null,
          payment_method: paymentMethod || null,
        })

      if (error) throw error

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
      const { error } = await supabase
        .from('expenses')
        .update({
          amount,
          date,
          description: description || null,
          payment_method: paymentMethod || null,
        })
        .eq('id', id)

      if (error) throw error

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
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

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

