import { useState, useEffect } from 'react'
import { getBudget, upsertBudget } from '../services/budgetService'

export function useBudgetData(userId: string | null, startDay: number, referenceDate?: Date) {
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

        const budgetData = await getBudget(userId, startDay, referenceDate)
        setBudget(budgetData)
      } catch (err) {
        console.error('予算取得エラー:', err)
        setError(err instanceof Error ? err : new Error('予算の取得に失敗しました'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBudget()
  }, [userId, startDay, referenceDate])

  const updateBudget = async (amount: number) => {
    if (!userId) return

    try {
      await upsertBudget(userId, amount, startDay, referenceDate)
      setBudget(amount)
    } catch (err) {
      console.error('予算登録エラー:', err)
      throw err
    }
  }

  return { budget, isLoading, error, updateBudget }
}

