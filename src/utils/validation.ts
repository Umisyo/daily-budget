/**
 * バリデーションに関するユーティリティ関数
 */

/**
 * 金額のバリデーション
 * @param amount 金額（文字列または数値）
 * @returns バリデーション結果
 */
export function validateAmount(amount: string | number): {
  isValid: boolean
  errorMessage?: string
} {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return {
      isValid: false,
      errorMessage: '有効な金額を入力してください',
    }
  }

  if (numAmount < 0) {
    return {
      isValid: false,
      errorMessage: '金額は0以上である必要があります',
    }
  }

  return { isValid: true }
}

/**
 * 日付のバリデーション
 * @param date 日付（文字列）
 * @returns バリデーション結果
 */
export function validateDate(date: string): {
  isValid: boolean
  errorMessage?: string
} {
  if (!date) {
    return {
      isValid: false,
      errorMessage: '日付を入力してください',
    }
  }

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      errorMessage: '有効な日付を入力してください',
    }
  }

  return { isValid: true }
}

/**
 * 予算期間の開始日のバリデーション
 * @param day 開始日（文字列または数値）
 * @returns バリデーション結果
 */
export function validateStartDay(day: string | number): {
  isValid: boolean
  errorMessage?: string
} {
  const numDay = typeof day === 'string' ? parseInt(day, 10) : day

  if (isNaN(numDay)) {
    return {
      isValid: false,
      errorMessage: '有効な日付（1-31）を入力してください',
    }
  }

  if (numDay < 1 || numDay > 31) {
    return {
      isValid: false,
      errorMessage: '日付は1から31の間である必要があります',
    }
  }

  return { isValid: true }
}

/**
 * 複数のバリデーションを実行し、最初のエラーを返す
 * @param validations バリデーション関数の配列
 * @returns 最初のエラーメッセージ、またはundefined（すべて有効な場合）
 */
export function validateAll(
  validations: Array<{ isValid: boolean; errorMessage?: string }>
): string | undefined {
  for (const validation of validations) {
    if (!validation.isValid && validation.errorMessage) {
      return validation.errorMessage
    }
  }
  return undefined
}

