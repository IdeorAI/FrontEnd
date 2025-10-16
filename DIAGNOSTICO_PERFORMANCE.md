# 🔍 Guia Rápido: Como Diagnosticar Performance da Aplicação

## Situação Atual

Você está percebendo lentidão na aplicação. Vamos identificar onde está o gargalo.

---

## 🎯 Passo 1: Identificar ONDE está o problema

### A lentidão está no Frontend ou Backend?

Abra o **Chrome DevTools** (F12):

1. **Network Tab** → Recarregue a página
2. Observe a coluna **"Time"** de cada requisição

#### Se as requisições HTTP demoram muito (>2s):
- ✅ **Problema no Backend** → Vá para **Passo 2**

#### Se as requisições são rápidas (<500ms) mas a página demora:
- ✅ **Problema no Frontend** → Vá para **Passo 3**

---

## 🔧 Passo 2: Diagnosticar Backend (se requisições demoram)

### 2.1 Iniciar o monitoramento (se não estiver rodando)

```bash
cd G:\IdeorAI\backend
docker-compose up -d
```

Aguarde 30 segundos e acesse:
- **Jaeger UI**: http://localhost:16686
- **Prometheus**: http://localhost:9090

### 2.2 Identificar endpoints lentos com Jaeger

1. Acesse http://localhost:16686
2. No campo **"Service"**, selecione `IdeorAI.Backend`
3. Em **"Min Duration"**, digite `1s` (1 segundo)
4. Clique em **"Find Traces"**

**O que você vai ver:**
- Lista de requisições que demoraram mais de 1 segundo
- Clique em qualquer trace para ver detalhes

**Exemplo de análise:**
```
POST /api/GeminiAI/generate (3.5s)
├── Validação (10ms) ✅ OK
├── Chamada Gemini API (3.4s) ⚠️ GARGALO
└── Salvar resultado (50ms) ✅ OK
```

### 2.3 Verificar métricas no Prometheus

1. Acesse http://localhost:9090
2. Cole estas queries uma por vez:

#### Query 1: Latência P95 (tempo que 95% das requisições demoram)
```promql
histogram_quantile(0.95, rate(http_server_request_duration_seconds_bucket[5m]))
```
- **Resultado esperado**: < 1 segundo
- **Se > 2 segundos**: Backend está lento

#### Query 2: Requisições por segundo
```promql
rate(http_server_request_duration_seconds_count[1m])
```
- **Resultado esperado**: Varia conforme uso
- **Se muito alto (>100/s)**: Possível sobrecarga

#### Query 3: Taxa de erros
```promql
rate(backend_errors_total[5m])
```
- **Resultado esperado**: 0 ou muito próximo de 0
- **Se > 0**: Backend está com erros

### 2.4 Analisar logs (sem Docker)

```bash
cd G:\IdeorAI\backend\logs

# Ver requisições mais lentas (>1000ms)
cat log-*.json | grep -o '"LatencyMs":[0-9]*' | sort -t: -k2 -n | tail -20

# Ver erros recentes
cat log-*.json | grep '"@l":"Error"' | tail -10
```

---

## ⚡ Passo 3: Diagnosticar Frontend

### 3.1 Chrome DevTools - Performance Tab

1. Abra DevTools (F12)
2. **Performance** tab
3. Clique em **Record** (círculo vermelho)
4. Interaja com a página (ex: carregar dashboard)
5. Clique em **Stop**

**O que procurar:**
- **Barras amarelas longas**: JavaScript bloqueando
- **Barras roxas longas**: Renderização/layout lento
- **Gaps grandes**: Aguardando rede

### 3.2 Network Tab - Análise de requisições

Ordene por **"Time"** (clique no header):

#### Requisições lentas comuns:

| Requisição | Tempo esperado | Se estiver lento |
|------------|----------------|------------------|
| `/dashboard` (HTML) | <500ms | Cache do Next.js não funcionando |
| `/api/projects` (Supabase) | <300ms | RLS policies lentas ou muitos dados |
| Imagens/assets | <200ms | Falta otimização de imagens |
| `/api/gemini/*` (se houver) | 2-5s | API Gemini é naturalmente lenta |

### 3.3 Lighthouse Audit (Performance Score)

1. DevTools → **Lighthouse** tab
2. Selecione **Performance**
3. Clique em **Analyze page load**

**Score:**
- **90-100**: ✅ Excelente
- **50-89**: ⚠️ Médio - precisa otimização
- **0-49**: ❌ Ruim - precisa otimização urgente

**Principais métricas:**
- **FCP** (First Contentful Paint): Quanto tempo até aparecer algo na tela
- **LCP** (Largest Contentful Paint): Quanto tempo até o conteúdo principal
- **TBT** (Total Blocking Time): Quanto tempo a página fica travada

---

## 🎯 Problemas Comuns e Soluções

### Problema 1: Dashboard demora para carregar

**Diagnóstico:**
```bash
# No Chrome DevTools Network, veja quanto tempo demora:
GET /dashboard → Se > 2s, problema no servidor
```

**Possíveis causas:**
1. **Muitos projetos** → Supabase demora para retornar
   - **Solução**: Adicionar paginação

2. **RLS Policies lentas** → Supabase executa queries complexas
   - **Solução**: Revisar policies no Supabase

3. **Server Component lento** → Next.js demorando para renderizar
   - **Solução**: Adicionar `loading.tsx` ou usar Suspense

### Problema 2: Clique em card demora para navegar

**Diagnóstico:**
```
Você vê o RocketLoading muito tempo (>3s)?
```

**Possíveis causas:**
1. **Página `/projeto/dash` é pesada**
   - **Solução**: Lazy loading de componentes

2. **Muitas queries no Supabase**
   - **Solução**: Combinar queries ou usar joins

### Problema 3: API Gemini muito lenta

**Isso é NORMAL!** A API Gemini demora 2-5 segundos por natureza.

**Soluções:**
1. ✅ Você já tem o `RocketLoading` - está correto!
2. Considere adicionar streaming (ver conteúdo aparecer aos poucos)
3. Cache de respostas comuns

### Problema 4: Imagens demoram para carregar

**Diagnóstico:**
```bash
# DevTools Network → Filter por "Img"
# Se imagens > 500KB, está grande demais
```

**Solução:**
```bash
npm install sharp
```

Use `next/image` com otimização automática:
```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  width={100}
  height={100}
  alt="Logo"
  priority={true}  // Para logo principal
/>
```

---

## 🚀 Quick Wins (Otimizações Rápidas)

### 1. Adicionar loading states (já feito! ✅)
- ✅ `RocketLoading` no clique de cards
- ✅ `RocketLoading` ao deletar projeto

### 2. Verificar queries do Supabase

Veja quantos projetos você tem:
```sql
-- No Supabase SQL Editor
SELECT COUNT(*) FROM projects;
```

Se > 100 projetos, considere paginação.

### 3. Habilitar cache do Next.js

```typescript
// app/dashboard/page.tsx
export const revalidate = 60; // Revalidar a cada 60s

// Ou cache por projeto
export const dynamic = 'force-dynamic'; // Sempre buscar dados frescos
```

### 4. Reduzir tamanho do bundle

```bash
# Analisar tamanho do bundle
npm run build

# Se > 500KB, otimize imports
# Evite importar bibliotecas inteiras:
import { Button } from '@/components/ui/button'  // ✅ Bom
import * as UI from '@/components/ui'            // ❌ Ruim
```

---

## 📊 Métricas para Monitorar

### Frontend (Chrome DevTools)
- **FCP** < 1.8s
- **LCP** < 2.5s
- **TBT** < 200ms
- **Requisições HTTP** < 500ms (exceto Gemini)

### Backend (Prometheus)
- **Latência P95** < 1s
- **Taxa de erro** < 1%
- **Requisições/segundo** conforme seu uso

---

## 🔍 Comandos Úteis Rápidos

```bash
# Backend: Ver logs de requisições lentas
cd G:\IdeorAI\backend\logs
cat log-*.json | jq 'select(.LatencyMs > 1000)'

# Backend: Iniciar monitoramento
cd G:\IdeorAI\backend
docker-compose up -d

# Frontend: Build otimizado
cd G:\IdeorAI\FrontEnd\ideor
npm run build
npm run start  # Teste em produção

# Frontend: Analisar bundle
npm run build -- --analyze
```

---

## 🎯 Próximos Passos Recomendados

1. ✅ Você já adicionou loading states - **Parabéns!**

2. **Agora faça:**
   - [ ] Inicie o Docker: `cd backend && docker-compose up -d`
   - [ ] Teste a aplicação e veja o Jaeger: http://localhost:16686
   - [ ] Identifique traces lentos (>1s)
   - [ ] Compartilhe os traces aqui para analisarmos juntos

3. **Se quiser otimizar mais:**
   - [ ] Adicionar paginação no dashboard (se >50 projetos)
   - [ ] Implementar cache de queries do Supabase
   - [ ] Otimizar imagens com `next/image`

---

**Precisa de ajuda para interpretar os resultados?**

Me mostre:
1. Screenshot do Jaeger com traces lentos
2. Resultado das queries do Prometheus
3. Screenshot do Chrome DevTools Network tab

Vou te ajudar a identificar exatamente onde está o gargalo! 🚀
