import { describe, it, expect } from 'vitest'
import { getErrorMessage } from './errorHandler'

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('Errorインスタンスの場合はerror.messageを返す', () => {
      const error = new Error('テストエラーメッセージ')
      expect(getErrorMessage(error, 'デフォルトメッセージ')).toBe(
        'テストエラーメッセージ'
      )
    })

    it('文字列の場合はその文字列を返す', () => {
      expect(getErrorMessage('文字列エラー', 'デフォルトメッセージ')).toBe(
        '文字列エラー'
      )
    })

    it('その他の型の場合はデフォルトメッセージを返す', () => {
      expect(getErrorMessage(null, 'デフォルトメッセージ')).toBe(
        'デフォルトメッセージ'
      )
      expect(getErrorMessage(undefined, 'デフォルトメッセージ')).toBe(
        'デフォルトメッセージ'
      )
      expect(getErrorMessage(123, 'デフォルトメッセージ')).toBe(
        'デフォルトメッセージ'
      )
      expect(getErrorMessage({}, 'デフォルトメッセージ')).toBe(
        'デフォルトメッセージ'
      )
    })

    it('Errorインスタンスで空のメッセージの場合、空文字列を返す', () => {
      const error = new Error('')
      expect(getErrorMessage(error, 'デフォルトメッセージ')).toBe('')
    })

    it('空文字列の場合は空文字列を返す', () => {
      expect(getErrorMessage('', 'デフォルトメッセージ')).toBe('')
    })
  })
})
