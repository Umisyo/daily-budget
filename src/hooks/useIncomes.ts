import { useState, useEffect, useCallback } from 'react'
import * as incomeService from '../services/incomeService'
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

      const incomesData = await incomeService.getIncomes(userId, startDay, referenceDate)
      setIncomes(incomesData)
      const total = incomesData.reduce((sum, income) => sum + Number(income.amount), 0)
      setTotalIncomes(total)
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
      await incomeService.createIncome(userId, amount, date, description)
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
      await incomeService.updateIncome(id, amount, date, description)
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
      await incomeService.deleteIncome(id)
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

