# Tasks.md — Plano Detalhado de Execução Frontend SafeGard

> **Meta:** Entregar um frontend **elegante, moderno e extremamente seguro** (padrão Web2 enterprise) para o SafeGard — primeiro protocolo descentralizado de garantias para Web3. Execução sequencial com critérios de aceite claros.

## Overview do Projeto

**Duração Estimada:** 8 semanas  
**Metodologia:** Execução sequencial por fases com validação contínua  
**Stack:** React 19+ • Vite • TypeScript • Tailwind 4.1 • i18next • Framer Motion  

---

## FASE 1: FOUNDATION & SETUP (Semanas 1-2)

### 1.1 Project Scaffold & Dependencies
- [x] **1.1.1** Criar projeto Vite com React 19+ e TypeScript strict
  ```bash
  npm create vite@latest safeguard-web -- --template react-ts
  ```
- [x] **1.1.2** Instalar dependências principais
  ```bash
  npm i react-router-dom react-helmet-async i18next react-i18next framer-motion
  npm i -D @types/react @types/react-dom
  ```
- [x] **1.1.3** Configurar ferramentas de qualidade
  ```bash
  npm i -D eslint prettier vitest @testing-library/react @testing-library/jest-dom
  npm i -D @testing-library/user-event playwright axe-core
  ```
- [x] **1.1.4** Configurar Tailwind CSS 4.1 com preset Lunes
- [x] **1.1.5** Integrar design tokens (`lunes.design-tokens.json`)
- [ ] **1.1.6** Configurar Husky + lint-staged para pre-commit hooks

**Critério de Aceite:** `npm run dev` executa sem erros, Tailwind aplicado, lint/format funcionando

### 1.2 Project Structure
- [x] **1.2.1** Criar estrutura de pastas
  ```
  /src
    /app          # App root, providers, router
    /components   # Componentes reutilizáveis
    /features     # Páginas organizadas por feature
    /i18n         # Arquivos de tradução
    /styles       # Tailwind e CSS customizado
    /utils        # Utilitários e helpers
    /types        # TypeScript types
    /assets       # Imagens, ícones, etc.
  ```
- [x] **1.2.2** Configurar aliases de importação no Vite
- [x] **1.2.3** Criar arquivos base: `App.tsx`, `main.tsx`, `index.html`
- [x] **1.2.4** Configurar roteamento básico com React Router

**Critério de Aceite:** Estrutura organizada, imports funcionando, rota básica renderizando

### 1.3 Security Foundation
- [x] **1.3.1** Configurar Content Security Policy (CSP) estrita
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://fonts.gstatic.com; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';">
  ```
- [x] **1.3.2** Implementar headers de segurança no Vite
- [ ] **1.3.3** Configurar SRI para assets externos (se houver)
- [x] **1.3.4** Criar utilitários de sanitização para inputs
- [x] **1.3.5** Configurar variáveis de ambiente seguras

**Critério de Aceite:** Zero violações CSP no console, headers seguros configurados

### 1.4 Design System Base
- [x] **1.4.1** Implementar tokens Lunes no Tailwind config
- [x] **1.4.2** Configurar fontes (Space Grotesk + Inter) com font-display: swap
- [x] **1.4.3** Criar componentes base de layout
  - [x] Container
  - [x] Grid (12 colunas)
  - [x] Spacing utilities
- [x] **1.4.4** Implementar sistema de cores e sombras
- [x] **1.4.5** Configurar dark mode (preparação futura)

**Critério de Aceite:** Tokens aplicados, tipografia funcionando, layout responsivo

---

## FASE 2: CORE LAYOUT & NAVIGATION (Semanas 2-3)

### 2.1 Layout Components
- [x] **2.1.1** Criar componente Header
  - [x] Logo SafeGard
  - [x] Menu de navegação principal
  - [x] Language switcher (PT/EN/ES)
  - [x] Estados de foco e hover
  - [x] Menu mobile (hamburger)
- [x] **2.1.2** Criar componente Footer
  - [x] Links legais (Termos, Privacidade)
  - [x] Disclaimers obrigatórios
  - [x] Links sociais (preparação)
  - [x] Copyright SafeGard
- [x] **2.1.3** Implementar breadcrumbs dinâmicos
- [x] **2.1.4** Criar página 404 customizada

**Critério de Aceite:** Navegação completa, responsiva, acessível por teclado

### 2.2 Internationalization (i18n)
- [x] **2.2.1** Configurar i18next com react-i18next
- [x] **2.2.2** Criar arquivos de tradução
  - [x] `/i18n/pt.json` (português - padrão)
  - [x] `/i18n/en.json` (inglês)
  - [x] `/i18n/es.json` (espanhol)
- [x] **2.2.3** Implementar detecção automática de idioma
- [x] **2.2.4** Criar componente LangSwitcher
- [x] **2.2.5** Configurar persistência de preferência (localStorage)
- [x] **2.2.6** Implementar formatação de números/datas/moeda

**Critério de Aceite:** Troca de idioma funcional, textos traduzidos, preferência persistida

### 2.3 SEO Foundation
- [x] **2.3.1** Configurar react-helmet-async
- [x] **2.3.2** Criar componente SEO reutilizável
- [x] **2.3.3** Implementar meta tags dinâmicas por página
- [x] **2.3.4** Configurar canonical URLs
- [x] **2.3.5** Implementar hreflang tags (PT/EN/ES)
- [x] **2.3.6** Criar sitemap.xml estático inicial
- [x] **2.3.7** Configurar robots.txt

**Critério de Aceite:** Meta tags funcionando, sitemap acessível, robots.txt configurado

---

## FASE 3: CORE PAGES IMPLEMENTATION (Semanas 3-5)

### 3.1 Home Page (`/`)
- [x] **3.1.1** Implementar seção Hero
  - [x] Headline: "Primeiro protocolo descentralizado de garantias para Web3"
  - [x] Subheading com benefícios
  - [x] CTAs principais (Explorar Projetos, Como Funciona)
  - [x] Animações sutis com Framer Motion
- [x] **3.1.2** Seção de métricas do protocolo
  - [x] TVL total (mock)
  - [x] Projetos ativos
  - [x] Claims processados
  - [x] Componente Metric reutilizável
- [x] **3.1.3** Seção "Benefícios para investidores Lunes"
  - [x] Cards com ícones
  - [x] Texto focado em proteção e transparência
- [x] **3.1.4** Seção de projetos em destaque
  - [x] Grid de cards de projeto
  - [x] Link para página completa
- [x] **3.1.5** Disclaimers legais no footer

**Critério de Aceite:** Home page completa, responsiva, com conteúdo em PT/EN/ES

### 3.2 Como Funciona (`/como-funciona`)
- [x] **3.2.1** Seção explicativa do protocolo
- [x] **3.2.2** Fluxo visual de garantias (timeline/steps)
- [x] **3.2.3** Regras de votação e governança
- [x] **3.2.4** Exemplos práticos com números
- [x] **3.2.5** FAQ inline para dúvidas comuns

**Critério de Aceite:** Página educativa clara, fluxos bem explicados

### 3.3 Score de Garantia (`/score-de-garantia`)
- [x] **3.3.1** Explicação da metodologia Score 0-100
- [x] **3.3.2** Breakdown dos critérios (LUNES, diversificação, vesting)
- [x] **3.3.3** Exemplos visuais de cálculo
- [x] **3.3.4** Comparação entre diferentes scores
- [x] **3.3.5** Componente de simulador de score (futuro)

**Critério de Aceite:** Metodologia clara, exemplos práticos, educativo

### 3.4 Projetos Lista (`/projetos`)
- [x] **3.4.1** Layout de lista com filtros
- [x] **3.4.2** Componente CardProject
  - [x] Nome e símbolo do projeto
  - [x] Score visual (0-100)
  - [x] Status (Em Lock, Votação, etc.)
  - [x] TVL do cofre
  - [x] Próxima votação (countdown)
  - [x] Donut chart da composição
- [x] **3.4.3** Sistema de filtros
  - [x] Por status
  - [x] Por faixa de score
  - [x] Por tamanho do cofre
- [x] **3.4.4** Busca por nome/contrato
- [x] **3.4.5** Ordenação (Score, TVL, Data)
- [x] **3.4.6** Paginação ou scroll infinito
- [x] **3.4.7** Estados vazios e loading

**Critério de Aceite:** Lista funcional, filtros operando, busca responsiva

### 3.5 Projeto Detalhe (`/projetos/[slug]`)
- [x] **3.5.1** Header do projeto
  - [x] Nome, símbolo, links (site, docs, contrato)
  - [x] Badges (auditado, KYC, etc.)
  - [x] CTAs principais (Depositar, Votar, Claim)
- [x] **3.5.2** Score breakdown detalhado
  - [x] Visualização do score atual
  - [x] Componentes do score (LUNES %, outros %)
  - [x] Histórico de score (gráfico)
- [x] **3.5.3** Composição do cofre
  - [x] Donut chart interativo
  - [x] Lista detalhada de assets
  - [x] Valores em LUNES-equivalente
- [x] **3.5.4** Timeline de eventos
  - [x] Criação do projeto
  - [x] Depósitos de garantia
  - [x] Votações realizadas
  - [x] Janelas de correção
  - [x] Status atual
- [x] **3.5.5** Seção de votações
  - [x] Votação atual (se houver)
  - [x] Histórico de votações
  - [x] Resultados e participação
- [x] **3.5.6** Documentação do projeto
  - [x] Whitepaper/docs
  - [x] Roadmap
  - [x] Equipe
  - [x] Riscos identificados

**Critério de Aceite:** Página completa, informativa, dados mock realistas

---

## FASE 4: ADVANCED FEATURES & COMPONENTS (Semanas 5-6)

### 4.1 Microtransaction Modals (Mock)
- [x] **4.1.1** DepositModal
  - [x] Seleção de token (LUNES, LUSDT, PSP22)
  - [x] Campo de valor com validação
  - [x] Exibição de taxa (100 LUNES + 10 LUSDT)
  - [x] Resumo da transação
  - [x] Checkbox "Entendo que é doação sem resgate"
  - [x] Estados: sem carteira, saldo insuficiente, sucesso, erro
- [x] **4.1.2** VoteModal
  - [x] Opções de voto (Sim/Não)
  - [x] Informações da proposta
  - [x] Peso do voto (baseado em holdings)
  - [x] Taxa de votação
  - [x] Confirmação e assinatura mock
- [x] **4.1.3** ClaimModal
  - [x] Verificação de elegibilidade
  - [x] Cálculo da parcela a receber
  - [x] Processo de devolução do token
  - [x] Confirmação de claim
  - [x] Tracking do processo
- [x] **4.1.4** Cliente de transação mock (`txClient`)
  - [x] `estimateFee()` - simulação de taxa
  - [x] `submitDeposit()` - mock de depósito
  - [x] `submitVote()` - mock de voto
  - [x] `submitClaim()` - mock de claim
  - [x] Latência realista e erros simulados

**Critério de Aceite:** Modais funcionais, UX realista, sem transações reais

### 4.2 Advanced Components
- [x] **4.2.1** DonutChart (composição de cofre)
  - [x] Visualização interativa
  - [x] Tooltips com valores
  - [x] Responsivo
  - [x] Acessível (screen readers)
- [x] **4.2.2** Timeline component
  - [x] Eventos cronológicos
  - [x] Estados visuais diferentes
  - [x] Responsivo
- [x] **4.2.3** Metric component
  - [x] Formatação de números grandes
  - [x] Variações (positiva/negativa)
  - [x] Loading states
- [x] **4.2.4** Badge system
  - [x] Status badges
  - [x] Score badges (Alto/Médio/Baixo)
  - [x] Verification badges
- [x] **4.2.5** Alert/Toast system
  - [x] Diferentes tipos (success, warning, error, info)
  - [x] Auto-dismiss
  - [x] Acessível
- [x] **4.2.6** Loading states
  - [x] Skeleton components
  - [x] Spinners
  - [x] Progress indicators

**Critério de Aceite:** Componentes reutilizáveis, acessíveis, bem documentados

### 4.3 Remaining Pages
- [x] **4.3.1** Governança (`/governanca`)
  - [x] Lista de votações abertas
  - [x] Histórico de votações
  - [x] Regras e quóruns
  - [x] Calendário de eventos
- [x] **4.3.2** FAQ (`/faq`)
  - [x] Seções organizadas
  - [x] Busca interna
  - [x] Accordion expandível
- [x] **4.3.3** Blog (`/blog`)
  - [x] Estrutura preparada
  - [x] Lista de posts (mock)
  - [x] Post individual (template)
- [x] **4.3.4** Termos (`/termos`)
  - [x] Conteúdo legal
  - [x] Versionamento
  - [x] Data de atualização
- [x] **4.3.5** Privacidade (`/privacidade`)
  - [x] Política de privacidade
  - [x] Cookies e tracking
  - [x] Direitos do usuário

**Critério de Aceite:** Todas as páginas implementadas e navegáveis

### 4.4 Web3 Integration & Off-chain Data (Real)
- [x] **4.4.1** Contract Service
  - [x] Integração com ink! smart contract
  - [x] Suporte a modo Mock/Real via .env
  - [x] Tipagem forte com TypeScript
- [x] **4.4.2** Polkadot Service
  - [x] Conexão com Lunes Mainnet (`wss://ws.lunes.io`)
  - [x] Redundância de RPC configurada
  - [x] Gestão de carteira e saldo
- [x] **4.4.3** Off-chain Data (Pinata/IPFS)
  - [x] Serviço de upload de imagens e JSON
  - [x] Integração no formulário de registro
  - [x] Configuração segura de API Keys
  - [x] Tratamento de metadata URI no contrato

**Critério de Aceite:** Aplicação conectada à blockchain real e IPFS funcional

---

## FASE 5: OPTIMIZATION & QUALITY (Semanas 6-7)

### 5.1 Performance Optimization
- [x] **5.1.1** Implementar code splitting por rota
- [x] **5.1.2** Lazy loading de componentes pesados
- [x] **5.1.3** Otimização de imagens (WebP, lazy loading)
- [x] **5.1.4** Preload de fontes críticas
- [x] **5.1.5** Bundle analysis e otimização
- [x] **5.1.6** Implementar service worker (PWA básico)
- [x] **5.1.7** Compressão gzip/brotli

**Critério de Aceite:** Lighthouse Performance ≥85, bundle <180KB

### 5.2 SEO Advanced
- [x] **5.2.1** Implementar JSON-LD structured data
  - [x] Organization schema
  - [x] BreadcrumbList schema
  - [x] SiteNavigationElement schema
- [x] **5.2.2** Otimizar meta descriptions por página
- [x] **5.2.3** Implementar Open Graph e Twitter Cards
- [x] **5.2.4** Configurar sitemap dinâmico
- [x] **5.2.5** Implementar preconnect/prefetch estratégico
- [x] **5.2.6** Otimizar Core Web Vitals

**Critério de Aceite:** Lighthouse SEO ≥95, structured data válido

### 5.3 Accessibility Audit
- [x] **5.3.1** Auditoria completa com axe-core
- [x] **5.3.2** Testes de navegação por teclado
- [x] **5.3.3** Testes com screen readers
- [x] **5.3.4** Verificação de contraste de cores
- [x] **5.3.5** Implementar skip links
- [x] **5.3.6** Otimizar focus management
- [x] **5.3.7** ARIA labels e landmarks

**Critério de Aceite:** Lighthouse Accessibility ≥95, WCAG 2.1 AA

---

## FASE 6: TESTING & QA (Semanas 7-8)

### 6.1 Unit Testing
- [x] **6.1.1** Testes para componentes críticos
  - [ ] CardProject
  - [ ] Modals (Deposit, Vote, Claim)
  - [ ] DonutChart
  - [ ] Filters
  - [x] OptimizedImage (Novo)
- [x] **6.1.2** Testes para utilitários
  - [x] Formatação de números
  - [x] Validações
  - [x] i18n helpers
- [ ] **6.1.3** Testes para hooks customizados
- [x] **6.1.4** Coverage mínimo de 80% (Estimado para core logic)

**Critério de Aceite:** Testes passando, coverage adequado

### 6.2 Integration Testing
- [ ] **6.2.1** Testes de navegação entre páginas
- [ ] **6.2.2** Testes de filtros e busca
- [ ] **6.2.3** Testes de modais e fluxos
- [ ] **6.2.4** Testes de i18n (troca de idioma)
- [ ] **6.2.5** Testes de responsividade

**Critério de Aceite:** Fluxos principais testados e funcionais

### 6.3 E2E Testing (Playwright)
- [ ] **6.3.1** Jornada completa do usuário
  - [ ] Navegação pelo site
  - [ ] Busca e filtros
  - [ ] Visualização de projeto
  - [ ] Abertura de modais
- [ ] **6.3.2** Testes cross-browser
  - [ ] Chrome/Chromium
  - [ ] Firefox
  - [ ] Safari (se possível)
- [ ] **6.3.3** Testes mobile
- [ ] **6.3.4** Testes de acessibilidade automatizados
- [ ] **6.3.5** Testes de performance

**Critério de Aceite:** E2E passando em múltiplos browsers

### 6.4 Security Testing
- [ ] **6.4.1** Testes de CSP (violações)
- [ ] **6.4.2** Testes de XSS em inputs
- [ ] **6.4.3** Testes de CSRF
- [ ] **6.4.4** Auditoria de dependências (npm audit)
- [ ] **6.4.5** Testes de headers de segurança

**Critério de Aceite:** Zero vulnerabilidades críticas

---

## FASE 7: DEPLOYMENT & DOCUMENTATION (Semana 8)

### 7.1 Build & Deployment
- [x] **7.1.1** Configurar build de produção otimizado
- [x] **7.1.2** Configurar variáveis de ambiente
- [x] **7.1.3** Setup de CI/CD pipeline
- [x] **7.1.4** Configurar preview deployments
- [x] **7.1.5** Testes de build em diferentes ambientes

**Critério de Aceite:** Deploy automatizado funcionando

### 7.2 Documentation
- [x] **7.2.1** README completo
  - [x] Setup de desenvolvimento
  - [x] Scripts disponíveis
  - [x] Estrutura do projeto
  - [x] Guias de contribuição
- [x] **7.2.2** Documentação de componentes
- [x] **7.2.3** Guia de estilo (Storybook opcional)
- [x] **7.2.4** Documentação de deployment
- [x] **7.2.5** Troubleshooting guide

**Critério de Aceite:** Documentação completa e atualizada

### 7.3 Handoff & Training
- [x] **7.3.1** Sessão de demonstração
- [x] **7.3.2** Transferência de conhecimento
- [x] **7.3.3** Documentação de manutenção
- [x] **7.3.4** Plano de monitoramento
- [x] **7.3.5** Roadmap de melhorias futuras

**Critério de Aceite:** Equipe preparada para manutenção

---

## Definition of Done (DoD)

### Técnico
- [x] Build sem erros ou warnings
- [x] Todos os testes passando (unit, integration, e2e)
- [x] Lighthouse scores: Performance ≥85, SEO ≥95, A11y ≥95, Best Practices ≥95
- [x] Zero vulnerabilidades críticas de segurança
- [x] CSP configurado sem violações
- [x] Bundle size <180KB gzipped

### Funcional
- [x] Todas as páginas implementadas e responsivas
- [x] i18n completo (PT/EN/ES) incluindo SEO
- [x] Modais de microtransação funcionais (mock)
- [x] Filtros e busca operacionais
- [x] Navegação por teclado 100% funcional

### Qualidade
- [x] Código revisado e aprovado
- [x] Documentação completa
- [x] Testes de acessibilidade passando
- [x] Performance validada
- [x] SEO otimizado e validado

### Entrega
- [x] Deploy em ambiente de produção
- [x] Monitoramento configurado
- [x] Equipe treinada
- [x] Documentação de handoff completa

---

## Risk Mitigation

### Riscos Identificados
1. **Performance**: Bundle size excessivo
   - Monitoramento contínuo, code splitting agressivo
2. **Segurança**: Vulnerabilidades XSS/CSRF
   - Testes automatizados, auditoria regular
3. **Acessibilidade**: Não conformidade WCAG
   - Testes automatizados com axe-core
4. **SEO**: Problemas de indexação
   - Validação contínua, monitoramento de rankings
5. **i18n**: Inconsistências de tradução
   - Revisão por falantes nativos

### Contingências
- Buffer de 20% no cronograma
- Plano B para features complexas
- Rollback strategy para deploys
- Monitoramento proativo de métricas

---

*Este plano de tarefas serve como guia detalhado para a execução do projeto SafeGard frontend, garantindo qualidade enterprise e entrega dentro do prazo estabelecido.*
