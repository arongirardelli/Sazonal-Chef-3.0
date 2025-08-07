import React from 'react'
import { ChefHat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const ShoppingList: React.FC = () => {
  return (
    <div className="min-h-screen bg-beige-light">
      <header className="bg-green-dark text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          <ChefHat className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Lista de Compras</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-dark">🚧 Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              A lista de compras inteligente está sendo implementada. 
              Em breve você poderá gerar listas consolidadas baseadas no seu cardápio!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
