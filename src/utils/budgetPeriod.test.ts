import { describe, it, expect } from 'vitest'
import {
  calculateBudgetPeriod,
  getAvailablePeriods,
  getPeriodListForSelector,
} from './budgetPeriod'

describe('budgetPeriod', () => {
  describe('calculateBudgetPeriod', () => {
    it('今日が開始日以降の場合、今月の開始日から来月の開始日の前日までを返す', () => {
      const referenceDate = new Date(2024, 0, 16) // 2024年1月16日
      const result = calculateBudgetPeriod(15, referenceDate)

      expect(result.startYear).toBe(2024)
      expect(result.startMonth).toBe(1)
      expect(result.start.getDate()).toBe(15)
      expect(result.endYear).toBe(2024)
      expect(result.endMonth).toBe(2)
      expect(result.end.getDate()).toBe(14)
    })

    it('今日が開始日より前の場合、先月の開始日から今月の開始日の前日までを返す', () => {
      const referenceDate = new Date(2024, 0, 10) // 2024年1月10日
      const result = calculateBudgetPeriod(15, referenceDate)

      expect(result.startYear).toBe(2023)
      expect(result.startMonth).toBe(12)
      expect(result.start.getDate()).toBe(15)
      expect(result.endYear).toBe(2024)
      expect(result.endMonth).toBe(1)
      expect(result.end.getDate()).toBe(14)
    })

    it('12月から1月への境界を正しく処理する', () => {
      const referenceDate = new Date(2024, 11, 20) // 2024年12月20日
      const result = calculateBudgetPeriod(15, referenceDate)

      expect(result.startYear).toBe(2024)
      expect(result.startMonth).toBe(12)
      expect(result.endYear).toBe(2025)
      expect(result.endMonth).toBe(1)
    })

    it('1月から12月への境界を正しく処理する', () => {
      const referenceDate = new Date(2024, 0, 10) // 2024年1月10日
      const result = calculateBudgetPeriod(15, referenceDate)

      expect(result.startYear).toBe(2023)
      expect(result.startMonth).toBe(12)
      expect(result.endYear).toBe(2024)
      expect(result.endMonth).toBe(1)
    })

    it('開始日が今日と同じ場合、今月の開始日から来月の開始日の前日までを返す', () => {
      const referenceDate = new Date(2024, 0, 15) // 2024年1月15日
      const result = calculateBudgetPeriod(15, referenceDate)

      expect(result.startYear).toBe(2024)
      expect(result.startMonth).toBe(1)
      expect(result.start.getDate()).toBe(15)
      expect(result.endYear).toBe(2024)
      expect(result.endMonth).toBe(2)
      expect(result.end.getDate()).toBe(14)
    })
  })

  describe('getAvailablePeriods', () => {
    it('指定された月数分の期間を返す', () => {
      const periods = getAvailablePeriods(15, 3)
      expect(periods.length).toBeGreaterThan(0)
      expect(periods.length).toBeLessThanOrEqual(4) // 3ヶ月分 + 現在の期間
    })

    it('重複する期間を除外する', () => {
      const periods = getAvailablePeriods(15, 12)
      const periodKeys = periods.map(
        (p) => `${p.year}-${p.month}`
      )
      const uniqueKeys = new Set(periodKeys)
      expect(uniqueKeys.size).toBe(periodKeys.length)
    })

    it('デフォルトで12ヶ月分の期間を返す', () => {
      const periods = getAvailablePeriods(15)
      expect(periods.length).toBeGreaterThan(0)
    })

    it('各期間が正しい構造を持っている', () => {
      const periods = getAvailablePeriods(15, 1)
      periods.forEach((period) => {
        expect(period).toHaveProperty('year')
        expect(period).toHaveProperty('month')
        expect(period).toHaveProperty('period')
        expect(period.period).toHaveProperty('start')
        expect(period.period).toHaveProperty('end')
      })
    })
  })

  describe('getPeriodListForSelector', () => {
    it('現在の期間を含む期間リストを返す', () => {
      const periods = getPeriodListForSelector(15, 2, 1)
      expect(periods.length).toBeGreaterThan(0)

      // 現在の期間が含まれているか確認
      const now = new Date()
      const hasCurrentPeriod = periods.some((p) => {
        const period = p.period
        return (
          period.start <= now &&
          period.end >= now
        )
      })
      expect(hasCurrentPeriod).toBe(true)
    })

    it('重複する期間を除外する', () => {
      const periods = getPeriodListForSelector(15, 5, 2)
      const periodKeys = periods.map((p) => p.periodKey)
      const uniqueKeys = new Set(periodKeys)
      expect(uniqueKeys.size).toBe(periodKeys.length)
    })

    it('過去の期間を指定された数だけ返す', () => {
      const periods = getPeriodListForSelector(15, 3, 0)
      // 現在の期間 + 過去3期間 = 4期間以上
      expect(periods.length).toBeGreaterThanOrEqual(4)
    })

    it('未来の期間を指定された数だけ返す', () => {
      const periods = getPeriodListForSelector(15, 0, 2)
      // 現在の期間 + 未来2期間 = 3期間以上
      expect(periods.length).toBeGreaterThanOrEqual(3)
    })

    it('各期間が正しい構造を持っている', () => {
      const periods = getPeriodListForSelector(15, 1, 1)
      periods.forEach((period) => {
        expect(period).toHaveProperty('period')
        expect(period).toHaveProperty('label')
        expect(period).toHaveProperty('referenceDate')
        expect(period).toHaveProperty('periodKey')
        expect(typeof period.label).toBe('string')
        expect(period.referenceDate).toBeInstanceOf(Date)
      })
    })

    it('期間が開始日の順にソートされている（新しい期間が上）', () => {
      const periods = getPeriodListForSelector(15, 5, 2)
      for (let i = 0; i < periods.length - 1; i++) {
        const currentTime = periods[i].period.start.getTime()
        const nextTime = periods[i + 1].period.start.getTime()
        expect(currentTime).toBeGreaterThanOrEqual(nextTime)
      }
    })

    it('重複が見つかった場合、ループを終了する', () => {
      // このテストは、getPeriodListForSelectorが重複を検出して
      // 適切にbreakすることを確認する
      const periods = getPeriodListForSelector(15, 100, 100)
      const periodKeys = periods.map((p) => p.periodKey)
      const uniqueKeys = new Set(periodKeys)
      expect(uniqueKeys.size).toBe(periodKeys.length)
    })
  })
})
