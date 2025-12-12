/**
 * アプリケーション全体で使用する定数
 */

export type PaymentMethod = 'credit_card' | 'cash' | 'electronic_money' | 'other'

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'credit_card', label: 'クレジットカード' },
  { value: 'cash', label: '現金' },
  { value: 'electronic_money', label: '電子マネー' },
  { value: 'other', label: 'その他' },
]

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  credit_card: 'クレジットカード',
  cash: '現金',
  electronic_money: '電子マネー',
  other: 'その他',
}

/**
 * 支払い方法のラベルを取得
 */
export function getPaymentMethodLabel(paymentMethod: string | null | undefined): string | null {
  if (!paymentMethod) return null
  return PAYMENT_METHOD_LABELS[paymentMethod] || null
}

