import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t">
      <div className="max-w-4xl mx-auto px-3 md:px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>
            <p>&copy; {new Date().getFullYear()} Daily Budget</p>
          </div>
          <div>
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              プライバシーポリシー
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

