
# Árvore (público)

* **Home** → `/`

  * Métricas (seção)
  * Destaques (seção)
  * Como funciona (seção-âncora opcional: `/#como-funciona`)
  * Disclaimers (rodapé)
* **Como Funciona** → `/como-funciona`
* **Score de Garantia** → `/score-de-garantia`
* **Projetos** (lista) → `/projetos`

  * Filtros, busca, ordenação
* **Projeto — Detalhe** (dinâmico) → `/projetos/[slug]`

  * Score breakdown
  * Cofre & composição
  * Linha do tempo
  * Votações (visão)
  * Claim (se houver)
  * Sobre/Docs/Riscos
  * (Deep-links opcionais)

    * Depositar doação → `/projetos/[slug]/depositar` *(ou modal)*
    * Votar → `/projetos/[slug]/votar` *(ou modal)*
    * Claim → `/projetos/[slug]/claim` *(ou modal)*
* **Governança (visualização)** → `/governanca`

  * Votações abertas → `/governanca/votacoes`
  * Votação (detalhe leitura) → `/governanca/votacoes/[id]`
  * Regras & snapshots → `/governanca/regras`
* **Blog / Updates** → `/blog`

  * Post (dinâmico) → `/blog/[slug]`
* **FAQ** → `/faq`
* **Termos** → `/termos`
* **Privacidade** → `/privacidade`

# Árvore (área Admin do Projeto)

* **Acesso Admin** (login / conectar carteira) → `/acesso-admin`
* **Dashboard do Projeto** → `/admin`

  * Resumo (score, cofre, próxima votação)
  * Alertas (votação/janela/claims)
* **Onboarding de Projeto** (wizard) → `/admin/onboarding`

  * Passo 1 — Identidade → `/admin/onboarding/identidade`
  * Passo 2 — Token → `/admin/onboarding/token`
  * Passo 3 — Documentos → `/admin/onboarding/documentos`
  * Passo 4 — Revisão & termos → `/admin/onboarding/revisao`
  * Passo 5 — Criação do cofre → `/admin/onboarding/cofre`
* **Depósitos de Garantia** → `/admin/depositos`

  * Histórico com filtros → `/admin/depositos/historico`
* **Votações & Propostas** → `/admin/votacoes`

  * Criar proposta (janela 60d) → `/admin/votacoes/nova`
  * Acompanhamento → `/admin/votacoes/historico`
* **Extensão de Lock (+3 anos)** → `/admin/extensao-lock`
* **Eventos / Logs (leitura/export)** → `/admin/eventos`

> **Observação SEO:** rotas `/admin/*`, `/acesso-admin` e deep-links de ação não devem ser indexadas.

# Slugs & convenções

* Idioma padrão PT. EN/ES com prefixo:

  * `/en/*` (e.g., `/en/how-it-works`, `/en/projects/[slug]`)
  * `/es/*` (e.g., `/es/como-funciona`, `/es/proyectos/[slug]`)
* Slugs de projeto: `kebab-case`, ex.: `projeto-exemplo`, chaveado por `contract` no CMS/chain.
* Slugs de post: data + título opcional, ex.: `2025-08-10-governanca-2025`.

# Breadcrumbs (padrão)

* Home › Projetos › {Projeto}
* Home › Governança › Votações › {Votação}
* Home › Blog › {Post}

# Sitemap XML (modelo)

**Index:** `/sitemap.xml`

```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://example.com/sitemaps/public-pt.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/projects-pt.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/blog-pt.xml</loc></sitemap>

  <sitemap><loc>https://example.com/sitemaps/public-en.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/projects-en.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/blog-en.xml</loc></sitemap>

  <sitemap><loc>https://example.com/sitemaps/public-es.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/projects-es.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/blog-es.xml</loc></sitemap>
</sitemapindex>
```

**Público (ex.: `public-pt.xml`)**

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/como-funciona</loc></url>
  <url><loc>https://example.com/score-de-garantia</loc></url>
  <url><loc>https://example.com/projetos</loc></url>
  <url><loc>https://example.com/governanca</loc></url>
  <url><loc>https://example.com/governanca/votacoes</loc></url>
  <url><loc>https://example.com/faq</loc></url>
  <url><loc>https://example.com/blog</loc></url>
  <url><loc>https://example.com/termos</loc></url>
  <url><loc>https://example.com/privacidade</loc></url>
</urlset>
```

**Projetos dinâmicos (ex.: `projects-pt.xml`)**

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Gerado periodicamente a partir da index on-chain/CMS -->
  <url><loc>https://example.com/projetos/projeto-exemplo</loc></url>
  <url><loc>https://example.com/projetos/outro-projeto</loc></url>
</urlset>
```

**Blog dinâmico (ex.: `blog-pt.xml`)**

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/blog/relatorio-governanca-2025</loc></url>
</urlset>
```

# hreflang (por página pública)

Inclua em cada página o bloco hreflang:

```html
<link rel="canonical" href="https://example.com/projetos/projeto-exemplo" />
<link rel="alternate" hreflang="pt-br" href="https://example.com/projetos/projeto-exemplo" />
<link rel="alternate" hreflang="en"    href="https://example.com/en/projects/project-example" />
<link rel="alternate" hreflang="es"    href="https://example.com/es/proyectos/proyecto-ejemplo" />
<link rel="alternate" hreflang="x-default" href="https://example.com/projetos/projeto-exemplo" />
```

# robots.txt (trecho essencial)

```
User-agent: *
Disallow: /admin/
Disallow: /acesso-admin
Disallow: /projetos/*/depositar
Disallow: /projetos/*/votar
Disallow: /projetos/*/claim
Sitemap: https://example.com/sitemap.xml
```

# Navegação (menus)

**Header (público):**
Logo | Projetos | Como Funciona | Score | Governança | Blog | FAQ | (Idioma: PT/EN/ES) | Acesso Admin

**Footer:**
Score de Garantia | Termos | Privacidade | Contato (opcional) | Socials | © SafeGard

---


# Árvore (público)

* **Home** → `/`

  * Métricas (seção)
  * Destaques (seção)
  * Como funciona (seção-âncora opcional: `/#como-funciona`)
  * Disclaimers (rodapé)
* **Como Funciona** → `/como-funciona`
* **Score de Garantia** → `/score-de-garantia`
* **Projetos** (lista) → `/projetos`

  * Filtros, busca, ordenação
* **Projeto — Detalhe** (dinâmico) → `/projetos/[slug]`

  * Score breakdown
  * Cofre & composição
  * Linha do tempo
  * Votações (visão)
  * Claim (se houver)
  * Sobre/Docs/Riscos
  * (Deep-links opcionais)

    * Depositar doação → `/projetos/[slug]/depositar` *(ou modal)*
    * Votar → `/projetos/[slug]/votar` *(ou modal)*
    * Claim → `/projetos/[slug]/claim` *(ou modal)*
* **Governança (visualização)** → `/governanca`

  * Votações abertas → `/governanca/votacoes`
  * Votação (detalhe leitura) → `/governanca/votacoes/[id]`
  * Regras & snapshots → `/governanca/regras`
* **Blog / Updates** → `/blog`

  * Post (dinâmico) → `/blog/[slug]`
* **FAQ** → `/faq`
* **Termos** → `/termos`
* **Privacidade** → `/privacidade`

# Árvore (área Admin do Projeto)

* **Acesso Admin** (login / conectar carteira) → `/acesso-admin`
* **Dashboard do Projeto** → `/admin`

  * Resumo (score, cofre, próxima votação)
  * Alertas (votação/janela/claims)
* **Onboarding de Projeto** (wizard) → `/admin/onboarding`

  * Passo 1 — Identidade → `/admin/onboarding/identidade`
  * Passo 2 — Token → `/admin/onboarding/token`
  * Passo 3 — Documentos → `/admin/onboarding/documentos`
  * Passo 4 — Revisão & termos → `/admin/onboarding/revisao`
  * Passo 5 — Criação do cofre → `/admin/onboarding/cofre`
* **Depósitos de Garantia** → `/admin/depositos`

  * Histórico com filtros → `/admin/depositos/historico`
* **Votações & Propostas** → `/admin/votacoes`

  * Criar proposta (janela 60d) → `/admin/votacoes/nova`
  * Acompanhamento → `/admin/votacoes/historico`
* **Extensão de Lock (+3 anos)** → `/admin/extensao-lock`
* **Eventos / Logs (leitura/export)** → `/admin/eventos`

> **Observação SEO:** rotas `/admin/*`, `/acesso-admin` e deep-links de ação não devem ser indexadas.

# Slugs & convenções

* Idioma padrão PT. EN/ES com prefixo:

  * `/en/*` (e.g., `/en/how-it-works`, `/en/projects/[slug]`)
  * `/es/*` (e.g., `/es/como-funciona`, `/es/proyectos/[slug]`)
* Slugs de projeto: `kebab-case`, ex.: `projeto-exemplo`, chaveado por `contract` no CMS/chain.
* Slugs de post: data + título opcional, ex.: `2025-08-10-governanca-2025`.

# Breadcrumbs (padrão)

* Home › Projetos › {Projeto}
* Home › Governança › Votações › {Votação}
* Home › Blog › {Post}

# Sitemap XML (modelo)

**Index:** `/sitemap.xml`

```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://example.com/sitemaps/public-pt.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/projects-pt.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/blog-pt.xml</loc></sitemap>

  <sitemap><loc>https://example.com/sitemaps/public-en.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/projects-en.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/blog-en.xml</loc></sitemap>

  <sitemap><loc>https://example.com/sitemaps/public-es.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/projects-es.xml</loc></sitemap>
  <sitemap><loc>https://example.com/sitemaps/blog-es.xml</loc></sitemap>
</sitemapindex>
```

**Público (ex.: `public-pt.xml`)**

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/como-funciona</loc></url>
  <url><loc>https://example.com/score-de-garantia</loc></url>
  <url><loc>https://example.com/projetos</loc></url>
  <url><loc>https://example.com/governanca</loc></url>
  <url><loc>https://example.com/governanca/votacoes</loc></url>
  <url><loc>https://example.com/faq</loc></url>
  <url><loc>https://example.com/blog</loc></url>
  <url><loc>https://example.com/termos</loc></url>
  <url><loc>https://example.com/privacidade</loc></url>
</urlset>
```

**Projetos dinâmicos (ex.: `projects-pt.xml`)**

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Gerado periodicamente a partir da index on-chain/CMS -->
  <url><loc>https://example.com/projetos/projeto-exemplo</loc></url>
  <url><loc>https://example.com/projetos/outro-projeto</loc></url>
</urlset>
```

**Blog dinâmico (ex.: `blog-pt.xml`)**

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/blog/relatorio-governanca-2025</loc></url>
</urlset>
```

# hreflang (por página pública)

Inclua em cada página o bloco hreflang:

```html
<link rel="canonical" href="https://example.com/projetos/projeto-exemplo" />
<link rel="alternate" hreflang="pt-br" href="https://example.com/projetos/projeto-exemplo" />
<link rel="alternate" hreflang="en"    href="https://example.com/en/projects/project-example" />
<link rel="alternate" hreflang="es"    href="https://example.com/es/proyectos/proyecto-ejemplo" />
<link rel="alternate" hreflang="x-default" href="https://example.com/projetos/projeto-exemplo" />
```

# robots.txt (trecho essencial)

```
User-agent: *
Disallow: /admin/
Disallow: /acesso-admin
Disallow: /projetos/*/depositar
Disallow: /projetos/*/votar
Disallow: /projetos/*/claim
Sitemap: https://example.com/sitemap.xml
```

# Navegação (menus)

**Header (público):**
Logo | Projetos | Como Funciona | Score | Governança | Blog | FAQ | (Idioma: PT/EN/ES) | Acesso Admin

**Footer:**
Score de Garantia | Termos | Privacidade | Contato (opcional) | Socials | © SafeGard

---

se quiser, eu também te entrego um **arquivo `sitemap.xml` pronto** e um **CSV dos slugs** (PT/EN/ES) 
---

# EN — Investor-focused Public Copy

## Home

### Hero (A/B/C)

**V1 — Leadership**
**Headline:** The **first decentralized guarantee protocol** for Web3 projects
**Sub:** More **security and transparency** for Lunes-ecosystem investors. Segregated vaults, annual governance, and a public, on-chain **Guarantee Score (0–100)**.
**Primary CTA:** Explore projects • **Secondary:** How it works

**V2 — Investor benefit**
**Headline:** Invest in Web3 with **clear protection layers**
**Sub:** SafeGard standardizes risk: 5-year locked vaults, **predictable claims** on liquidation, and a Score that lets you compare projects objectively.
**CTA:** View high-Score projects

**V3 — Ecosystem vision**
**Headline:** The **on-chain guarantee standard** for the new Web3
**Sub:** An environment where **good projects flourish** and Lunes investors decide with confidence—powered by public rules, high quorums, and verifiable metrics.
**CTA:** Understand the Score

### Why it matters to Lunes investors

**Title:** Investor benefits in the Lunes ecosystem

* **Protection layer:** if a project is liquidated, you **return the project token** and **claim** your share of the vault per the rules.
* **Radical transparency:** **Score 0–100** and vault metrics **on-chain**.
* **Long-term alignment:** **5-year lock** reduces short-term opportunism.
* **Quality gate:** **High quorums** (≥ 75% “Yes”) + **60-day windows** for course-correction.
* **Comparability:** a **single standard** to assess risk across projects.
* **Execution discipline:** annual governance + public event trail.

*Note:* SafeGard doesn’t promise returns. **Vault donations have no redemption.**

### Protocol metrics (proof tone)

TVL • Active projects • Approved last cycle • Open claims today
*Microcopy:* Real-time on-chain; values in Lunes-equivalent.

### Highlights

Open voting • Newly approved • In 60-day window
**Link:** View all projects

### Leadership seal

**Claim:** **First decentralized guarantee protocol for Web3 projects.**
*Microcopy:* SafeGard positioning statement.

### Short disclaimer

On-chain protocol. **Vault donations have no redemption.** For **claims**, you must **return the project token**. Crypto carries **high risk**—you may lose part or all of your value. **Not financial advice.**

---

## How It Works (benefit + proof)

**Title:** On-chain guarantees that align incentives
Each project creates a **segregated vault** with a **5-year lock**. The community (holders) conducts **annual votes** and may approve **corrective proposals** in **60-day windows**. Practically: **more investor safety** and a **clear path for serious teams**.

**Voting rules (as protection)**

* **Elevated approval:** key decisions need **≥ 75% “Yes.”**
* **Annual cycle:** one vote/year with **holder snapshot**.
* **Corrections:** **60-day** window; approvals with **≥ 60% “Yes.”**

**Fees (clarity before action)**

* **Vault deposit:** **100 LUNES + 10 LUSDT** per operation.
* **Vote:** fee shown before confirming.

**Distribution & claims (what investors need)**
If **liquidated**, status switches to **Open Claims**. You **return the project token** to the contract and **claim** your share (LUNES/LUSDT/PSP22) per vault composition and public rules.
**Important:** **vault donations don’t grant redemption.**

**CTA:** See claim examples

---

## Guarantee Score (sell the value)

**Title:** A number that **standardizes risk**
**Text:** The **Score (0–100)** measures vault robustness. **LUNES** underpins up to **95 points**; additional criteria (stability/diversification) add **up to 5**. **Easy to read, hard to game.**

**Investor’s quick read**

* **70–100 (High):** robust vault, consistent governance.
* **40–69 (Moderate):** evolving; monitor closely.
* **0–39 (Low):** young or weak vault.

*Tooltip:* The Score **is not a return promise**—it’s a gauge of **backing + discipline**.

**CTA:** Browse by Score

---

## Projects (Public List)

**Header:** Choose with **data—not hype**
Filter by status, **Score**, vault size, and period. Compare apples to apples.
**Search:** Name or contract…

**Card fields:** Name + badge • **Score** (Low/Moderate/High) • **Status** • **Total backing (Lunes-eq)** • **Next vote** (countdown) • **Donut:** vault composition • **Link:** Details

---

## Project — Detail (Investor-tilted)

**Header:** {Name} ({Symbol}) • Audit/KYC (if any) • Website | Docs | Contract | Socials
**CTAs:** **Deposit Donation** | **Vote Now** (if open) | **Make a Claim** (if available)

**Why this project might interest you**

* **Score {XX}/100:** quick read of vault robustness.
* **Vault with {x%} in LUNES:** Score’s backbone.
* **Annual governance:** past results + public calendar.
* **Event trail:** creation, deposits, windows, extensions, liquidation/claims.

**Score breakdown:** **{Score}/100** — **LUNES {weight}%** | **Others {weight}%**

**Vault & composition:** **Total:** {Lunes-eq} | **LUNES:** {x%} | **LUSDT:** {y%} | **PSP22:** {z%}
**Secondary:** **Deposits history** & reinforcements

**Voting:** If a **holder** (snapshot), vote while **open**. Fee shown before confirming.

**Claim:** 1) **Return token** → 2) **Claim** share (LUNES/LUSDT/PSP22).
*Minimums, residuals, and deadlines may apply.*

**Risks (trust via honesty)**
Volatility • **No redemption on donations** • Claims depend on **status/rules** • Not investment advice

---

## Governance (view)

**Title:** Public rules. Predictable decisions.
Open votes, history, snapshots, and quorums. **Less noise, more process.**
**CTA:** View open votes

---

## FAQ (investor-first adds)

**What are the benefits for Lunes investors?**
Protection via **claims** (if liquidation), **comparability** via **Score**, **on-chain transparency**, and **long-term discipline** (5-year lock + annual governance).

**Why are we different?**
We’re the **first decentralized guarantee protocol for Web3**, with **segregated vaults**, **high quorums**, and a **standardized Score**—all on-chain.

**Does the Score replace my research?**
No. It **structures risk reading**. Use with docs, history, and governance.

---

## Terms & Privacy (safe tone)

On-chain protocol. **Vault donations have no redemption.** Claims require **returning the token** and follow protocol rules. Crypto is **high risk**. No financial, legal, or tax advice. Read full **Terms** and **Privacy Policy**.

---

## Positioning claims (for banners/badges)

* **First decentralized guarantee protocol for Web3.**
* **On-chain guarantee standard for Lunes investors.**
* **Score 0–100 + 5-year locked vault = less noise, more discipline.**

---

# ES — Copy pública con foco en inversor

## Home

### Hero (A/B/C)

**V1 — Liderazgo**
**Headline:** El **primer protocolo descentralizado de garantías** para proyectos Web3
**Sub:** Más **seguridad y transparencia** para inversores del ecosistema Lunes. Cofres segregados, gobernanza anual y **Score de Garantía (0–100)** público y on-chain.
**CTA primario:** Explorar proyectos • **Secundario:** Cómo funciona

**V2 — Beneficio al inversor**
**Headline:** Invierte en Web3 con **capas claras de protección**
**Sub:** SafeGard estandariza el riesgo: cofre bloqueado por 5 años, **claims previsibles** en liquidación y un Score que compara proyectos con objetividad.
**CTA:** Ver proyectos con Score alto

**V3 — Visión de ecosistema**
**Headline:** El **estándar de garantía on-chain** para la nueva Web3
**Sub:** Un entorno donde **buenos proyectos florecen** y los inversores Lunes deciden con confianza—gracias a reglas públicas, quórums altos y métricas verificables.
**CTA:** Entender el Score

### Por qué importa para inversores Lunes

**Título:** Beneficios para quien invierte en el ecosistema Lunes

* **Capa de protección:** si hay liquidación, **devuelves el token del proyecto** y **reclamas** tu parte del cofre según reglas.
* **Transparencia radical:** **Score 0–100** y métricas de cofre **on-chain**.
* **Alineación a largo plazo:** **lock de 5 años** reduce el cortoplacismo.
* **Filtro de calidad:** **quórums altos** (≥ 75% “Sí”) + **ventanas de 60 días** para correcciones.
* **Comparabilidad:** un **estándar único** para evaluar riesgo entre proyectos.
* **Disciplina de ejecución:** gobernanza anual + historial público de eventos.

*Nota:* SafeGard no promete retorno. **Las donaciones al cofre no tienen rescate.**

### Métricas del protocolo (tono de prueba)

TVL • Proyectos activos • Aprobados en el último ciclo • Claims abiertos hoy
*Microcopy:* On-chain en tiempo real; valores en equivalente Lunes.

### Destacados

Votación abierta • Recién aprobados • En ventana de 60 días
**Enlace:** Ver todos los proyectos

### Sello de liderazgo

**Claim:** **Primer protocolo descentralizado de garantías para Web3.**
*Microcopy:* Declaración de posicionamiento de SafeGard.

### Disclaimer corto

Protocolo on-chain. **Las donaciones al cofre no tienen rescate.** Para **claims**, debes **devolver el token del proyecto**. Cripto conlleva **alto riesgo**—puedes perder parte o todo tu valor. **No es asesoramiento financiero.**

---

## Cómo Funciona (beneficio + prueba)

**Título:** Garantías on-chain que alinean incentivos
Cada proyecto crea un **cofre segregado** con **lock de 5 años**. La comunidad (holders) realiza **votaciones anuales** y puede aprobar **propuestas correctivas** en **ventanas de 60 días**. En la práctica: **más seguridad para el inversor** y **camino claro para equipos serios**.

**Reglas de votación (como protección)**

* **Aprobación elevada:** decisiones clave requieren **≥ 75% “Sí.”**
* **Ciclo anual:** una votación/año con **snapshot** de holders.
* **Correcciones:** **ventana de 60 días**; aprobación con **≥ 60% “Sí.”**

**Comisiones (claridad)**

* **Depósito en cofre:** **100 LUNES + 10 LUSDT** por operación.
* **Voto:** comisión mostrada antes de confirmar.

**Distribución & claims (lo esencial para inversores)**
Si hay **liquidación**, el estado pasa a **Claims Abiertos**. **Devuelves el token del proyecto** al contrato y **reclamas** tu parte (LUNES/LUSDT/PSP22) según la composición del cofre y reglas públicas.
**Importante:** **las donaciones al cofre no otorgan rescate.**

**CTA:** Ver ejemplos de claim

---

## Score de Garantía (venta de valor)

**Título:** Un número que **estandariza el riesgo**
**Texto:** El **Score (0–100)** mide la robustez del cofre. **LUNES** sustenta hasta **95 puntos**; criterios adicionales (estabilidad/diversificación) suman **hasta 5**. **Fácil de leer, difícil de manipular.**

**Lectura rápida para inversores**

* **70–100 (Alto):** cofre robusto, gobernanza consistente.
* **40–69 (Moderado):** en evolución; requiere seguimiento.
* **0–39 (Bajo):** proyecto joven o cofre débil.

*Tooltip:* El Score **no promete retorno**—es una medida de **respaldo + disciplina**.

**CTA:** Ver por Score

---

## Proyectos (Lista Pública)

**Encabezado:** Elige con **datos—no con hype**
Filtra por estado, **Score**, tamaño del cofre y período. Compara en igualdad de condiciones.
**Buscar:** Nombre o contrato…

**Tarjeta:** Nombre + sello • **Score** (Bajo/Moderado/Alto) • **Estado** • **Respaldo total (Lunes-eq)** • **Próxima votación** (contador) • **Donut:** composición del cofre • **Enlace:** Detalles

---

## Proyecto — Detalle (enfocado en inversor)

**Header:** {Nombre} ({Símbolo}) • Auditoría/KYC (si aplica) • Sitio | Docs | Contrato | Redes
**CTAs:** **Depositar Donación** | **Votar Ahora** (si abierto) | **Hacer Claim** (si disponible)

**Por qué puede interesarte**

* **Score {XX}/100:** lectura rápida de robustez.
* **Cofre con {x%} en LUNES:** columna vertebral del Score.
* **Gobernanza anual:** resultados y calendario públicos.
* **Historial de eventos:** creación, depósitos, ventanas, extensiones, liquidación/claims.

**Score breakdown:** **{Score}/100** — **LUNES {peso}%** | **Otros {peso}%**

**Cofre & composición:** **Total:** {Lunes-eq} | **LUNES:** {x%} | **LUSDT:** {y%} | **PSP22:** {z%}
**Secundario:** **Historial de depósitos** y refuerzos

**Votación:** Si eres **holder** (snapshot), vota mientras esté **abierta**. Comisión mostrada antes de confirmar.

**Claim:** 1) **Devolver token** → 2) **Reclamar** (LUNES/LUSDT/PSP22).
*Pueden aplicar mínimos, residuos y plazos.*

**Riesgos (confianza por honestidad)**
Volatilidad • **Sin rescate en donaciones** • Claims según **estado/reglas** • No es recomendación de inversión

---

## Gobernanza (vista)

**Título:** Reglas públicas. Decisiones previsibles.
Votaciones abiertas, historial, snapshots y quórums. **Menos ruido, más proceso.**
**CTA:** Ver votaciones abiertas

---

## FAQ (enfoque inversor)

**¿Beneficios para inversores Lunes?**
Protección vía **claims** (si hay liquidación), **comparabilidad** con **Score**, **transparencia on-chain** y **disciplina de largo plazo** (lock 5 años + gobernanza anual).

**¿Por qué somos diferentes?**
Somos el **primer protocolo descentralizado de garantías para Web3**, con **cofres segregados**, **quórums altos** y **Score estandarizado**—todo on-chain.

**¿El Score reemplaza mi análisis?**
No. **Estructura la lectura de riesgo**. Úsalo junto con docs, historial y gobernanza.

---

## Términos & Privacidad (tono seguro)

Protocolo on-chain. **Las donaciones al cofre no tienen rescate.** Los claims requieren **devolver el token** y siguen reglas del protocolo. Cripto = **alto riesgo**. Sin asesoramiento financiero, legal ni fiscal. Lee **Términos** y **Privacidad** completos.

---

## Claims de posicionamiento (banners/sellos)

* **Primer protocolo descentralizado de garantías para Web3.**
* **Estándar de garantía on-chain para inversores Lunes.**
* **Score 0–100 + cofre bloqueado 5 años = menos ruido, más disciplina.**

---

perfeito — vou “puxar o foco” para benefícios do investidor Lunes, liderança (“primeiro do mundo”), transparência e segurança. Abaixo está a **nova versão PT-BR** (mais direta, com promessas claras sem prometer retorno). Mantém sua IA/UX e encaixa nos mesmos lugares do site.

---

# Home (nova copy focada em investidor)

## Hero (3 variações para A/B test)

**V1 — Liderança direta**
**Headline:** O **primeiro protocolo descentralizado de garantias** para projetos Web3
**Sub:** Mais **segurança e transparência** para investidores do ecossistema Lunes. Cofres segregados, governança anual e um **Score de Garantia (0–100)** público e auditável on-chain.
**CTA primário:** Explorar projetos
**CTA secundário:** Como funciona

**V2 — Benefício ao investidor**
**Headline:** Investir em Web3 com **camadas claras de proteção**
**Sub:** SafeGard padroniza o risco: cofre bloqueado por 5 anos, **claims previsíveis** em caso de liquidação e Score de Garantia que compara projetos de forma objetiva.
**CTA:** Ver projetos com Score alto

**V3 — Visão de ecossistema**
**Headline:** O padrão de **garantia on-chain** para a nova Web3
**Sub:** Criamos um ambiente onde **bons projetos florescem** e investidores Lunes decidem com mais confiança — graças a regras públicas, quóruns exigentes e métricas verificáveis.
**CTA:** Entenda o Score

## Bloco “Por que para investidores Lunes”

**Título:** Benefícios para quem investe no ecossistema Lunes

* **Camada de proteção**: se um projeto entra em liquidação, você **devolve o token** e **reivindica** sua parcela do cofre conforme regras.
* **Transparência radical**: **Score 0–100** e métricas de cofre **on-chain** — sem caixas-pretas.
* **Alinhamento de longo prazo**: **lock de 5 anos** minimiza decisões oportunistas.
* **Qualidade na entrada**: **quóruns altos** (≥ 75% “Sim”) e **janelas de 60 dias** para corrigir rota.
* **Comparabilidade**: um **padrão único** para avaliar riscos entre projetos.
* **Disciplina de execução**: governança anual + trilha pública de eventos.

**Nota curta:** SafeGard não promete retorno. **Doações ao cofre não têm resgate.**

## Métricas (tom de prova)

**Título:** Métricas do protocolo (on-chain)
TVL total • Projetos ativos • Aprovados no último ciclo • Claims abertos hoje
*Microcopy:* Valores em Lunes-equivalente, atualizados em tempo real.

## Destaques

**Título:** Em foco agora
Em votação • Recém-aprovados • Em janela de 60 dias
**Link:** Ver todos os projetos

## Selo de liderança

**Chamada curta:** **Primeiro protocolo descentralizado de garantias para projetos Web3.**
*Microcopy:* Declaração de posicionamento do SafeGard.

## Disclaimer curto

SafeGard é on-chain. **Doações ao cofre não têm resgate.** Para **claims**, é necessário **devolver o token do projeto**. Cripto envolve **alto risco** — você pode perder parte ou todo o valor. **Isto não é recomendação financeira.**

---

# Como Funciona (benefício + prova)

## Visão geral

**Título:** Garantia on-chain que organiza incentivos
**Texto:** Cada projeto cria um **cofre segregado** com **lock de 5 anos**. A comunidade (holders) realiza **votações anuais** e pode aprovar **propostas de correção** em **janelas de 60 dias**. O resultado prático: **mais segurança para o investidor** e **um caminho claro para projetos sérios**.

## Regras de votação (como proteção ao investidor)

* **Aprovação elevada:** decisões relevantes pedem **≥ 75% “Sim”**.
* **Ciclo anual:** 1 votação/ano com **snapshot** de holders.
* **Correção de rota:** janelas de **60 dias**; aprovações com **≥ 60% “Sim”**.
  *Tooltip:* “Snapshot” = lista on-chain de endereços com direito a voto naquele ciclo.

## Taxas (clareza antes de agir)

* **Depósito no cofre:** **100 LUNES + 10 LUSDT** por operação.
* **Voto:** taxa exibida antes da confirmação.
* **Observação:** valores podem variar; confira sempre a tela de confirmação.

## Distribuição & Claims (o que o investidor precisa saber)

Se houver **liquidação**, o status muda para **Claims Abertos**. Você **devolve o token do projeto** ao contrato e **reivindica** sua parcela do cofre (**LUNES/LUSDT/PSP22**), conforme a composição e as regras públicas.
**Importante:** **doações ao cofre não têm resgate.**

**CTA:** Ver exemplos práticos de claim

---

# Score de Garantia (venda do valor)

## Introdução

**Título:** Um número que **padroniza o risco**
**Texto:** O **Score (0–100)** mede a robustez do cofre. **LUNES** sustenta até **95 pontos** do Score; critérios adicionais (estabilidade/diversificação) somam **até 5 pontos**. É **simples de ler** e **difícil de manipular**.

## Leitura rápida para investidores

* **70–100 (Alto):** Cofre robusto e governança consistente.
* **40–69 (Moderado):** Em evolução; requer acompanhamento.
* **0–39 (Baixo):** Projeto recente ou com cofre frágil.

**Tooltip:** O Score **não é promessa de retorno** — é uma régua de **lastro + disciplina**.

**CTA:** Ver projetos por Score

---

# Projetos (Lista Pública)

## Cabeçalho

**Título:** Escolha com dados — não com hype
**Sub:** Filtre por status, **Score**, tamanho do cofre e período. Compare projetos com **critérios iguais para todos**.
**Busca:** Buscar por nome ou contrato…

## Card do projeto (com apelo de benefício)

* **Nome + selo (PSP22/NFT)**
* **Score 0–100** (**Baixo / Moderado / Alto**)
* **Status:** Em Lock | Votação aberta | Janela 60 dias | Liquidação | Claims abertos | Encerrado
* **Garantia total:** {Lunes-eq}
* **Próxima votação:** {dd mmm AAAA} (**faltam {X} dias**)
* **Donut:** Composição do cofre
* **Link:** Ver detalhes

**Empty states e UX** (já prontos do seu doc)

---

# Projeto — Detalhe (virado ao investidor)

## Header

{Nome} ({Símbolo}) • Auditoria/KYC (se houver) • Site | Docs | Contrato | Redes
**CTAs:** **Depositar Doação** | **Votar Agora** (se aberto) | **Fazer Claim** (se disponível)

## Bloco “Por que este projeto pode te interessar”

* **Score {XX}/100**: leitura rápida da robustez do cofre.
* **Cofre com {x%} em LUNES:** pilar do Score e da garantia.
* **Governança anual:** resultados anteriores e calendário público.
* **Trilha de eventos:** criação, depósitos, janelas, extensões, liquidação/claims.

## Score Breakdown

**Texto curto:** **{Score}/100** — **LUNES {peso}%** | **Outros {peso}%**
*Tooltip:* LUNES pesa até 95 pontos; demais fatores somam até 5.

## Cofre & Composição

**Resumo:** **Total:** {Lunes-eq} | **LUNES:** {x%} | **LUSDT:** {y%} | **PSP22:** {z%}
**Chamada:** **Histórico de depósitos** e reforços ao cofre.

## Votações (benefício + regra)

Se você é **holder** (snapshot), pode **votar** enquanto a janela estiver **aberta**.
*Taxa exibida antes da confirmação.*

## Claim (clareza do processo)

1. **Devolver token do projeto** ao contrato → 2) **Reivindicar** sua parcela (LUNES/LUSDT/PSP22).
   *Podem existir mínimos, resíduos e prazos — verifique antes de confirmar.*

## Riscos (honestidade que gera confiança)

* Volatilidade de mercado.
* **Doações ao cofre não têm resgate.**
* Claims dependem do **status** e das **regras públicas**.
* Não é recomendação de investimento.

---

# Governança (visualização)

**Título:** Regras públicas. Decisões previsíveis.
**Sub:** Acompanhe votações abertas, histórico, snapshots e quóruns. **Menos ruído, mais processo.**
**CTA:** Ver votações abertas
**Empty:** Nenhuma votação aberta agora — acompanhe o calendário.

---

# FAQ (entradas novas focadas no investidor)

**Quais os benefícios do SafeGard para o investidor Lunes?**
Camada de proteção via **claims** (quando houver liquidação), **comparabilidade** por meio do **Score**, **transparência on-chain** e **disciplina de longo prazo** (lock 5 anos + governança anual).

**Por que somos diferentes?**
Porque o SafeGard é o **primeiro protocolo descentralizado de garantias para projetos Web3**, com **cofres segregados**, **quóruns altos** e **Score padronizado** — tudo on-chain.

**O Score substitui minha análise?**
Não. Ele **organiza a leitura de risco**. Use junto de documentos, histórico e governança.

*(Demais perguntas permanecem; ajustei as ênfases)*

---

# Termos & Privacidade (tom seguro)

**Título:** Termos, privacidade e riscos
SafeGard é on-chain. **Doações ao cofre não têm resgate.** Claims exigem **devolver o token** e seguem as regras do protocolo. Cripto tem **alto risco**. Este site **não** oferece aconselhamento financeiro, jurídico ou fiscal. Leia os **Termos** e a **Política de Privacidade** completos.

---

# Claims de posicionamento (para usar em banners/selos)

* **Primeiro protocolo descentralizado de garantias para projetos Web3.**
* **Garantia on-chain padronizada para investidores Lunes.**
* **Score 0–100 + cofre bloqueado por 5 anos = menos ruído, mais disciplina.**

---

# Observações rápidas (para o time de design/conteúdo)

* Mantenha “**Primeiro do mundo**” como **claim de posicionamento** (não como promessa/garantia).
* Dê destaque visual aos **benefícios do investidor** (ícones + bullets curtos).
* Sempre repetir os **avisos de não-resgate** nas áreas de depósito.
* Em “Projetos”, crie um **filtro rápido “Score 70+”** — atende ao investidor conservador.
* Em “Detalhe”, use um **box “O que observar”** com 3 bullets: Score, % em LUNES, calendário de votação.

---


