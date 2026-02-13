# Modelo de Score de Garantia para Projetos Web3 na Rede Lunes (0–100)

**Versão:** 1.0
**Data:** 23/08/2025
**Escopo:** Projetos Web3, tokens PSP22 e coleções NFT emitidos **na rede Lunes**.

---

## Resumo

Definimos um **modelo de score de garantia** (0–100) para avaliar projetos Web3/NFT que depositam colateral em **Lunes** (obrigatório) e, opcionalmente, em **LUSDT** e outros **PSP22** whitelisted. O score é
fortemente dominado por Lunes (até **95 pontos**), com
**no máximo 5 pontos** advindos de outros tokens. O modelo considera a **regra oficial de queima de taxas** da Lunes, incorporando um **supply efetivo** conservador e um **uplift temporal** suave que valoriza a garantia em Lunes à medida que a queima progride de forma lenta e previsível.

**Palavras‑chave:** Lunes, PSP22, score de garantia, fee burn, treasury, oráculos, haircuts, TWAP, risk management.

---

## 1. Motivação e requisitos

* **Lunes obrigatório** como colateral base (condição necessária para qualquer score > 0).
* **Lunes dominante**: até **95%** da pontuação vem do colateral em Lunes.
* **Outros tokens** (LUSDT/PSP22 whitelisted) somam **até 5 pontos** e perdem relevância conforme cresce o “tamanho relativo” do projeto.
* **Projetos com supply maior** devem prover **mais Lunes** para obter o mesmo score.
* **Queima lenta**: se a queima de Lunes é gradual, a garantia em Lunes deve
  ser **suavemente valorizada ao longo do tempo** (sem volatilizar o sistema).

---

## 2. Regra oficial de queima de taxas (Fee Burning)

**Divisão das taxas de transação:**

* **75%** da taxa → **produtor do bloco**.
* **25%** restantes seguem a condição:

  * Se o **fornecimento total (circulante) > 50 milhões de Lunes**:

    * **12,5%** (da taxa original) → **Tesouraria**;
    * **12,5%** (da taxa original) → **queima** (permanente).
  * Se o **fornecimento total ≤ 50 milhões de Lunes**:

    * **25%** (da taxa original) → **Tesouraria**;
    * **0%** → **queima** (a queima por taxa cessa).

**Implicações:**

* A **queima por taxa pára** quando o supply total **cai para ≤ 50M**.
* Se houver **programa adicional (fora da taxa)** para queimar até **30M** (piso de governança), ele deve ser tratado explicitamente pela política.

---

## 3. Notação e Entradas

* $S_p$: supply total do **token do projeto** (ou número de NFTs).
* $C_L$: quantidade de **Lunes** em garantia (obrigatório).
* Para cada token adicional $j$ aceito (ex.: **LUSDT**, PSP22 whitelisted):

  * $C_j$: quantidade depositada como colateral.
  * $p_j$: preço do token $j$ (USD ou outra unidade comum).
* $p_L$: preço do **Lunes** na mesma unidade.
* **Preços** devem vir de **oráculos/TWAP** robustos.

---

## 4. Parâmetros de Governança

* $\alpha>0$: escala do **alvo de Lunes** quando $r=1$.
* $\gamma\ge1$: **convexidade** (penalização) para projetos de **supply grande**.
* $\delta\ge1$: sensibilidade com que o tamanho do projeto reduz o peso dos **outros colaterais**.
* $h_j\in(0,1]$: **haircut de risco** aplicado ao token adicional $j$.

  * Ex.: $h_{\text{LUSDT}}=0{,}9$; PSP22 “blue‑chip”: 0,6–0,8; PSP22 genérico: 0,3–0,5.
* $T_{\min}>0$: **alvo mínimo** em Lunes (protege contra projetos micro com targets irrisórios).
* **Piso de supply** $F$:

  * **Fee‑only** (sem plano extra): $F=50\,\text{M}$.
  * **Com plano extra validado** (para 30M): $F=30\,\text{M}$.
  * **Transição**: $F=\kappa\,30\text{M} + (1-\kappa)\,50\text{M}$, $\kappa\in[0,1]$.
* **Uplift temporal** $\theta\in[0,0{,}30]$ (sugestão: 0,20).

---

## 5. Supply efetivo da Lunes (queima‑consciente)

Para comparar “tamanho de projeto” vs. “escassez de Lunes”, usamos um **supply efetivo**:

$$
S_L^{(\text{eff})} \;=\; (1-\beta)\,S_{L,\text{atual}} \;+\; \beta\,F
$$

com $S_{L,\text{inicial}}=200\,\text{M}$ e **piso** $F$ escolhido conforme a política acima. O **progresso da queima** (normalizado) define $\beta$:

$$
\pi \;=\; \operatorname{clamp}\!\Big(\tfrac{S_{L,\text{inicial}}-S_{L,\text{atual}}}{S_{L,\text{inicial}}-F},\,0,\,1\Big),\qquad \beta\equiv\pi.
$$

**Interpretação:** quanto mais perto do piso $F$, mais conservador (maior $\beta$) e menor o $S_L^{(\text{eff})}$.

---

## 6. Penalização por tamanho de projeto e alvo de Lunes

Definimos o **tamanho relativo** do projeto vs. Lunes efetivo e o **alvo de Lunes** necessário para 95 pontos:

$$
 r \;=\; \frac{S_p}{S_L^{(\text{eff})}},\qquad
 T \;=\; \max\!\big(T_{\min},\; \alpha\,r^{\gamma}\big).
$$

* **Quanto maior $r$** (projeto grande/escassez alta), **maior o alvo** $T$.
* $T_{\min}$ evita “fugas” em projetos micro (NFTs etc.).

---

## 7. Componente Lunes (até **95 pontos**) com uplift temporal

Para refletir que a **queima lenta** valoriza Lunes ao longo do tempo, aplicamos um **uplift gradual** ao alvo $T$:

$$
 u(\pi) \;=\; 1 + \theta\,\pi,\qquad \theta\in[0,0{,}30].
$$

$$
 T' \;=\; \frac{T}{u(\pi)} \;=\; \frac{\max(T_{\min},\,\alpha\,r^{\gamma})}{\,1+\theta\,\pi\,}.
$$

Assim, a pontuação do colateral em Lunes é:

$$
 S_{\text{Lunes}} \;=\; \begin{cases}
 95\cdot \min\!\big(1,\; \tfrac{C_L}{T'}\big), & C_L>0,\\[4pt]
 0, & C_L=0\;\text{(Lunes obrigatório).}
 \end{cases}
$$

**Observações:**

* O uplift **não** depende do preço $p_L$; evita prociclicidade de mercado.
* O teto de **95 pontos** mantém a **dominância de Lunes** sem inflacionar scores.

---

## 8. Componente “outros tokens” (até **5 pontos**)

**Conversão para “Lunes‑equivalentes” com haircut:**

$$
 E_{\text{other}} \;=\; \sum_j\; h_j\,\frac{p_j\,C_j}{p_L}.
$$

**Proporção vs. Lunes e freio por tamanho:**

$$
 q \;=\; \frac{E_{\text{other}}}{\max(C_L,\varepsilon)},\qquad
 g(r) \;=\; \frac{1}{1+r^{\delta}}.
$$

**Pontuação dos extras:**

$$
 S_{\text{other}} \;=\; \begin{cases}
 5\cdot \min\!\big(1,\; q\cdot g(r)\big), & C_L>0,\\[4pt]
 0, & C_L=0.
 \end{cases}
$$

**Racional:** extras ajudam **marginalmente** e cada vez menos conforme $r$ cresce.

---

## 9. Score final

$$
 \text{Score} \;=\; \min\!\big(100,\; S_{\text{Lunes}} + S_{\text{other}}\big).
$$

---

## 10. Propriedades do modelo

1. **Dominância de Lunes:** até 95 pontos vêm de Lunes; extras até 5.
2. **Obrigatoriedade:** se $C_L=0$, **Score=0** (extras sozinhos não pontuam).
3. **Escassez → rigor:** queima (menor $S_L^{(\text{eff})}$) eleva $r$ e $T$; o uplift compensa **parcialmente**.
4. **Monotonicidade limitada:** $S_{\text{Lunes}}$ aumenta em $C_L$ até saturar em 95; $S_{\text{other}}$ é limitado por 5.
5. **Robustez a preço:** parte de Lunes independe de $p_L$; extras usam TWAP/haircuts.

---

## 11. Salvaguardas e Anti‑manipulação

* **Oráculos/TWAP** com janelas e limites de variação intradiária.
* **Haircuts** por token conforme liquidez, volatilidade, smart‑contract risk.
* **Whitelist** de PSP22, com limites de exposição por emissor.
* **$T_{\min}$** para evitar “free rides” em NFTs micro.
* **$\varepsilon$** > 0 para evitar divisões por zero.
* **Cooldowns/lock‑ups**: opcional, para reduzir ciclos de entra/saí do colateral.

---

## 12. Calibração (procedimento sugerido)

1. **Defina $F$**: fee‑only (50M) ou plano extra (30M) ou mistura $\kappa$.
2. **Escolha $\alpha$** para que, quando $r=1$, $T$ fique na casa de **milhões** de Lunes.
3. **Ajuste $\gamma$** (1,1–1,4) conforme a dureza desejada para projetos grandes.
4. **Ajuste $\delta$** (1–2) para quão rápido extras perdem valor com $r$.
5. **Fixe $T_{\min}$** (ex.: 50k–200k) segundo o risco/tamanho médio de NFTs.
6. **Defina $\theta$** (0–0,3); comece em 0,2 para uplift moderado.
7. **Haircuts $h_j$** por token (metodologia baseada em liquidez, histórico e auditorias).
8. **Teste de sensibilidade** ($\pm$20% em cada parâmetro) e validação com dados históricos (se houver).

---

## 13. Análise de sensibilidade (intuitiva)

* $\partial S/\partial C_L>0$ antes da saturação: mais Lunes ↑ score.
* $\partial S/\partial r<0$: projetos maiores (ou Lunes mais escasso) exigem mais Lunes.
* $\partial S/\partial \theta>0$: uplift maior facilita levemente atingir 95.
* $\partial S/\partial h_j>0$: haircuts mais brandos aumentam contribuição dos extras (ainda limitada por 5 pontos).

---

## 14. Exemplos numéricos (fictícios)

**Parâmetros:** $\alpha=5{,}0\,\text{M}$, $\gamma=1{,}2$, $\delta=1$, $T_{\min}=100k$, $\theta=0{,}20$.
**Preços:** $$p_L=\$0{,}10$$; LUSDT=\$1 ($h=0{,}9$); PSP22=\$0,50 ($h=0{,}5$).
**Extras:** $E_{\text{other}}=2{,}3\,\text{M}$ Lunes‑eq.

### 14.1 Projeto grande “SambaToken” — fee‑only ($F=50\,\text{M}$), $S_{L,\text{atual}}=150\,\text{M}$

* $\pi=(200-150)/(200-50)=0{,}333$, $u=1{,}0667$; $S_L^{(eff)}\approx116{,}7\,\text{M}$
* $S_p=1{,}000\,\text{M}\Rightarrow r\approx 8{,}57$; $T\approx 65{,}86\,\text{M}$; $T'\approx 61{,}75\,\text{M}$
* Com $C_L=10\,\text{M}$: $S_{\text{Lunes}}\approx 15{,}39$; $g\approx 0{,}1045$; $S_{\text{other}}\approx 0{,}12$
  **Score ≈ 15,51**.

### 14.2 Mesmo projeto quando Lunes ≤ 50M (burn por taxa pára), $S_{L,\text{atual}}=45\,\text{M}$, $F=50\,\text{M}$

* $\pi=1$, $u=1{,}20$; $S_L^{(eff)}=50\,\text{M}$
* $r=20$; $T\approx 182{,}06\,\text{M}$; $T'\approx 151{,}71\,\text{M}$
* $S_{\text{Lunes}}\approx 6{,}27$; $g\approx 0{,}0476$; $S_{\text{other}}\approx 0{,}055$
  **Score ≈ 6,32**.

### 14.3 Projeto micro “Capivara NFT” — fee‑only, $S_{L,\text{atual}}=150\,\text{M}$

* $S_p=10{,}000$; $T$ sem piso ficaria $~65$ Lunes → **aplica‑se** $T_{\min}=100k$
* Com $C_L=10k$ Lunes: $S_{\text{Lunes}}=95\cdot 0{,}10=9{,}5$; extras saturam em 5
  **Score ≈ 14,5** (mostra a função de $T_{\min}$).

---

## 15. Pseudocódigo (implementação de referência)

```
inputs:
  S_p
  C_L
  prices: p_L, {p_j}
  amounts: {C_j}
  haircuts: {h_j}
  S_L_atual
  flags: has_extra_burn_schedule (bool), kappa in [0,1]

constants/policy:
  S_L_inicial = 200_000_000
  F_fee = 50_000_000
  F_gov = 30_000_000
  if has_extra_burn_schedule:
      F = kappa * F_gov + (1 - kappa) * F_fee
  else:
      F = F_fee

params:
  alpha, gamma, delta
  T_min
  theta  # uplift (0..0.3)

# progresso de queima (beta)
pi = clamp((S_L_inicial - S_L_atual) / (S_L_inicial - F), 0, 1)
S_L_eff = (1 - pi) * S_L_atual + pi * F

# tamanho relativo e alvo
r = S_p / max(S_L_eff, 1e-9)
T = max(T_min, alpha * (r ** gamma))
T_prime = T / (1 + theta * pi)

if C_L <= 0:
    S_lunes = 0
    S_other = 0
else:
    S_lunes = 95 * min(1, C_L / T_prime)

    # extras
    E_other = 0
    for each token j:
        E_other += h_j * (p_j * C_j) / max(p_L, 1e-9)

    q = E_other / max(C_L, 1e-9)
    g = 1 / (1 + (r ** delta))
    S_other = 5 * min(1, q * g)

Score = min(100, S_lunes + S_other)
```

---

## 16. Integração on‑chain / off‑chain

* **Validações on‑chain**: endereço do contrato do projeto na rede Lunes, leitura de $S_p$ (ou supply declarado e comprovável), verificação de depósito de $C_L$ e $C_j$.
* **Oráculos/TWAP**: integração a feeds de preço; fallback e timeouts.
* **Whitelists**: lista on‑chain (ou controlada por governança) de PSP22 aceitos e seus haircuts.
* **Publicação do score**: evento on‑chain ou repositório off‑chain assinado (com hash).

---

## 17. Governança e compliance

* **Transparência**: publicar parâmetros vigentes ($\alpha,\gamma,\delta, T_{\min}, \theta, h_j$, $F$, $\kappa$).
* **Calendário de revisão**: reavaliar haircuts e $\theta$/$T_{\min}$ periodicamente.
* **Gestão de risco**: limites de exposição por emissor/token; alarmes para anomalias de oráculo/liquidez.

---

## 18. Limitações e extensões

* **Preço de Lunes**: o modelo principal não usa $p_L$ no componente de Lunes (evita prociclicidade). Extensão possível: aliviar $T$ com $p_L$ via expoente pequeno.
* **Lock‑up bonus**: multiplicar $C_L$ por fator crescente com prazo de bloqueio.
* **Liquidez/volatilidade**: ajustar haircuts dinamicamente por métricas objetivas (AMM/DEX/CEX).
* **Stress tests**: cenários adversos (queda de oráculo, liquidez seca, picos de volatilidade) para calibrar $T_{\min}$, $\delta$ e haircuts.

---

## 19. Conclusão

O modelo apresentado equilibra **segurança**, **simplicidade operacional** e **alinhamento econômico** com a realidade da Lunes:

* exige Lunes como **colateral central** (95 pts),
* limita **outros tokens** a papel **marginal** (5 pts),
* reconhece a **queima lenta** com um **uplift temporal suave**,
* e incorpora a **regra oficial de fee burn** por meio de um **supply efetivo** conservador.

Esse framework é **auditável**, **ajustável por governança** e pronto para implementação on‑chain/off‑chain.

---

## 20. Ajuste v1.1 — Uplift por Queima Lenta (sem oráculos) + Exemplo prático

**Objetivo do ajuste:** manter as regras originais (Lunes obrigatório e dominante; extras até 5 pts; penalização por tamanho do projeto), mas fazer com que o mesmo depósito em Lunes ganhe um leve aumento de score ao longo do tempo à medida que o supply da Lunes diminui de 200M até 50M (fee burn). Sem usar preços/oráculos.

### 20.1 Alterações mínimas na fórmula

1. Penalização por tamanho do projeto (alvo base) passa a depender só do supply do projeto vs. um referencial fixo S\_ref, e não mais do supply da Lunes:

* r\_proj = S\_p / S\_ref
* T\_base = max(T\_min, alpha \* r\_proj^gamma)

Sugerimos S\_ref = 1 bilhão (ajustável por governança). Isso mantém a regra “quanto maior o supply do projeto, mais Lunes são exigidos”.

2. Uplift temporal pela queima lenta: definimos o progresso normalizado de queima (entre 200M e 50M) e aplicamos um alívio suave no alvo:

* pi = clamp( (200M - S\_L\_atual) / (200M - 50M), 0, 1 )
* u(pi) = 1 + theta \* pi, com theta em \[0, 0.30]
* T' = T\_base / u(pi)

(theta controla o quão devagar o score sobe com a queima; sugerimos theta = 0.20, ou seja, \~+20% no limite quando S\_L vai de 200M para 50M.)

3. Componente Lunes (até 95 pts) permanece:

* S\_Lunes = 95 \* min(1, C\_L / T')  (se C\_L > 0; caso contrário, S\_Lunes = 0)

4. Outros tokens (até 5 pts) continuam limitados e penalizados pelo “tamanho relativo” do projeto em relação à Lunes efetiva (queima‑consciente) apenas para fins de reduzir seu peso:

* S\_L\_eff = (1 - pi) \* S\_L\_atual + pi \* 50M
* r\_extra = S\_p / S\_L\_eff
* g(r\_extra) = 1 / (1 + r\_extra^delta)

Isto preserva a regra “extras valem cada vez menos quando o projeto é grande ou a Lunes fica escassa”. A conversão em Lunes‑equivalentes e o teto de 5 pts seguem idênticos (Seção 8).

**Resumo das mudanças:** só desacoplamos o cálculo do alvo T do supply da Lunes e adicionamos um uplift temporal suave com a queima (200M→50M). Todo o resto do modelo permanece igual.

---

### 20.2 Exemplo prático (lúdico)

Parâmetros (apenas para ilustrar; governança ajusta):

* alpha = 500.000; gamma = 1,2; delta = 1; T\_min = 100.000; theta = 0,20; S\_ref = 1 bilhão.
* Projeto: S\_p = 300M (300 milhões).
* Colateral: C\_L = 10.000 Lunes; sem extras.

| Supply Lunes atual (M) |   pi  | S\_L\_eff (M) | r\_extra | T\_base | u(pi) |      T' | S\_Lunes | Score |
| ---------------------: | :---: | ------------: | -------: | ------: | ----: | ------: | -------: | ----: |
|                    200 | 0,000 |       200,000 |    1,500 | 117.900 | 1,000 | 117.900 |    8,058 | 8,058 |
|                    150 | 0,333 |       116,667 |    2,571 | 117.900 | 1,067 | 110.532 |    8,595 | 8,595 |
|                    120 | 0,533 |        82,667 |    3,629 | 117.900 | 1,107 | 106.537 |    8,917 | 8,917 |
|                    100 | 0,667 |        66,667 |    4,500 | 117.900 | 1,133 | 104.030 |    9,132 | 9,132 |
|                     80 | 0,800 |        56,000 |    5,357 | 117.900 | 1,160 | 101.638 |    9,347 | 9,347 |
|                     60 | 0,933 |        50,667 |    5,921 | 117.900 | 1,187 |  99.354 |    9,562 | 9,562 |
|                     50 | 1,000 |        50,000 |    6,000 | 117.900 | 1,200 |  98.250 |    9,669 | 9,669 |

Leitura: com S\_p = 300M e o mesmo depósito de 10k Lunes, o score sobe devagar (≈ +20% no limite) à medida que o supply da Lunes cai de 200M → 50M. Nada de preço/oráculo; é puramente por progresso de queima. A penalização dos extras segue ficando mais dura conforme a escassez aumenta (via r\_extra).

Se quiser um aumento ainda mais lento, use theta = 0,10 (≈ +10% no limite). Se quiser algo um pouco mais perceptível sem ser “absurdo”, theta = 0,25 (≈ +25%).

perfeito — entendi o que você quer e apliquei um ajuste **simples e sem oráculo** que faz o score em Lunes subir **lentamente** conforme o supply da Lunes diminui de **200M → 50M** (seguindo só a regra de fee burn). Mantive todas as outras regras.

Atualizei o paper na lateral com a seção **“20. Ajuste v1.1 — Uplift por Queima Lenta (sem oráculos) + Exemplo prático”**. Nele:

* O alvo de Lunes para 95 pts agora depende **apenas** do tamanho do projeto vs. um **S\_ref** fixo (ex.: 1 bilhão), e não mais do supply da Lunes.
* Adicionei um **uplift temporal**: `T' = T_base / (1 + θ·π)`, onde `π` é o progresso da queima de 200M até 50M e `θ` é pequeno (ex.: 0,20 → no máximo \~+20% de “ajuda” até 50M).
* Os **extras** continuam limitados a 5 pts e penalizados por `r_extra = S_p / S_L_eff` (que fica maior quando a Lunes fica mais escassa), mantendo Lunes >95%.

### Mini-exemplo que você pediu (resumo)

Com **S\_p = 300M**, **C\_L = 10.000 Lunes**, **sem extras** e `θ = 0,20`, o score sobe devagar apenas pela queima:

* **200M → 50M**: o score vai de **8,06** para **9,67** (≈ +20% no limite).

