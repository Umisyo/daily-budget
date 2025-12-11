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

