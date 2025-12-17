/**
 * グラフデータ生成に関するユーティリティ関数
 */

import { formatLocalDate } from './budgetPeriod'
import type { Tables } from '../types/supabase'

type Expense = Tables<'expenses'>
type Income = Tables<'incomes'>

export interface ChartDataPoint {
  date: string // YYYY-MM-DD形式
  dateLabel: string // M/D形式（表示用）
  actualExpense: number // 純支出（累積支出 - 累積収入）
  budgetLine: number | null // 累積予算使用量（予算がnullの場合はnull）
}

/**
 * 期間内の全日付を生成
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 日付文字列の配列（YYYY-MM-DD形式）
 */
function generateDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  
  // 時刻をリセットして日付のみで比較
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  
  while (current <= end) {
    dates.push(formatLocalDate(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * 日付文字列をM/D形式に変換
 * @param dateStr YYYY-MM-DD形式の日付文字列
 * @returns M/D形式の文字列
 */
function formatDateForLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number)
  return `${month}/${day}`
}

/**
 * グラフ用データを生成
 * @param periodStart 予算期間の開始日
 * @param periodEnd 予算期間の終了日
 * @param budget 予算額（nullの場合は予算線を表示しない）
 * @param expenses 支出データ配列
 * @param incomes 収入データ配列
 * @returns グラフ用データポイントの配列
 */
export function generateChartData(
  periodStart: Date,
  periodEnd: Date,
  budget: number | null,
  expenses: Expense[],
  incomes: Income[]
): ChartDataPoint[] {
  // 期間内の全日付を生成
  const dateRange = generateDateRange(periodStart, periodEnd)
  
  // 期間の日数を計算
  const periodDays = dateRange.length
  
  // 1日あたりの予算を計算（予算がnullの場合はnull）
  const dailyBudget = budget !== null ? budget / periodDays : null
  
  // 日付ごとの支出を集計（日付文字列をキーとして）
  const expensesByDate = new Map<string, number>()
  for (const expense of expenses) {
    const date = expense.date
    const current = expensesByDate.get(date) || 0
    expensesByDate.set(date, current + Number(expense.amount))
  }
  
  // 日付ごとの収入を集計（日付文字列をキーとして）
  const incomesByDate = new Map<string, number>()
  for (const income of incomes) {
    const date = income.date
    const current = incomesByDate.get(date) || 0
    incomesByDate.set(date, current + Number(income.amount))
  }
  
  // グラフデータポイントを生成
  const chartData: ChartDataPoint[] = []
  let cumulativeExpense = 0
  let cumulativeIncome = 0
  
  for (let i = 0; i < dateRange.length; i++) {
    const dateStr = dateRange[i]
    const dayExpense = expensesByDate.get(dateStr) || 0
    const dayIncome = incomesByDate.get(dateStr) || 0
    cumulativeExpense += dayExpense
    cumulativeIncome += dayIncome
    
    // 純支出を計算（累積支出 - 累積収入）
    const netExpense = cumulativeExpense - cumulativeIncome
    
    // 累積予算使用量を計算（経過日数 = i + 1）
    const cumulativeBudget = dailyBudget !== null ? dailyBudget * (i + 1) : null
    
    chartData.push({
      date: dateStr,
      dateLabel: formatDateForLabel(dateStr),
      actualExpense: netExpense,
      budgetLine: cumulativeBudget,
    })
  }
  
  return chartData
}
