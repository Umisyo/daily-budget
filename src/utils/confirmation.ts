/**
 * 確認ダイアログに関するユーティリティ関数
 */

/**
 * 削除確認ダイアログを表示
 * @param itemName 削除対象のアイテム名（例: "この支出"）
 * @returns ユーザーがOKを選択した場合true
 */
export function confirmDelete(itemName: string = 'このアイテム'): boolean {
  return confirm(`${itemName}を削除しますか？`)
}

