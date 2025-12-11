import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { formatBudgetPeriod } from '../../utils/budgetPeriod'

interface BudgetSettingsFormProps {
  startDay: number
  onSubmit: (day: number) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function BudgetSettingsForm({
  startDay,
  onSubmit,
  onCancel,
  isSubmitting,
}: BudgetSettingsFormProps) {
  const [settingsStartDay, setSettingsStartDay] = useState<string>(startDay.toString())

  useEffect(() => {
    setSettingsStartDay(startDay.toString())
  }, [startDay])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const day = parseInt(settingsStartDay)
    if (isNaN(day) || day < 1 || day > 31) {
      alert('有効な日付（1-31）を入力してください')
      return
    }

    try {
      await onSubmit(day)
    } catch (error) {
      // エラーは親コンポーネントで処理
    }
  }

  const handleCancel = () => {
    setSettingsStartDay(startDay.toString())
    onCancel()
  }

  const now = new Date()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl">予算期間</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {formatBudgetPeriod(startDay, now)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="py-4">
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="start-day">予算期間の開始日（1-31）</Label>
              <Input
                id="start-day"
                type="number"
                min="1"
                max="31"
                step="1"
                placeholder="例: 15"
                value={settingsStartDay}
                onChange={(e) => setSettingsStartDay(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                例: 15を設定すると、毎月15日から翌月14日までが1期間となります
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

