import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import { calculateBudgetPeriod } from '../utils/budgetPeriod'

/**
 * 予算データの取得
 */
export async function getBudget(
  userId: string,
  startDay: number,
  referenceDate?: Date
): Promise<number | null> {
  const hashedUserId = await hashUserId(userId)
  const now = referenceDate || new Date()
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

  return budgetData ? Number(budgetData.amount) : null
}

/**
 * 予算データの作成または更新
 */
export async function upsertBudget(
  userId: string,
  amount: number,
  startDay: number,
  referenceDate?: Date
): Promise<void> {
  const hashedUserId = await hashUserId(userId)
  const now = referenceDate || new Date()
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
    const { error } = await supabase.from('budgets').insert({
      hashed_user_id: hashedUserId,
      year: period.startYear,
      month: period.startMonth,
      amount,
    })

    if (error) throw error
  }
}

