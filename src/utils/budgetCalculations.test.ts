import { describe, it, expect } from 'vitest'
import {
  calculateRemainingBudget,
  calculateAvailableBudget,
  calculateBudgetPercentage,
  calculateDailyBudget,
  getBudgetColorClass,
  isBudgetOverdrawn,
} from './budgetCalculations'

describe('budgetCalculations', () => {
  describe('calculateRemainingBudget', () => {
    it('予算がnullの場合はnullを返す', () => {
      expect(calculateRemainingBudget(null, 1000, 500)).toBeNull()
    })

    it('予算、収入、支出から残り予算を正しく計算する', () => {
      expect(calculateRemainingBudget(10000, 5000, 3000)).toBe(12000)
    })

    it('支出が収入と予算の合計を超える場合、マイナス値を返す', () => {
      expect(calculateRemainingBudget(10000, 5000, 20000)).toBe(-5000)
    })
  })

  describe('calculateAvailableBudget', () => {
    it('予算がnullの場合は0を返す', () => {
      expect(calculateAvailableBudget(null, 1000)).toBe(0)
    })

    it('予算と収入の合計を正しく計算する', () => {
      expect(calculateAvailableBudget(10000, 5000)).toBe(15000)
    })

    it('収入が0の場合、予算のみを返す', () => {
      expect(calculateAvailableBudget(10000, 0)).toBe(10000)
    })
  })

  describe('calculateBudgetPercentage', () => {
    it('利用可能な予算が0以下の場合は0を返す', () => {
      expect(calculateBudgetPercentage(1000, 0)).toBe(0)
      expect(calculateBudgetPercentage(1000, -1000)).toBe(0)
    })

    it('使用率を正しく計算する', () => {
      expect(calculateBudgetPercentage(5000, 10000)).toBe(50)
      expect(calculateBudgetPercentage(10000, 10000)).toBe(100)
    })

    it('支出が利用可能な予算を超える場合、100%を超える値を返す', () => {
      expect(calculateBudgetPercentage(15000, 10000)).toBe(150)
    })
  })

  describe('calculateDailyBudget', () => {
    it('残り予算がnullの場合はnullを返す', () => {
      expect(calculateDailyBudget(null, 10)).toBeNull()
    })

    it('残り日数が0以下の場合はnullを返す', () => {
      expect(calculateDailyBudget(10000, 0)).toBeNull()
      expect(calculateDailyBudget(10000, -5)).toBeNull()
    })

    it('1日あたりの予算を正しく計算する', () => {
      expect(calculateDailyBudget(10000, 10)).toBe(1000)
      expect(calculateDailyBudget(10000, 5)).toBe(2000)
    })

    it('残り予算が0の場合、0を返す', () => {
      expect(calculateDailyBudget(0, 10)).toBe(0)
    })
  })

  describe('getBudgetColorClass', () => {
    it('使用率が100%を超える場合はdestructiveを返す', () => {
      expect(getBudgetColorClass(101)).toBe('bg-destructive')
      expect(getBudgetColorClass(150)).toBe('bg-destructive')
    })

    it('使用率が80%を超え100%以下の場合はyellow-500を返す', () => {
      expect(getBudgetColorClass(81)).toBe('bg-yellow-500')
      expect(getBudgetColorClass(100)).toBe('bg-yellow-500')
    })

    it('使用率が80%以下の場合はprimaryを返す', () => {
      expect(getBudgetColorClass(80)).toBe('bg-primary')
      expect(getBudgetColorClass(50)).toBe('bg-primary')
      expect(getBudgetColorClass(0)).toBe('bg-primary')
    })
  })

  describe('isBudgetOverdrawn', () => {
    it('残り予算がnullの場合はfalseを返す', () => {
      expect(isBudgetOverdrawn(null)).toBe(false)
    })

    it('残り予算がマイナスの場合はtrueを返す', () => {
      expect(isBudgetOverdrawn(-1000)).toBe(true)
      expect(isBudgetOverdrawn(-1)).toBe(true)
    })

    it('残り予算が0以上の場合はfalseを返す', () => {
      expect(isBudgetOverdrawn(0)).toBe(false)
      expect(isBudgetOverdrawn(1000)).toBe(false)
    })
  })
})
