import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BudgetPage } from './BudgetPage'
import { ExpenseChartPage } from './ExpenseChartPage'
import { Button } from '../components/ui/button'
import { Footer } from '../components/ui/Footer'
import githubMark from '../components/ui/icons/github-mark.svg'
import { SignOutIcon } from '../components/ui/icons/akar-icons-sign-out'
import { cn } from '../lib/utils'

export function MainLayout() {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-4xl mx-auto px-0 sm:px-3 py-4 md:px-4 flex-1 w-full">
        <div className="flex justify-between items-center mb-6 md:mb-8 gap-2 min-w-0 px-4 sm:px-0">
          <h1 className="text-xl md:text-2xl font-bold truncate min-w-0">Daily Budget</h1>
          <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <a
              href="https://github.com/Umisyo/daily-budget"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center flex-shrink-0"
              aria-label="GitHubリポジトリを開く"
            >
              <img src={githubMark} alt="GitHub" className="w-5 h-5 md:w-6 md:h-6" />
            </a>
            <Button
              onClick={signOut}
              size="icon"
              className="rounded-full"
              aria-label="ログアウト"
            >
              <SignOutIcon />
            </Button>
          </div>
        </div>
        <nav className="mb-6 px-4 sm:px-0">
          <div className="flex gap-2">
            <Link
              to="/"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              予算管理
            </Link>
            <Link
              to="/chart"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === "/chart"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              グラフ
            </Link>
          </div>
        </nav>
        {location.pathname === '/chart' ? (
          <ExpenseChartPage />
        ) : (
          <BudgetPage />
        )}
      </div>
      <Footer />
    </div>
  )
}

