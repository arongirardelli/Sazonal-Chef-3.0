import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { Home } from '@/pages/Home'
import { Categories } from '@/pages/Categories'
import { RecipeDetail } from '@/pages/RecipeDetail'
import { Menu } from '@/pages/Menu'
import { ShoppingList } from '@/pages/ShoppingList'
import { Search } from '@/pages/Search'

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-dark mx-auto mb-4"></div>
          <p className="text-green-dark">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Componente para rotas públicas (redireciona se já logado)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-dark mx-auto mb-4"></div>
          <p className="text-green-dark">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipe/:id"
        element={
          <ProtectedRoute>
            <RecipeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping-list"
        element={
          <ProtectedRoute>
            <ShoppingList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />

      {/* Rota padrão */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-beige-light">
          <AppRoutes />
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#F5F0E5',
                color: '#2C5530',
                border: '1px solid #D35400',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App