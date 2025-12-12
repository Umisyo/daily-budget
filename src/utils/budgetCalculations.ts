/**
 * 予算計算に関するユーティリティ関数
 */

/**
 * 残り予算を計算
 * @param budget 設定された予算
 * @param totalIncomes 収入合計
 * @param totalExpenses 支出合計
 * @returns 残り予算（nullの場合はnullを返す）
 */
export function calculateRemainingBudget(
  budget: number | null,
  totalIncomes: number,
  totalExpenses: number
): number | null {
  if (budget === null) return null
  return budget + totalIncomes - totalExpenses
}

/**
 * 利用可能な予算を計算（予算 + 収入）
 * @param budget 設定された予算
 * @param totalIncomes 収入合計
 * @returns 利用可能な予算
 */
export function calculateAvailableBudget(
  budget: number | null,
  totalIncomes: number
): number {
  if (budget === null) return 0
  return budget + totalIncomes
}

/**
 * 予算の使用率を計算
 * @param totalExpenses 支出合計
 * @param availableBudget 利用可能な予算
 * @returns 使用率（パーセンテージ、0-100）
 */
export function calculateBudgetPercentage(
  totalExpenses: number,
  availableBudget: number
): number {
  if (availableBudget <= 0) return 0
  return (totalExpenses / availableBudget) * 100
}

/**
 * 1日あたりの予算を計算
 * @param remainingBudget 残り予算
 * @param remainingDays 残り日数
 * @returns 1日あたりの予算（nullの場合はnullを返す）
 */
export function calculateDailyBudget(
  remainingBudget: number | null,
  remainingDays: number
): number | null {
  if (remainingBudget === null || remainingDays <= 0) return null
  return remainingBudget / remainingDays
}

/**
 * 予算の使用状況に基づいて色を決定
 * @param budgetPercentage 予算の使用率（パーセンテージ）
 * @returns 色クラス名
 */
export function getBudgetColorClass(budgetPercentage: number): string {
  if (budgetPercentage > 100) return 'bg-destructive'
  if (budgetPercentage > 80) return 'bg-yellow-500'
  return 'bg-primary'
}

/**
 * 残り予算がマイナスかどうかを判定
 * @param remainingBudget 残り予算
 * @returns マイナスの場合true
 */
export function isBudgetOverdrawn(remainingBudget: number | null): boolean {
  if (remainingBudget === null) return false
  return remainingBudget < 0
}

