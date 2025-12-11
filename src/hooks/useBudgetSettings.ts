import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'

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

        const hashedUserId = await hashUserId(userId)
        const { data: settingsData, error: settingsError } = await supabase
          .from('budget_settings')
          .select('start_day')
          .eq('hashed_user_id', hashedUserId)
          .single()

        if (settingsError && settingsError.code !== 'PGRST116') {
          throw settingsError
        }

        if (settingsData) {
          setStartDay(settingsData.start_day)
        }
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
      const hashedUserId = await hashUserId(userId)

      // 既存の設定を確認
      const { data: existingSettings } = await supabase
        .from('budget_settings')
        .select('id')
        .eq('hashed_user_id', hashedUserId)
        .single()

      if (existingSettings) {
        // 更新
        const { error } = await supabase
          .from('budget_settings')
          .update({ start_day: day })
          .eq('id', existingSettings.id)

        if (error) throw error
      } else {
        // 新規作成
        const { error } = await supabase
          .from('budget_settings')
          .insert({
            hashed_user_id: hashedUserId,
            start_day: day,
          })

        if (error) throw error
      }

      setStartDay(day)
    } catch (err) {
      console.error('設定登録エラー:', err)
      throw err
    }
  }

  return { startDay, isLoading, error, updateStartDay }
}

