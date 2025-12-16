import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import { calculateBudgetPeriod, formatLocalDate } from '../utils/budgetPeriod'
import { updateExpenseTags } from './tagService'
import type { Tables } from '../types/supabase'

type Expense = Tables<'expenses'>

/**
 * 支出データの取得
 * @param _userId ユーザーID（将来のRLS実装用に保持）
 */
export async function getExpenses(
  _userId: string,
  startDay: number,
  referenceDate?: Date
): Promise<Expense[]> {
  const now = referenceDate || new Date()
  const period = calculateBudgetPeriod(startDay, now)
  const periodStartStr = formatLocalDate(period.start)
  const periodEndStr = formatLocalDate(period.end)

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

  return expensesData || []
}

/**
 * 支出データの作成
 */
export async function createExpense(
  userId: string,
  amount: number,
  date: string,
  description?: string,
  paymentMethod?: string | null,
  tagIds?: string[]
): Promise<string> {
  const hashedUserId = await hashUserId(userId)

  const { data, error } = await supabase
    .from('expenses')
    .insert({
      hashed_user_id: hashedUserId,
      amount,
      date,
      description: description || null,
      payment_method: paymentMethod || null,
    })
    .select('id')
    .single()

  if (error) throw error

  // タグを関連付け
  if (data?.id && tagIds && tagIds.length > 0) {
    await updateExpenseTags(data.id, tagIds)
  }

  return data.id
}

/**
 * 支出データの更新
 */
export async function updateExpense(
  id: string,
  amount: number,
  date: string,
  description?: string,
  paymentMethod?: string | null,
  tagIds?: string[]
): Promise<void> {
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

  // タグを更新
  if (tagIds !== undefined) {
    await updateExpenseTags(id, tagIds)
  }
}

/**
 * 支出データの削除
 */
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) throw error
}

