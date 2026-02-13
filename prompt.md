> **MCP sequential-thinking:** execute em etapas numeradas, validando critérios de aceite ao final de cada etapa antes de prosseguir. Documente decisões, crie diffs claros e checklists.

## 0) Premissas (não negociar)

* Stack: **React 19^**, **Vite (latest)**, **TypeScript strict**, **Tailwind CSS 4.1** + plugins de animação, **Framer Motion** para microinterações, **react-helmet-async** para SEO, **react-router-dom** (routing), **i18next + react-i18next** (i18n PT/EN/ES).
* Qualidade: **ESLint + Prettier**, **Vitest** (unit), **Testing Library** (component), **Playwright** (e2e), **axe-core** (a11y).
* Segurança front: **CSP** estrita, **SRI**, **no eval**, sanitização, isolamento de secrets via `.env`, **Trusted Types** quando suportado.
* Telemetria vendor-free (eventos no `dataLayer`) — sem SDK de terceiros nesta fase.
* Microtransações: camada **abstrata** (placeholders) para **depósito/voto/claim** (sem back on-chain nesta etapa), mostrando **taxas 100 LUNES + 10 LUSDT** e comportamento de UI seguro.

## 1) Planejamento → Tarefas

1. **Scaffold do projeto** (Vite React-TS), **Tailwind 4.1** configurado, **Router**, **Helmet**, **i18n** com detecção de locale (PT default, EN/ES).
2. **CSP** (meta + headers de build), **SRI** nos assets, `helmet` tags, canonical + `hreflang` PT/EN/ES.
3. **Design tokens** (Tailwind): tipografia, espaçamentos, cores neutras elegantes, dark mode, motion reduzido por `prefers-reduced-motion`.
4. **Layout base**: Header (menu + switch de idioma), Footer (disclaimers/links), Grid responsivo, animações leves.
5. **Páginas públicas**: Home, Como Funciona, Score, Projetos (lista), Projeto (detalhe – read-only), Governança (visualização), FAQ, Blog (stub), Termos, Privacidade.
6. **SEO técnico**: `sitemap.xml`, `robots.txt`, metadados OG/Twitter, JSON-LD básico (Organization/SiteNavigationElement), breadcrumbs.
7. **A11y**: navegação por teclado, aria-labels, foco visível, contraste AA/AAA.
8. **Telemetria**: eventos mínimos (view, CTA, filtro, abrir modal).
9. **Microtransações (UI placeholder)**: modais de **Depositar Doação**, **Votar**, **Claim** com validações de valor, exibição de taxas, `disabled` sem carteira.

**Critérios de aceite da etapa:** repo compila, lint passa, testes iniciais rodam, páginas renderizam, i18n troca idioma, SEO tags básicas presentes, CSP ativa sem violar console.

## 2) Comandos & Dependências (gerar automaticamente)

* Inicialização:

  * `npm create vite@latest safegard-web -- --template react-ts`
  * `npm i react-router-dom react-helmet-async i18next react-i18next framer-motion`
  * `npm i -D typescript @types/react @types/react-dom eslint prettier vite-plugin-sri vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright axe-core`
  * **Tailwind 4.1**: instalar e configurar (incluir plugins de animação e tipografia se necessário).
* Scripts: `dev`, `build`, `preview`, `test`, `test:e2e`, `lint`, `format`, `analyze` (bundle).
* Husky + lint-staged (pré-commit).

**Critérios:** `npm run dev` ok, Tailwind aplicado, Helmet no ar, rota `/` e troca de idiomas funcionando.

## 3) Estrutura de Pastas (gerar)

```
/src
  /app      (App root, providers, router, helmet, i18n init)
  /assets   (imgs/svg)
  /components
    Header.tsx  Footer.tsx  LangSwitcher.tsx  CardProject.tsx  Metric.tsx  Donut.tsx
    Seo.tsx     Badge.tsx   Alert.tsx         EmptyState.tsx   Skeleton.tsx
    Modals/DepositModal.tsx  VoteModal.tsx  ClaimModal.tsx
  /features
    home/        how-it-works/   score/   projects/   project-detail/
    governance/  faq/            blog/    legal/
  /i18n
    pt.json  en.json  es.json  index.ts
  /styles   (tailwind.css, design tokens)
  /utils    (formatters, csp helpers, seo helpers)
  /types    (Project, Vault, Vote, Claim, Enums)
```

## 4) Rotas (public)

* `/` Home
* `/como-funciona` • `/score-de-garantia` • `/projetos` • `/projetos/:slug`
* `/governanca` • `/faq` • `/blog` • `/termos` • `/privacidade`
* Locales: prefixos `/en/*`, `/es/*`, `hreflang` + canonical.

**Critérios:** rotas e breadcrumbs operam, 404 amigável.

## 5) UI/UX • Diretrizes

* **Estilo:** elegante, minimalista, tipografia moderna, sombras suaves, cantos 2xl, grids limpos.
* **Animações:** Framer Motion (fade/slide sutis), Tailwind animate para feedback (skeleton, spinners).
* **Acessibilidade:** todos os componentes com aria labels e ordem de tab consistente.
* **Dark mode:** automático por `prefers-color-scheme`, override manual no header.

## 6) Conteúdo (usar as copys já aprovadas)

* Home (hero com claim: “**Primeiro protocolo descentralizado de garantias para Web3**”), métricas, destaques, bloco “Benefícios ao investidor Lunes”, disclaimer.
* Como Funciona, Score, Projetos (lista com filtros), Projeto (detalhe com Score/Cofre/Timeline), Governança (visão), FAQ, Blog stub, Termos/Privacidade.
* **i18n:** carregar strings PT/EN/ES; `LangSwitcher` persiste preferência (localStorage).

**Critérios:** trocar idioma altera **todo** o texto navegável e `title/meta`.

## 7) SEO • Implementação

* **react-helmet-async**: Title, Description, OG, Twitter, canonical, `hreflang` (PT/EN/ES), `x-default`.
* `sitemap.xml` + `robots.txt` (excluir `/admin` futuro).
* **JSON-LD**: `Organization`, `BreadcrumbList`, `SiteNavigationElement`.
* **URLs limpas**, slugs `kebab-case`, links absolutos para canonical.

**Critérios:** validados em `lighthouse` (>95 SEO), tags presentes por página.

## 8) Segurança • Implementação inicial

* **CSP**: `default-src 'self'; script-src 'self' 'strict-dynamic' 'nonce-<runtime>'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`
* **SRI** em assets externos (se houver), **desativar eval**, nenhuma lib de terceiros sem necessidade.
* **Sanitização** de qualquer HTML dinâmico (evitar `dangerouslySetInnerHTML`).
* **Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
* **Build** sem secrets, `.env.example` com chaves neutras.
* **Supply chain:** lockfile, `npm audit`, dependabot ativável depois.

**Critérios:** sem violações CSP no console; testes de navegação mantêm integridade.

## 9) Microtransações • Placeholders seguros

* Componentes de UI: **DepositModal**, **VoteModal**, **ClaimModal** com:

  * Campo valor (validação, min/max), seletor de token (LUNES/LUSDT/PSP22), **taxa fixa renderizada (100 LUNES + 10 LUSDT)**, resumo antes de confirmar.
  * Estados: **saldo insuficiente**, **sem carteira conectada** (desabilitar), **sucesso** (fake TX id), **erro** (ID de rastreio).
* **Abstração `txClient`** (mock): `estimateFee()`, `formatAmount()`, `submitDeposit()`, `submitVote()`, `submitClaim()` — apenas simula respostas e latência.
* **Segurança de UI**: botões ficam `disabled` se pré-requisitos não atendidos; confirmar com checkbox “**Entendo que é doação sem resgate**”.

**Critérios:** fluxos abrem/fecham, validação funciona, **nenhuma transação real** executada.

## 10) Telemetria (vendor-free)

* `window.dataLayer.push({ event, page, locale, projectId?, scoreBand?, cta? })`
* Eventos: `page_view`, `cta_click`, `filter_apply`, `modal_open`, `deposit_confirm_view`, `vote_confirm_view`, `claim_confirm_view`.

**Critérios:** eventos disparam nos pontos previstos (inspecionar no console).

## 11) Testes (mínimo viável)

* Unit: render dos componentes chave (CardProject, Modals).
* A11y: `axe` sem violações críticas nas páginas.
* e2e (Playwright): navegação menu, troca de idioma, abrir/fechar modais, filtros básicos.

**Critérios:** pipeline `test` verde.

---

## Entregáveis desta fase (público)

* Repo com scaffold + páginas públicas + i18n + SEO + segurança base + modais de microtransação (mock).
* `README.md` com runbook, variáveis de ambiente, checklists de segurança/SEO.
* `sitemap.xml` e `robots.txt` gerados.
* **Design tokens** + diretrizes de animação.

---

## Backlog Próximo (fora desta entrega)

* Integração real de carteira e provider da rede (abstração chain-agnostic).
* SSR/SSG (opcional) para SEO máximo com Vite SSR.
* Página **Projetos — dados on-chain**, paginação e filtros persistentes.
* Console Admin (registrar projeto, depósitos reais, propostas).
* Painel de métricas públicas (TVL on-chain).

---

## Aceite Final (checklist)

* [ ] Build sem erros, Lighthouse ≥ 95 (Performance ≥ 85, A11y ≥ 95, SEO ≥ 95, Best Practices ≥ 95)
* [ ] CSP ativa e sem violações, nenhuma `eval`, nenhum HTML não saneado
* [ ] i18n EN//ES completo (UI, SEO, hreflang, canonical)
* [ ] Páginas públicas implementadas conforme mapa e copys aprovadas
* [ ] Modais de microtransação com validação e mensagens (mock)
* [ ] `sitemap.xml`, `robots.txt`, JSON-LD, OG/Twitter tags ok
* [ ] Testes unitários, a11y e e2e mínimos passando

---

