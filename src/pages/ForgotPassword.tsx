import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChefHat, Mail, Shield, CheckCircle, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase'

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
})

const codeSchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
})

const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

type EmailFormData = z.infer<typeof emailSchema>
type CodeFormData = z.infer<typeof codeSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'success'>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmitEmail = async (data: EmailFormData) => {
    setLoading(true)
    try {
      const { data: result, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email: data.email }
      })

      if (error) {
        toast({
          title: 'Erro ao enviar código',
          description: 'Não foi possível enviar o código de verificação',
          variant: 'destructive',
        })
      } else {
        setEmail(data.email)
        setStep('code')
        toast({
          title: 'Código enviado!',
          description: 'Verifique seu email para o código de verificação',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmitCode = async (data: CodeFormData) => {
    setLoading(true)
    try {
      const { data: result, error } = await supabase.functions.invoke('verify-code', {
        body: { email, code: data.code }
      })

      if (error || !result?.valid) {
        toast({
          title: 'Código inválido',
          description: 'Verifique o código e tente novamente',
          variant: 'destructive',
        })
      } else {
        setStep('password')
        toast({
          title: 'Código verificado!',
          description: 'Agora você pode definir uma nova senha',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async (data: PasswordFormData) => {
    setLoading(true)
    try {
      const { data: result, error } = await supabase.functions.invoke('update-user-password', {
        body: { email, newPassword: data.password }
      })

      if (error) {
        toast({
          title: 'Erro ao atualizar senha',
          description: 'Não foi possível atualizar sua senha',
          variant: 'destructive',
        })
      } else {
        setStep('success')
        toast({
          title: 'Senha atualizada!',
          description: 'Sua senha foi atualizada com sucesso',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (step) {
      case 'email':
        return (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-burnt p-3 rounded-full">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-dark">
                Esqueci minha senha
              </CardTitle>
              <CardDescription>
                Digite seu email para receber um código de verificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-green-dark">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...emailForm.register('email')}
                    className={emailForm.formState.errors.email ? 'border-red-500' : ''}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-burnt hover:bg-orange-burnt/90"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar código'}
                </Button>
              </form>
            </CardContent>
          </>
        )

      case 'code':
        return (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-burnt p-3 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-dark">
                Código de verificação
              </CardTitle>
              <CardDescription>
                Digite o código de 6 dígitos enviado para {email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium text-green-dark">
                    Código
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    maxLength={6}
                    {...codeForm.register('code')}
                    className={codeForm.formState.errors.code ? 'border-red-500 text-center text-lg tracking-widest' : 'text-center text-lg tracking-widest'}
                  />
                  {codeForm.formState.errors.code && (
                    <p className="text-sm text-red-500">{codeForm.formState.errors.code.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-burnt hover:bg-orange-burnt/90"
                  disabled={loading}
                >
                  {loading ? 'Verificando...' : 'Verificar código'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('email')}
                >
                  Voltar
                </Button>
              </form>
            </CardContent>
          </>
        )

      case 'password':
        return (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-dark p-3 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-dark">
                Nova senha
              </CardTitle>
              <CardDescription>
                Digite sua nova senha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-green-dark">
                    Nova senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua nova senha"
                    {...passwordForm.register('password')}
                    className={passwordForm.formState.errors.password ? 'border-red-500' : ''}
                  />
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-green-dark">
                    Confirmar nova senha
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua nova senha"
                    {...passwordForm.register('confirmPassword')}
                    className={passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-dark hover:bg-green-dark/90"
                  disabled={loading}
                >
                  {loading ? 'Atualizando...' : 'Atualizar senha'}
                </Button>
              </form>
            </CardContent>
          </>
        )

      case 'success':
        return (
          <>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-600 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-dark">
                Senha atualizada!
              </CardTitle>
              <CardDescription>
                Sua senha foi atualizada com sucesso. Agora você pode fazer login com sua nova senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/login">
                <Button className="w-full bg-green-dark hover:bg-green-dark/90">
                  Fazer login
                </Button>
              </Link>
            </CardContent>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-beige-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {renderContent()}
        {step !== 'success' && (
          <div className="p-6 pt-0">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-green-dark hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para login
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
