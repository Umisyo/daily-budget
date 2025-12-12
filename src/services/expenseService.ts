import { supabase } from '../utils/supabase'
import { hashUserId } from '../utils/hashUserId'
import { calculateBudgetPeriod } from '../utils/budgetPeriod'
import type { Tables } from '../types/supabase'

type Expense = Tables<'expenses'>

/**
 * 支出データの取得
 */
export async function getExpenses(
  userId: string,
  startDay: number,
  referenceDate?: Date
): Promise<Expense[]> {
  const now = referenceDate || new Date()
  const period = calculateBudgetPeriod(startDay, now)
  const periodStartStr = period.start.toISOString().split('T')[0]
  const periodEndStr = period.end.toISOString().split('T')[0]

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
  paymentMethod?: string | null
): Promise<void> {
  const hashedUserId = await hashUserId(userId)

  const { error } = await supabase.from('expenses').insert({
    hashed_user_id: hashedUserId,
    amount,
    date,
    description: description || null,
    payment_method: paymentMethod || null,
  })

  if (error) throw error
}

/**
 * 支出データの更新
 */
export async function updateExpense(
  id: string,
  amount: number,
  date: string,
  description?: string,
  paymentMethod?: string | null
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
}

/**
 * 支出データの削除
 */
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) throw error
}

