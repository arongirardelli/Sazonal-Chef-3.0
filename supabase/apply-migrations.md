# 📋 Guia para Aplicar Migrações no Supabase

## 🎯 Instruções para Aplicar o Schema

### 1. **Acesse o Dashboard do Supabase**
- URL: https://supabase.com/dashboard/project/yspxyqrehhibogspctck
- Vá para **SQL Editor**

### 2. **Execute as Migrações na Ordem Correta**

Execute cada arquivo SQL na seguinte ordem:

#### **Migração 001 - User Profiles**
```sql
-- Copie e cole o conteúdo de: supabase/migrations/001_create_user_profiles.sql
```

#### **Migração 002 - User Settings** 
```sql
-- Copie e cole o conteúdo de: supabase/migrations/002_create_user_settings.sql
```

#### **Migração 003 - Verification Codes**
```sql
-- Copie e cole o conteúdo de: supabase/migrations/003_create_verification_codes.sql
```

#### **Migração 004 - Recipes Table (CRÍTICO)**
```sql
-- Copie e cole o conteúdo de: supabase/migrations/004_create_recipes_table.sql
```

#### **Migração 005 - User Menus**
```sql
-- Copie e cole o conteúdo de: supabase/migrations/005_create_user_menus.sql
```

#### **Migração 006 - Cakto Webhook Logs**
```sql
-- Copie e cole o conteúdo de: supabase/migrations/006_create_cakto_webhook_logs.sql
```

#### **Migração 007 - RPC Functions**
```sql
-- Copie e cole o conteúdo de: supabase/migrations/007_create_rpc_functions.sql
```

#### **Migração 008 - Triggers**
```sql
-- Copie e cole o conteúdo de: supabase/migrations/008_create_triggers.sql
```

### 3. **Deploy das Edge Functions**

Para cada função em `supabase/functions/`, execute:

```bash
# Instalar Supabase CLI se necessário
npm install -g supabase

# Fazer login
supabase login

# Link do projeto
supabase link --project-ref yspxyqrehhibogspctck

# Deploy das funções
supabase functions deploy send-verification-code
supabase functions deploy verify-code  
supabase functions deploy update-user-password
supabase functions deploy cakto-webhook
```

### 4. **Verificação**

Após aplicar todas as migrações, verifique se as seguintes tabelas foram criadas:

- ✅ `public.user_profiles`
- ✅ `public.user_settings` 
- ✅ `public.verification_codes`
- ✅ `public.recipes`
- ✅ `public.user_menus`
- ✅ `public.cakto_webhook_logs`

### 5. **Configurar Variáveis de Ambiente das Edge Functions**

No dashboard do Supabase, vá para **Settings > Edge Functions** e configure:

- `ENVIRONMENT=development` (para desenvolvimento)
- `CAKTO_WEBHOOK_SECRET=seu_secret_aqui` (quando integrar com Cakto)

## 🎉 Schema Pronto!

Após executar todas as migrações, o banco estará pronto para o desenvolvimento do Sazonal Chef 3.0!
