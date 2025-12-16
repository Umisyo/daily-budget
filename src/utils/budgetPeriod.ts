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
    periodEnd = new Date(nextYear, nextMonth - 1, startDay - 1, 23, 59, 59, 999)
  } else {
    // 今日が開始日より前の場合、先月の開始日から今月の開始日の前日まで
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    periodStart = new Date(prevYear, prevMonth - 1, startDay)
    periodEnd = new Date(year, month - 1, startDay - 1, 23, 59, 59, 999)
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
 * ローカル時間で日付文字列を生成（YYYY-MM-DD形式）
 * toISOString()はUTC時間を返すため、タイムゾーンの問題を避けるために使用
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

/**
 * 期間を短い形式でフォーマット（M/D-M/D形式）
 * @param period 予算期間オブジェクト
 * @returns フォーマットされた期間文字列（例: "11/16-12/15"）
 */
export function formatPeriodShort(period: ReturnType<typeof calculateBudgetPeriod>): string {
  const startMonth = period.startMonth
  const startDay = period.start.getDate()
  const endMonth = period.endMonth
  const endDay = period.end.getDate()
  return `${startMonth}/${startDay}-${endMonth}/${endDay}`
}

/**
 * 期間選択用の期間リストを生成
 * @param startDay 予算期間の開始日（1-31）
 * @param periodsBack 過去何期間分を取得するか（デフォルトは12）
 * @param periodsForward 未来何期間分を取得するか（デフォルトは1）
 * @returns 期間のリスト（期間情報、表示用文字列、基準日を含む）
 */
export function getPeriodListForSelector(
  startDay: number,
  periodsBack: number = 12,
  periodsForward: number = 1
): Array<{
  period: ReturnType<typeof calculateBudgetPeriod>
  label: string
  referenceDate: Date
  periodKey: string // 期間を一意に識別するキー
}> {
  const now = new Date()
  const currentPeriod = calculateBudgetPeriod(startDay, now)
  
  const periods: Array<{
    period: ReturnType<typeof calculateBudgetPeriod>
    label: string
    referenceDate: Date
    periodKey: string
  }> = []

  // 期間を一意に識別するためのキーを生成
  const getPeriodKey = (period: ReturnType<typeof calculateBudgetPeriod>): string => {
    return `${period.startYear}-${period.startMonth}-${period.start.getDate()}-${period.endYear}-${period.endMonth}-${period.end.getDate()}`
  }

  // 既に追加された期間を追跡
  const addedKeys = new Set<string>()

  // 現在の期間を追加
  const currentKey = getPeriodKey(currentPeriod)
  addedKeys.add(currentKey)
  periods.push({
    period: currentPeriod,
    label: formatPeriodShort(currentPeriod),
    referenceDate: now,
    periodKey: currentKey,
  })

  // 過去の期間を生成（現在の期間の開始日の前日を基準日として使用）
  let currentStartDate = new Date(
    currentPeriod.startYear,
    currentPeriod.startMonth - 1,
    currentPeriod.start.getDate()
  )

  for (let i = 1; i <= periodsBack; i++) {
    // 現在の期間の開始日の前日を基準日として使用
    const prevDay = new Date(currentStartDate)
    prevDay.setDate(prevDay.getDate() - 1)
    
    // 前の期間を計算（開始日の前日を基準日として使用）
    const period = calculateBudgetPeriod(startDay, prevDay)
    const key = getPeriodKey(period)

    if (!addedKeys.has(key)) {
      addedKeys.add(key)
      // 基準日として、期間の開始日を使用
      const referenceDate = new Date(
        period.startYear,
        period.startMonth - 1,
        period.start.getDate()
      )
      periods.push({
        period,
        label: formatPeriodShort(period),
        referenceDate: referenceDate,
        periodKey: key,
      })
      // 次の反復のために、現在の開始日を更新
      currentStartDate = new Date(
        period.startYear,
        period.startMonth - 1,
        period.start.getDate()
      )
    } else {
      break // 重複が見つかったら終了
    }
  }

  // 未来の期間を生成（現在の期間の終了日の翌日を基準日として使用）
  let currentEndDate = new Date(
    currentPeriod.endYear,
    currentPeriod.endMonth - 1,
    currentPeriod.end.getDate()
  )

  for (let i = 1; i <= periodsForward; i++) {
    // 現在の期間の終了日の翌日を基準日として使用
    const nextDay = new Date(currentEndDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // 次の期間を計算（終了日の翌日を基準日として使用）
    const period = calculateBudgetPeriod(startDay, nextDay)
    const key = getPeriodKey(period)

    if (!addedKeys.has(key)) {
      addedKeys.add(key)
      // 基準日として、期間の開始日を使用
      const referenceDate = new Date(
        period.startYear,
        period.startMonth - 1,
        period.start.getDate()
      )
      periods.push({
        period,
        label: formatPeriodShort(period),
        referenceDate: referenceDate,
        periodKey: key,
      })
      // 次の反復のために、現在の終了日を更新
      currentEndDate = new Date(
        period.endYear,
        period.endMonth - 1,
        period.end.getDate()
      )
    } else {
      break // 重複が見つかったら終了
    }
  }

  // 期間を開始日の順にソート（新しい期間が上に来るように降順）
  periods.sort((a, b) => {
    const aTime = a.period.start.getTime()
    const bTime = b.period.start.getTime()
    return bTime - aTime
  })

  return periods
}

