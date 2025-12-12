import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import { calculateBudgetPeriod } from '../utils/budgetPeriod'
import type { Tables } from '../types/supabase'

type Income = Tables<'incomes'>

export function useIncomes(userId: string | null, startDay: number, referenceDate?: Date) {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [totalIncomes, setTotalIncomes] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchIncomes = useCallback(async () => {
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

      const { data: incomesData, error: incomesError } = await supabase
        .from('incomes')
        .select('*')
        .gte('date', periodStartStr)
        .lte('date', periodEndStr)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (incomesError) {
        throw incomesError
      }

      if (incomesData) {
        setIncomes(incomesData)
        const total = incomesData.reduce((sum, income) => sum + Number(income.amount), 0)
        setTotalIncomes(total)
      }
    } catch (err) {
      console.error('収入取得エラー:', err)
      setError(err instanceof Error ? err : new Error('収入の取得に失敗しました'))
    } finally {
      setIsLoading(false)
    }
  }, [userId, startDay, referenceDate])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  const addIncome = async (amount: number, date: string, description?: string) => {
    if (!userId) return

    try {
      const hashedUserId = await hashUserId(userId)

      const { error } = await supabase
        .from('incomes')
        .insert({
          hashed_user_id: hashedUserId,
          amount,
          date,
          description: description || null,
        })

      if (error) throw error

      // データを再取得
      await fetchIncomes()
    } catch (err) {
      console.error('収入登録エラー:', err)
      throw err
    }
  }

  const updateIncome = async (id: string, amount: number, date: string, description?: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('incomes')
        .update({
          amount,
          date,
          description: description || null,
        })
        .eq('id', id)

      if (error) throw error

      // データを再取得
      await fetchIncomes()
    } catch (err) {
      console.error('収入更新エラー:', err)
      throw err
    }
  }

  const deleteIncome = async (id: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)

      if (error) throw error

      // データを再取得
      await fetchIncomes()
    } catch (err) {
      console.error('収入削除エラー:', err)
      throw err
    }
  }

  return {
    incomes,
    totalIncomes,
    isLoading,
    error,
    addIncome,
    updateIncome,
    deleteIncome,
    refetch: fetchIncomes,
  }
}

