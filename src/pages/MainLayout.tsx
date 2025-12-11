import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { BudgetPage } from './BudgetPage'
import { ExpensePage } from './ExpensePage'
import { Button } from '../components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'

export function MainLayout() {
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('budget')

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Daily Budget</h1>
          <Button onClick={signOut}>
            ログアウト
          </Button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-background' value="budget">予算</TabsTrigger>
            <TabsTrigger className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-background' value="expense">支出</TabsTrigger>
          </TabsList>
          <TabsContent value="budget">
            <BudgetPage />
          </TabsContent>
          <TabsContent value="expense">
            <ExpensePage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

