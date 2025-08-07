import React from 'react'
import { ChefHat, Clock, Users, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export const Home: React.FC = () => {
  const { user, userProfile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-beige-light">
      {/* Header */}
      <header className="bg-green-dark text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Sazonal Chef</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Olá, {user?.user_metadata?.name || user?.email}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="text-green-dark border-white hover:bg-white"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-green-dark mb-4">
            Bem-vindo ao Sazonal Chef! 🍽️
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubra receitas sazonais incríveis, crie cardápios personalizados e 
            gere listas de compras inteligentes. Sua jornada culinária começa aqui!
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status da Assinatura</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-dark">
                {userProfile?.subscription_status === 'active' ? 'Ativo' : 'Inativo'}
              </div>
              <p className="text-xs text-muted-foreground">
                Plano: {userProfile?.plan_type || 'Nenhum'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Disponíveis</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-burnt">500+</div>
              <p className="text-xs text-muted-foreground">
                Receitas sazonais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-dark">30min</div>
              <p className="text-xs text-muted-foreground">
                Por receita
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="h-20 bg-green-dark hover:bg-green-dark/90 flex flex-col items-center justify-center space-y-2"
            onClick={() => window.location.href = '/categories'}
          >
            <ChefHat className="h-6 w-6" />
            <span>Receitas</span>
          </Button>

          <Button 
            className="h-20 bg-orange-burnt hover:bg-orange-burnt/90 flex flex-col items-center justify-center space-y-2"
            onClick={() => window.location.href = '/menu'}
          >
            <Users className="h-6 w-6" />
            <span>Cardápio</span>
          </Button>

          <Button 
            className="h-20 bg-green-dark hover:bg-green-dark/90 flex flex-col items-center justify-center space-y-2"
            onClick={() => window.location.href = '/shopping-list'}
          >
            <Clock className="h-6 w-6" />
            <span>Lista de Compras</span>
          </Button>

          <Button 
            className="h-20 bg-orange-burnt hover:bg-orange-burnt/90 flex flex-col items-center justify-center space-y-2"
            onClick={() => window.location.href = '/search'}
          >
            <Star className="h-6 w-6" />
            <span>Buscar</span>
          </Button>
        </div>

        {/* Development Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🚧 Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <p className="mb-4">
              O Sazonal Chef 3.0 está sendo construído! Aqui está o que já foi implementado:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>✅ Sistema de autenticação completo</li>
              <li>✅ Estrutura do banco de dados</li>
              <li>✅ Interface de usuário com Tailwind CSS</li>
              <li>🔄 Sistema de receitas (em desenvolvimento)</li>
              <li>🔄 Geração de cardápios (próximo)</li>
              <li>🔄 Lista de compras inteligente (próximo)</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
