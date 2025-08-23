Roadmap de 9 Semanas 
Semana 1 – Setup e Fundamentos

Configuração inicial dos repositórios (monorepo ou separados backend/frontend).

Setup do ambiente: FastAPI, Next.js, Supabase (auth e DB), deploy inicial (Vercel + Railway).

Estrutura inicial do banco: usuários, projetos, tarefas, métricas (score, valuation).

Design system básico (UI kit + componentes base com Tailwind).

Semana 2 – Autenticação e Fluxo de Usuário

Implementar cadastro/login via Supabase (frontend + backend integrado).

Criar modal de autenticação (login/cadastro).

Gerenciamento de sessão no frontend.

Testar fluxo: entrar, sair, persistência de sessão.

Semana 3 – Página Inicial (Landing Page)

Página inicial com:

Mensagem principal e benefícios.

CTA primário “Criar minha Startup GRÁTIS”.

CTAs secundários mockados.

Ajuste de SEO e responsividade.

Integração do botão “Criar minha Startup” → redirecionar para criação de ideia.

Semana 4 – Página de Criação de Ideia (Chat IA)

Integração inicial com API externa (OpenAI ou similar).

Implementar fluxo:

“Já tenho uma ideia e quero melhorar”

“Quero gerar uma nova ideia”

Histórico de chat (frontend + backend).

Detecção de “definição mínima” → exibir botão “Iniciar minha Startup”.

Testes de performance/latência.

Semana 5 – Dashboard do Usuário

Estrutura da dashboard com cards de projetos.

Cada card exibe:

Nome provisório (editável inline).

Resumo editável (400 chars).

Score, Valuation, Equipe (mock), Selo, Barra de evolução.

Próxima tarefa.

Regras iniciais para cálculo de Score/Valuation (mock + integração básica IA).

Semana 6 – Página do Projeto

Layout do projeto com cabeçalho completo (nome, resumo, score, valuation, badges, progresso, equipe).

Estrutura de fases (accordion ou colunas) com tarefas.

Navegação entre fases/tarefas.

Salvamento automático de edições.

Semana 7 – Popup de Edição de Tarefa + IA Avaliadora

Criar modal de edição de tarefa (texto rico simples).

Implementar botão “Submeter à avaliação da IA”:

Envio de dados para API externa.

Spinner/estado “Avaliando…”.

Atualização de score parcial + valuation.

Exibir recomendações da IA (“Melhorias aplicáveis”).

Toasts/feedback ao usuário.

Semana 8 – Métricas, Badges e Refinamentos

Regras visuais completas para:

Score (0–10 com frações).

Valuation dinâmico (mock avançado).

Selos/badges por faixa de score.

Barra de evolução com gradiente.

Ajustes de UI/UX no fluxo.

Melhorias no design e consistência visual.

Semana 9 – Testes, Deploy Final e Demonstração

Testes E2E básicos (login → criar ideia → dashboard → editar tarefa).

Deploy estável no Vercel (frontend) e Railway/Render (backend).

Ajustes de performance e segurança (rate limits na API IA).

Preparar demo funcional para stakeholders/testadores.

⚡ Resultado ao final das 9 semanas:

Usuário consegue entrar na plataforma, criar ou melhorar ideias via IA, iniciar um projeto, ver suas métricas visuais (score, valuation, badges, barra de evolução), navegar no dashboard, abrir tarefas, submeter à avaliação da IA e acompanhar a evolução do seu projeto.