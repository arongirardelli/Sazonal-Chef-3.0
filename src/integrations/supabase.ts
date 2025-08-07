import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yspxyqrehhibogspctck.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcHh5cXJlaGhpYm9nc3BjdGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTg5ODcsImV4cCI6MjA3MDA5NDk4N30.u5aVfaTEtaSGD56giPYahcFrTpts3GjsVL0e5dMGDpo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do banco
export interface UserProfile {
  id: string
  user_id: string
  email: string
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'overdue' | 'admin'
  plan_type: 'none' | 'monthly' | 'yearly' | 'admin'
  subscription_id?: string
  subscription_start_date?: string
  subscription_end_date?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  notifications_enabled: boolean
  new_recipes_notifications: boolean
  cooking_reminders: boolean
  font_size: 'small' | 'medium' | 'large'
  dark_mode: boolean
  recipes_viewed: number
  recipes_saved_count: number
  saved_recipes: string[] // Array de IDs das receitas salvas
  cooking_days: number
  total_points: number
  chef_level: string
  last_access_date?: string
  first_access_date?: string
  last_notification_date?: string
  email: string
}

export interface Recipe {
  id: string
  created_at: string
  updated_at: string
  title: string
  description?: string
  category: string
  time: number // em minutos
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  diet: 'Vegetariano' | 'Vegano' | 'Proteico' | 'Tradicional' | 'Sem Glúten' | 'Sem Lactose' | 'Todos'
  servings?: number
  rating?: number
  calories?: number
  image_url?: string
  instructions: string[]
  tips: string[]
  legacy_ingredients: string[] // Para compatibilidade
  tags: string[]
  structured_ingredients: StructuredIngredient[]
}

export interface StructuredIngredient {
  name: string
  quantity: number
  unit: string
  purchaseUnit: string
  purchaseQuantity: number
  category: string
}

export interface UserMenu {
  id: string
  user_id: string
  name: string
  menu_data: Record<string, Record<string, string>> // {dia: {refeicao: recipe_id}}
  created_at: string
  updated_at: string
}

export interface VerificationCode {
  id: string
  email: string
  code: string
  created_at: string
  expires_at: string
}
