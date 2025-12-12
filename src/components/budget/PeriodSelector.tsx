import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { calculateBudgetPeriod, formatBudgetPeriod } from '../../utils/budgetPeriod'

interface PeriodSelectorProps {
  startDay: number
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function PeriodSelector({ startDay, selectedDate, onDateChange }: PeriodSelectorProps) {
  const [year, setYear] = useState(selectedDate.getFullYear())
  const [month, setMonth] = useState(selectedDate.getMonth() + 1)

  useEffect(() => {
    setYear(selectedDate.getFullYear())
    setMonth(selectedDate.getMonth() + 1)
  }, [selectedDate])

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10)
    setYear(newYear)
    const newDate = new Date(newYear, month - 1, 15)
    onDateChange(newDate)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10)
    setMonth(newMonth)
    const newDate = new Date(year, newMonth - 1, 15)
    onDateChange(newDate)
  }

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 2, 15)
    setYear(newDate.getFullYear())
    setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month, 15)
    setYear(newDate.getFullYear())
    setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }

  const handleCurrentMonth = () => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth() + 1)
    onDateChange(now)
  }

  const isCurrentPeriod = (() => {
    const now = new Date()
    const currentPeriod = calculateBudgetPeriod(startDay, now)
    const selectedPeriod = calculateBudgetPeriod(startDay, selectedDate)
    // 選択された期間と現在の期間が同じかどうかを判定
    // 開始年月と終了年月の両方が一致する場合、同じ期間とみなす
    return (
      currentPeriod.startYear === selectedPeriod.startYear &&
      currentPeriod.startMonth === selectedPeriod.startMonth &&
      currentPeriod.endYear === selectedPeriod.endYear &&
      currentPeriod.endMonth === selectedPeriod.endMonth
    )
  })()

  // 年と月の選択肢を生成（過去1年分 + 現在 + 未来1年分）
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted rounded-lg">
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">表示期間</p>
        <p className="text-base font-medium">{formatBudgetPeriod(startDay, selectedDate)}</p>
      </div>
      <div className="flex items-center gap-2 w-full">
        <Button
          type="button"
          size="sm"
          onClick={handlePrevMonth}
          aria-label="前月"
          className="flex-shrink-0"
        >
          ←
        </Button>
        <div className="flex gap-2 flex-1 justify-center">
          <select
            value={year}
            onChange={handleYearChange}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 sm:flex-initial"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={handleMonthChange}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 sm:flex-initial"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={handleNextMonth}
            aria-label="次月"
            className={isCurrentPeriod ? 'invisible' : ''}
          >
            →
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCurrentMonth}
            className={`hidden sm:inline-flex ${isCurrentPeriod ? 'invisible' : ''}`}
          >
            今月
          </Button>
        </div>
      </div>
    </div>
  )
}

