# Configuração MCP - Sazonal Chef 3.0

## Servidores MCP Configurados ✅

### 1. Supabase ✅
- **Project URL**: https://yspxyqrehhibogspctck.supabase.co
- **Project Ref**: yspxyqrehhibogspctck
- **Status**: Configurado com MCP (Model Context Protocol)
- **Funcionalidade**: Acesso ao banco de dados

### 2. Navegador (Browser Tools) ⚠️
- **Pacote**: @agentdeskai/browser-tools-mcp@1.2.0
- **Status**: Configurado (requer servidor ativo)
- **Funcionalidade**: Automação e controle do navegador

### 3. Sequential Thinking 🧠
- **Pacote**: @smithery-ai/server-sequential-thinking
- **Status**: Configurado com chave e perfil
- **Funcionalidade**: Pensamento sequencial avançado
- **Key**: 9f20a536-6ff0-47c1-b94b-f9eb723e5f7d
- **Profile**: missing-turkey-rjzz4y

## Como Usar

1. Abra o projeto no Cursor
2. Vá para Settings → MCP
3. Verifique se os servidores estão ativos (status verde)
4. Use os comandos MCP para interagir com os serviços

## Arquivos de Configuração

- `.cursor/mcp.json` - Configuração de todos os servidores MCP
- Tokens e chaves configurados adequadamente

## Informações do Projeto Supabase

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yspxyqrehhibogspctck.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcHh5cXJlaGhpYm9nc3BjdGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTg5ODcsImV4cCI6MjA3MDA5NDk4N30.u5aVfaTEtaSGD56giPYahcFrTpts3GjsVL0e5dMGDpo'
const supabase = createClient(supabaseUrl, supabaseKey)
```
