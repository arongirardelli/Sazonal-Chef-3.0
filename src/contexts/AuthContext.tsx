import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile, UserSettings } from '@/integrations/supabase'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  userSettings: UserSettings | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  canAuthenticate: (email: string) => Promise<boolean>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async (userId: string) => {
    try {
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError)
      } else {
        setUserProfile(profile)
      }

      // Buscar configurações do usuário
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Erro ao buscar configurações:', settingsError)
      } else {
        setUserSettings(settings)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    }
  }

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id)
    }
  }

  useEffect(() => {
    // Buscar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      }
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserData(session.user.id)
        } else {
          setUserProfile(null)
          setUserSettings(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const canAuthenticate = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('can_user_authenticate', {
        user_email: email
      })
      
      if (error) {
        console.error('Erro ao verificar autenticação:', error)
        return false
      }
      
      return data || false
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      return false
    }
  }

  const signIn = async (email: string, password: string) => {
    // Verificar se usuário pode se autenticar
    const canAuth = await canAuthenticate(email)
    if (!canAuth) {
      return { error: { message: 'Usuário não possui assinatura ativa' } }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { error }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    })

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    userProfile,
    userSettings,
    loading,
    signIn,
    signUp,
    signOut,
    canAuthenticate,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
