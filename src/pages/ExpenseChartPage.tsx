import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBudgetData } from '../hooks/useBudgetData'
import { useBudgetSettings } from '../hooks/useBudgetSettings'
import { useExpenses } from '../hooks/useExpenses'
import { useIncomes } from '../hooks/useIncomes'
import { PeriodSelector } from '../components/budget/PeriodSelector'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { calculateBudgetPeriod } from '../utils/budgetPeriod'
import { generateChartData } from '../utils/chartData'

export function ExpenseChartPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // カスタムフックを使用
  const { startDay, isLoading: settingsLoading } = useBudgetSettings(user?.id ?? null)
  const { budget, isLoading: budgetLoading } = useBudgetData(user?.id ?? null, startDay, selectedDate)
  const { expenses, isLoading: expensesLoading } = useExpenses(user?.id ?? null, startDay, selectedDate)
  const { incomes, isLoading: incomesLoading } = useIncomes(user?.id ?? null, startDay, selectedDate)

  const dataLoading = settingsLoading || budgetLoading || expensesLoading || incomesLoading

  // 予算期間を計算
  const period = useMemo(() => {
    if (!startDay) return null
    return calculateBudgetPeriod(startDay, selectedDate)
  }, [startDay, selectedDate])

  // グラフデータを生成
  const chartData = useMemo(() => {
    if (!period || budget === null) return []
    return generateChartData(period.start, period.end, budget, expenses, incomes)
  }, [period, budget, expenses, incomes])

  // グラフの設定
  // Rechartsで確実に動作する色形式を使用
  const chartConfig = {
    actualExpense: {
      label: '純支出（支出-収入）',
      color: '#3b82f6', // 青系の色（chart-1相当）
    },
    budgetLine: {
      label: '予算使用量',
      color: '#10b981', // 緑系の色（chart-2相当）
    },
  }

  // Y軸の最大値を計算（データの最大値の1.1倍、最低でも10000）
  const yAxisMax = useMemo(() => {
    if (chartData.length === 0) return 10000
    const maxValue = Math.max(
      ...chartData.map((d) => Math.max(d.actualExpense, d.budgetLine || 0))
    )
    return Math.max(Math.ceil(maxValue * 1.1), 10000)
  }, [chartData])

  // 金額をフォーマット（万円単位で表示、必要に応じて）
  const formatCurrency = (value: number) => {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`
    }
    return value.toLocaleString()
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!period) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">予算設定を読み込めませんでした</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PeriodSelector startDay={startDay} selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <Card>
        <CardHeader>
          <CardTitle>支出グラフ</CardTitle>
          <CardDescription>
            期間内の純支出（支出-収入）と予算使用量を比較できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budget === null ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">予算が設定されていません</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">表示するデータがありません</p>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="h-[400px] w-full"
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                  domain={[0, yAxisMax]}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        if (typeof value === 'number') {
                          return `${value.toLocaleString()}円`
                        }
                        return String(value)
                      }}
                    />
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actualExpense"
                  stroke={chartConfig.actualExpense.color}
                  strokeWidth={3}
                  name={chartConfig.actualExpense.label}
                  dot={{ r: 4, fill: chartConfig.actualExpense.color }}
                  activeDot={{ r: 6 }}
                />
                {budget !== null && (
                  <Line
                    type="monotone"
                    dataKey="budgetLine"
                    stroke={chartConfig.budgetLine.color}
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name={chartConfig.budgetLine.label}
                    dot={{ r: 4, fill: chartConfig.budgetLine.color }}
                    activeDot={{ r: 6 }}
                  />
                )}
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
