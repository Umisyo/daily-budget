/**
 * 予算期間を計算するユーティリティ関数
 * @param startDay 予算期間の開始日（1-31）
 * @param referenceDate 基準日（デフォルトは今日）
 * @returns 予算期間の開始日と終了日
 */
export function calculateBudgetPeriod(startDay: number, referenceDate: Date = new Date()) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth() + 1
  const day = referenceDate.getDate()

  let periodStart: Date
  let periodEnd: Date

  if (day >= startDay) {
    // 今日が開始日以降の場合、今月の開始日から来月の開始日の前日まで
    periodStart = new Date(year, month - 1, startDay)
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    periodEnd = new Date(nextYear, nextMonth - 1, startDay - 1)
  } else {
    // 今日が開始日より前の場合、先月の開始日から今月の開始日の前日まで
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    periodStart = new Date(prevYear, prevMonth - 1, startDay)
    periodEnd = new Date(year, month - 1, startDay - 1)
  }

  return {
    start: periodStart,
    end: periodEnd,
    startYear: periodStart.getFullYear(),
    startMonth: periodStart.getMonth() + 1,
    endYear: periodEnd.getFullYear(),
    endMonth: periodEnd.getMonth() + 1,
  }
}

/**
 * 予算期間の表示用文字列を生成
 */
export function formatBudgetPeriod(startDay: number, referenceDate: Date = new Date()) {
  const period = calculateBudgetPeriod(startDay, referenceDate)
  const startStr = `${period.startYear}年${period.startMonth}月${period.start.getDate()}日`
  const endStr = `${period.endYear}年${period.endMonth}月${period.end.getDate()}日`
  return `${startStr} 〜 ${endStr}`
}

/**
 * 予算期間の残り日数を計算
 * @param startDay 予算期間の開始日（1-31）
 * @param referenceDate 基準日（デフォルトは今日）
 * @returns 残り日数（今日を含む）
 */
export function getRemainingDays(startDay: number, referenceDate: Date = new Date()) {
  const period = calculateBudgetPeriod(startDay, referenceDate)
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
  const endDate = new Date(period.end.getFullYear(), period.end.getMonth(), period.end.getDate())
  
  // ミリ秒を日数に変換（今日を含むため+1）
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  
  return Math.max(0, diffDays)
}

/**
 * 指定された年月の予算期間を計算
 * @param startDay 予算期間の開始日（1-31）
 * @param year 年
 * @param month 月（1-12）
 * @returns 予算期間の開始日と終了日
 */
export function calculateBudgetPeriodForMonth(startDay: number, year: number, month: number) {
  // 指定された年月の15日を基準日として期間を計算
  const referenceDate = new Date(year, month - 1, 15)
  return calculateBudgetPeriod(startDay, referenceDate)
}

/**
 * 利用可能な期間のリストを生成
 * @param startDay 予算期間の開始日（1-31）
 * @param monthsBack 過去何ヶ月分を取得するか（デフォルトは12）
 * @returns 期間のリスト（年、月、期間の開始日・終了日を含む）
 */
export function getAvailablePeriods(startDay: number, monthsBack: number = 12) {
  const now = new Date()
  const periods: Array<{
    year: number
    month: number
    period: ReturnType<typeof calculateBudgetPeriod>
  }> = []

  for (let i = monthsBack; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 15)
    const period = calculateBudgetPeriod(startDay, date)
    
    // 重複を避ける（同じ年・月の組み合わせが既に存在する場合はスキップ）
    const exists = periods.some(
      (p) => p.year === period.startYear && p.month === period.startMonth
    )
    
    if (!exists) {
      periods.push({
        year: period.startYear,
        month: period.startMonth,
        period,
      })
    }
  }

  return periods
}

