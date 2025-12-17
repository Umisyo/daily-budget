import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { MainLayout } from './pages/MainLayout'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      {!user ? (
        <>
          <Route path="/" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<MainLayout />} />
          <Route path="/chart" element={<MainLayout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
