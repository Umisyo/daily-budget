import { useAuth } from '../contexts/AuthContext'
import { BudgetPage } from './BudgetPage'
import { Button } from '../components/ui/button'

export function MainLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Daily Budget</h1>
          <Button onClick={signOut}>
            ログアウト
          </Button>
        </div>
        <BudgetPage />
      </div>
    </div>
  )
}

