import { describe, it, expect } from 'vitest'
import {
  validateAmount,
  validateDate,
  validateStartDay,
  validateAll,
} from './validation'

describe('validation', () => {
  describe('validateAmount', () => {
    it('有効な数値文字列を検証する', () => {
      expect(validateAmount('1000')).toEqual({ isValid: true })
      expect(validateAmount('0')).toEqual({ isValid: true })
      expect(validateAmount('100.5')).toEqual({ isValid: true })
    })

    it('有効な数値を検証する', () => {
      expect(validateAmount(1000)).toEqual({ isValid: true })
      expect(validateAmount(0)).toEqual({ isValid: true })
      expect(validateAmount(100.5)).toEqual({ isValid: true })
    })

    it('NaNの場合はエラーを返す', () => {
      const result = validateAmount('invalid')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('有効な金額を入力してください')
    })

    it('数値が負の場合はエラーを返す', () => {
      const result1 = validateAmount(-100)
      expect(result1.isValid).toBe(false)
      expect(result1.errorMessage).toBe('金額は0以上である必要があります')

      const result2 = validateAmount('-50')
      expect(result2.isValid).toBe(false)
      expect(result2.errorMessage).toBe('金額は0以上である必要があります')
    })

    it('0は有効と判定する', () => {
      expect(validateAmount(0)).toEqual({ isValid: true })
      expect(validateAmount('0')).toEqual({ isValid: true })
    })
  })

  describe('validateDate', () => {
    it('有効な日付文字列を検証する', () => {
      expect(validateDate('2024-01-15')).toEqual({ isValid: true })
      expect(validateDate('2024-12-31')).toEqual({ isValid: true })
    })

    it('空文字列の場合はエラーを返す', () => {
      const result = validateDate('')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('日付を入力してください')
    })

    it('無効な日付文字列の場合はエラーを返す', () => {
      const result = validateDate('invalid-date')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('有効な日付を入力してください')
    })

    it('存在しない日付の場合はエラーを返す', () => {
      const result = validateDate('2024-13-01')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('有効な日付を入力してください')
    })
  })

  describe('validateStartDay', () => {
    it('有効な開始日を検証する', () => {
      expect(validateStartDay(1)).toEqual({ isValid: true })
      expect(validateStartDay(15)).toEqual({ isValid: true })
      expect(validateStartDay(31)).toEqual({ isValid: true })
      expect(validateStartDay('15')).toEqual({ isValid: true })
    })

    it('NaNの場合はエラーを返す', () => {
      const result = validateStartDay('invalid')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toBe('有効な日付（1-31）を入力してください')
    })

    it('1未満の場合はエラーを返す', () => {
      const result1 = validateStartDay(0)
      expect(result1.isValid).toBe(false)
      expect(result1.errorMessage).toBe('日付は1から31の間である必要があります')

      const result2 = validateStartDay(-1)
      expect(result2.isValid).toBe(false)
      expect(result2.errorMessage).toBe('日付は1から31の間である必要があります')
    })

    it('31を超える場合はエラーを返す', () => {
      const result1 = validateStartDay(32)
      expect(result1.isValid).toBe(false)
      expect(result1.errorMessage).toBe('日付は1から31の間である必要があります')

      const result2 = validateStartDay(100)
      expect(result2.isValid).toBe(false)
      expect(result2.errorMessage).toBe('日付は1から31の間である必要があります')
    })

    it('境界値（1と31）は有効と判定する', () => {
      expect(validateStartDay(1)).toEqual({ isValid: true })
      expect(validateStartDay(31)).toEqual({ isValid: true })
    })
  })

  describe('validateAll', () => {
    it('すべてのバリデーションが有効な場合、undefinedを返す', () => {
      const validations = [
        { isValid: true },
        { isValid: true },
        { isValid: true },
      ]
      expect(validateAll(validations)).toBeUndefined()
    })

    it('最初のエラーメッセージを返す', () => {
      const validations = [
        { isValid: true },
        { isValid: false, errorMessage: '最初のエラー' },
        { isValid: false, errorMessage: '2番目のエラー' },
      ]
      expect(validateAll(validations)).toBe('最初のエラー')
    })

    it('エラーメッセージがない場合はundefinedを返す', () => {
      const validations = [
        { isValid: true },
        { isValid: false },
        { isValid: false },
      ]
      expect(validateAll(validations)).toBeUndefined()
    })

    it('空の配列の場合はundefinedを返す', () => {
      expect(validateAll([])).toBeUndefined()
    })

    it('最初の無効なバリデーションのエラーメッセージを返す', () => {
      const validations = [
        { isValid: false, errorMessage: 'エラー1' },
        { isValid: false, errorMessage: 'エラー2' },
        { isValid: true },
      ]
      expect(validateAll(validations)).toBe('エラー1')
    })
  })
})
