import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'

/**
 * 予算設定の取得
 */
export async function getBudgetSettings(userId: string): Promise<number> {
  const hashedUserId = await hashUserId(userId)

  const { data: settingsData, error: settingsError } = await supabase
    .from('budget_settings')
    .select('start_day')
    .eq('hashed_user_id', hashedUserId)
    .single()

  if (settingsError && settingsError.code !== 'PGRST116') {
    throw settingsError
  }

  return settingsData?.start_day ?? 1
}

/**
 * 予算設定の作成または更新
 */
export async function upsertBudgetSettings(userId: string, startDay: number): Promise<void> {
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
      .update({ start_day: startDay })
      .eq('id', existingSettings.id)

    if (error) throw error
  } else {
    // 新規作成
    const { error } = await supabase.from('budget_settings').insert({
      hashed_user_id: hashedUserId,
      start_day: startDay,
    })

    if (error) throw error
  }
}

