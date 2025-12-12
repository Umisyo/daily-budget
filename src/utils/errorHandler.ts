/**
 * エラーハンドリングに関するユーティリティ関数
 * 将来的にトースト通知などに置き換え可能な構造
 */

/**
 * エラーメッセージを表示
 * 現在はalert()を使用しているが、将来的にトースト通知などに置き換え可能
 * @param message エラーメッセージ
 */
export function showError(message: string): void {
  alert(message)
}

/**
 * 成功メッセージを表示
 * 現在はalert()を使用しているが、将来的にトースト通知などに置き換え可能
 * @param message 成功メッセージ
 */
export function showSuccess(message: string): void {
  alert(message)
}

/**
 * 確認ダイアログを表示
 * @param message 確認メッセージ
 * @returns ユーザーがOKを選択した場合true
 */
export function showConfirm(message: string): boolean {
  return confirm(message)
}

/**
 * エラーオブジェクトからメッセージを取得
 * @param error エラーオブジェクト
 * @param defaultMessage デフォルトメッセージ
 * @returns エラーメッセージ
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return defaultMessage
}

