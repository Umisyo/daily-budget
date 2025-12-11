import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import { calculateBudgetPeriod } from '../utils/budgetPeriod'

export function useBudgetData(userId: string | null, startDay: number) {
  const [budget, setBudget] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchBudget = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const hashedUserId = await hashUserId(userId)
        const now = new Date()
        const period = calculateBudgetPeriod(startDay, now)

        const { data: budgetData, error: budgetError } = await supabase
          .from('budgets')
          .select('amount')
          .eq('hashed_user_id', hashedUserId)
          .eq('year', period.startYear)
          .eq('month', period.startMonth)
          .single()

        if (budgetError && budgetError.code !== 'PGRST116') {
          throw budgetError
        }

        if (budgetData) {
          setBudget(Number(budgetData.amount))
        } else {
          setBudget(null)
        }
      } catch (err) {
        console.error('予算取得エラー:', err)
        setError(err instanceof Error ? err : new Error('予算の取得に失敗しました'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBudget()
  }, [userId, startDay])

  const updateBudget = async (amount: number) => {
    if (!userId) return

    try {
      const hashedUserId = await hashUserId(userId)
      const now = new Date()
      const period = calculateBudgetPeriod(startDay, now)

      // 既存の予算を確認
      const { data: existingBudget } = await supabase
        .from('budgets')
        .select('id')
        .eq('hashed_user_id', hashedUserId)
        .eq('year', period.startYear)
        .eq('month', period.startMonth)
        .single()

      if (existingBudget) {
        // 更新
        const { error } = await supabase
          .from('budgets')
          .update({ amount, updated_at: new Date().toISOString() })
          .eq('id', existingBudget.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('budgets')
          .insert({
            hashed_user_id: hashedUserId,
            year: period.startYear,
            month: period.startMonth,
            amount,
          })

        if (error) throw error
      }

      setBudget(amount)
    } catch (err) {
      console.error('予算登録エラー:', err)
      throw err
    }
  }

  return { budget, isLoading, error, updateBudget }
}

