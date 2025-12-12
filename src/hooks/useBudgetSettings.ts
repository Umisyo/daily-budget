import { useState, useEffect } from 'react'
import { getBudgetSettings, upsertBudgetSettings } from '../services/budgetSettingsService'

export function useBudgetSettings(userId: string | null) {
  const [startDay, setStartDay] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const settingsData = await getBudgetSettings(userId)
        setStartDay(settingsData)
      } catch (err) {
        console.error('設定取得エラー:', err)
        setError(err instanceof Error ? err : new Error('設定の取得に失敗しました'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [userId])

  const updateStartDay = async (day: number) => {
    if (!userId) return

    try {
      await upsertBudgetSettings(userId, day)
      setStartDay(day)
    } catch (err) {
      console.error('設定登録エラー:', err)
      throw err
    }
  }

  return { startDay, isLoading, error, updateStartDay }
}

