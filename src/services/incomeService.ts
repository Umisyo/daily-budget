import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import { calculateBudgetPeriod, formatLocalDate } from '../utils/budgetPeriod'
import type { Tables } from '../types/supabase'

type Income = Tables<'incomes'>

/**
 * 収入データの取得
 * @param _userId ユーザーID（将来のRLS実装用に保持）
 */
export async function getIncomes(
  _userId: string,
  startDay: number,
  referenceDate?: Date
): Promise<Income[]> {
  const now = referenceDate || new Date()
  const period = calculateBudgetPeriod(startDay, now)
  const periodStartStr = formatLocalDate(period.start)
  const periodEndStr = formatLocalDate(period.end)

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

  return incomesData || []
}

/**
 * 収入データの作成
 */
export async function createIncome(
  userId: string,
  amount: number,
  date: string,
  description?: string
): Promise<void> {
  const hashedUserId = await hashUserId(userId)

  const { error } = await supabase.from('incomes').insert({
    hashed_user_id: hashedUserId,
    amount,
    date,
    description: description || null,
  })

  if (error) throw error
}

/**
 * 収入データの更新
 */
export async function updateIncome(
  id: string,
  amount: number,
  date: string,
  description?: string
): Promise<void> {
  const { error } = await supabase
    .from('incomes')
    .update({
      amount,
      date,
      description: description || null,
    })
    .eq('id', id)

  if (error) throw error
}

/**
 * 収入データの削除
 */
export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('incomes').delete().eq('id', id)

  if (error) throw error
}

