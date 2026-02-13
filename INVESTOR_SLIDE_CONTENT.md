# Lunes SafeGard - Material para Investidores

Este documento consolida as informações estratégicas, técnicas e financeiras do projeto **Lunes SafeGard** para composição de material de apresentação a investidores.

---

## 1. Resumo do Produto (One-Pager)

| Tópico | Detalhe |
| :--- | :--- |
| **Produto** | **Lunes SafeGard** |
| **O que é** | Protocolo de "Guaranty-as-a-Service" on-chain. Permite que projetos travem liquidez (Tokens/NFTs) em cofres segregados para gerar um *Score de Confiança* auditável, protegendo investidores contra "rug-pulls" e insolvência. |
| **Nível de Amadurecimento** | **MVP Completo (Técnico) / Pronto para Auditoria Final**. <br>*(Código em `ink! 5.1.1` finalizado, 100% cobertura de testes, recursos de segurança como Timelock e Pausability implementados. Frontend em fase de fundação).* |
| **Market-Fit** | Resolve a crise de confiança no mercado Web3/DeFi. Oferece aos projetos sérios uma forma de provar solvência (Proof-of-Reserves) e aos investidores uma métrica clara de risco (Score 0-100). |
| **Estratégia de Crescimento** | **B2B2C**: Integração com Launchpads da rede Lunes (exigir SafeGard para listagem) + Incentivos de Score (Score v1.1 bonifica lockups longos de 5 anos e diversificação de ativos). |
| **Mitigação de Risco** | • **Técnico:** Auditoria de segurança, proteção contra reentrância, Timelock de 48h para operações administrativas críticas.<br>• **Financeiro:** Cofres segregados (falha em um projeto não contamina o protocolo).<br>• **Governança:** Circuit Breaker (Pausability) para congelamento em emergências. |

---

## 2. Modelo de Receita (Unit Economics)

O protocolo monetiza através de taxas de serviço cobradas diretamente no smart contract (`deposit_guarantee_with_fees`). O modelo é não-custodial em relação ao lucro (taxas vão para a Treasury, garantias ficam no Vault).

*   **Taxa de Depósito (Fixa):** `10 LUSDT` + `100 LUNES` por transação.
    *   *Nota: O código prevê arquitetura para taxas de votação futura, mas esta simulação considera apenas a receita confirmada de depósitos (Hard Revenue).*

---

## 3. Simulação de Receita - 3 Anos

**Premissas da Simulação:**
1.  **Valor do LUNES:** Estável em **$0.10** (utilizado apenas para estimativa de total em USD).
2.  **Receita por Transação (Tx):** $10 (LUSDT) + $10 (100 LUNES * $0.10) = **$20,00 USD**.
3.  **Drivers de Receita:**
    *   *Novos Projetos:* Projetos que abrem cofres na plataforma.
    *   *Tx/Projeto:* Média de depósitos por ano (inclui aportes iniciais do time, reforços de garantia e doações da comunidade para aumentar o Score).

### Cenário A: Conservador
*Crescimento orgânico, foco em projetos maiores com menor frequência de aportes.*

| Ano | Projetos Ativos | Tx/Projeto (Média) | Total Transações | Receita Bruta (LUNES) | Receita Bruta (LUSDT) | **Total Estimado (USD)** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Ano 1** | 15 | 6 | 90 | 9.000 | 900 | **$ 1.800** |
| **Ano 2** | 50 | 6 | 300 | 30.000 | 3.000 | **$ 6.000** |
| **Ano 3** | 120 | 6 | 720 | 72.000 | 7.200 | **$ 14.400** |

### Cenário B: Agressivo (Tração de Ecossistema)
*Adoção como padrão de segurança na rede Lunes, integração obrigatória em Launchpads parceiros e comunidade ativa fazendo micro-aportes para "gamificar" o Score dos projetos.*

| Ano | Projetos Ativos | Tx/Projeto (Média) | Total Transações | Receita Bruta (LUNES) | Receita Bruta (LUSDT) | **Total Estimado (USD)** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Ano 1** | 40 | 20 | 800 | 80.000 | 8.000 | **$ 16.000** |
| **Ano 2** | 150 | 25 | 3.750 | 375.000 | 37.500 | **$ 75.000** |
| **Ano 3** | 400 | 30 | 12.000 | 1.200.000 | 120.000 | **$ 240.000** |

> **Nota Importante:** A receita apresentada refere-se estritamente às **taxas de protocolo**. O *TVL* (Total Value Locked) custodiado nos cofres — que garante a solvência dos projetos — estaria na casa dos milhões de dólares (ex: 400 projetos x $50k média = $20MM TVL), mas não constitui receita operacional da empresa.
