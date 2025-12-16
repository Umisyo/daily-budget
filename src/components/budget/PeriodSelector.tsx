import { useState, useEffect, useMemo } from 'react'
import { Button } from '../ui/button'
import { calculateBudgetPeriod, formatBudgetPeriod, getPeriodListForSelector, formatPeriodShort } from '../../utils/budgetPeriod'

interface PeriodSelectorProps {
  startDay: number
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function PeriodSelector({ startDay, selectedDate, onDateChange }: PeriodSelectorProps) {
  // 期間リストを生成
  const periodList = useMemo(() => getPeriodListForSelector(startDay, 12, 1), [startDay])

  // 選択された期間に対応するキーを計算
  const selectedPeriod = useMemo(() => calculateBudgetPeriod(startDay, selectedDate), [startDay, selectedDate])
  const getPeriodKey = (period: ReturnType<typeof calculateBudgetPeriod>): string => {
    return `${period.startYear}-${period.startMonth}-${period.start.getDate()}-${period.endYear}-${period.endMonth}-${period.end.getDate()}`
  }
  const selectedPeriodKey = useMemo(() => getPeriodKey(selectedPeriod), [selectedPeriod])

  // 選択された期間のインデックスを取得
  const selectedIndex = useMemo(() => {
    return periodList.findIndex((p) => p.periodKey === selectedPeriodKey)
  }, [periodList, selectedPeriodKey])

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10)
    if (index >= 0 && index < periodList.length) {
      const selectedPeriodItem = periodList[index]
      onDateChange(selectedPeriodItem.referenceDate)
    }
  }

  const handlePrevPeriod = () => {
    // 左のボタン（←）は過去（古い期間）に移動
    // 期間リストは降順なので、インデックスを増やす
    if (selectedIndex < periodList.length - 1) {
      const prevPeriod = periodList[selectedIndex + 1]
      onDateChange(prevPeriod.referenceDate)
    }
  }

  const handleNextPeriod = () => {
    // 右のボタン（→）は未来（新しい期間）に移動
    // 期間リストは降順なので、インデックスを減らす
    if (selectedIndex > 0) {
      const nextPeriod = periodList[selectedIndex - 1]
      onDateChange(nextPeriod.referenceDate)
    }
  }

  const handleCurrentPeriod = () => {
    const now = new Date()
    onDateChange(now)
  }

  const isCurrentPeriod = useMemo(() => {
    const now = new Date()
    const currentPeriod = calculateBudgetPeriod(startDay, now)
    return (
      currentPeriod.startYear === selectedPeriod.startYear &&
      currentPeriod.startMonth === selectedPeriod.startMonth &&
      currentPeriod.endYear === selectedPeriod.endYear &&
      currentPeriod.endMonth === selectedPeriod.endMonth
    )
  }, [startDay, selectedPeriod])

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 bg-muted rounded-lg min-w-0 overflow-hidden">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-1">表示期間</p>
        <p className="text-base font-medium break-words">{formatBudgetPeriod(startDay, selectedDate)}</p>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 w-full min-w-0 overflow-hidden">
        <Button
          type="button"
          size="sm"
          onClick={handlePrevPeriod}
          aria-label="前期間"
          className="flex-shrink-0"
          disabled={selectedIndex >= periodList.length - 1}
        >
          ←
        </Button>
        <select
          value={selectedIndex >= 0 ? selectedIndex : ''}
          onChange={handlePeriodChange}
          className="h-9 rounded-md border border-input bg-background px-2 sm:px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex-1 min-w-0"
        >
          {periodList.map((periodItem, index) => (
            <option key={periodItem.periodKey} value={index}>
              {periodItem.label}
            </option>
          ))}
        </select>
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={handleNextPeriod}
            aria-label="次期間"
            className={isCurrentPeriod ? 'invisible' : ''}
            disabled={selectedIndex <= 0}
          >
            →
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleCurrentPeriod}
            className={`hidden sm:inline-flex ${isCurrentPeriod ? 'invisible' : ''}`}
          >
            今期間
          </Button>
        </div>
      </div>
    </div>
  )
}

