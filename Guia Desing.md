from textwrap import dedent
import json, os, pathlib

tokens = {
  "colors": {
    "neutral": {
      "100":"#F2F2F2","200":"#E6E6E6","300":"#B6B6B6","400":"#6D6D6D","500":"#0D0D0D",
      "600":"#0B0909","700":"#090607","800":"#070405","900":"#060203"
    },
    "primary": {
      "100":"#E5D7FF","200":"#CAAFFF","300":"#AD87FF","400":"#9469FF","500":"#6C38FF",
      "600":"#5228DB","700":"#3C1CB7","800":"#291193","900":"#1B0A7A"
    },
    "success": {
      "100":"#D3FCD7","200":"#A8FAB9","300":"#7AF09E","400":"#57E290","500":"#26D07C",
      "600":"#1BB277","700":"#13956F","800":"#0C7863","900":"#07635B"
    },
    "warning": {
      "100":"#FEEBCB","200":"#FED198","300":"#FEB165","400":"#FE923F","500":"#FE5F00",
      "600":"#DA4400","700":"#B62E00","800":"#931C00","900":"#790F00"
    },
    "critical": {
      "100":"#FFDCD3","200":"#FFB2A9","300":"#FF807E","400":"#FF5D69","500":"#FF284C",
      "600":"#DB1D4E","700":"#B7144E","800":"#930C49","900":"#7A0746"
    }
  },
  "typography": {
    "fonts": {
      "display": "Space Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'",
      "ui": "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'"
    },
    "scale": {
      "lg": {
        "h1": {"size":"48px","weight":700,"lineHeight":"125%","letterSpacing":"0em","font":"display"},
        "h2": {"size":"32px","weight":700,"lineHeight":"150%","letterSpacing":"0em","font":"display"},
        "h3": {"size":"24px","weight":500,"lineHeight":"125%","letterSpacing":"0em","font":"display"},
        "label": {"size":"16px","weight":600,"lineHeight":"150%","letterSpacing":"0em","font":"ui"},
        "paragraph": {"size":"16px","weight":400,"lineHeight":"150%","letterSpacing":"0.05em","font":"ui"}
      },
      "sm": {
        "h1": {"size":"28px","weight":700,"lineHeight":"125%","letterSpacing":"0em","font":"display"},
        "h2": {"size":"22px","weight":700,"lineHeight":"150%","letterSpacing":"0em","font":"display"},
        "h3": {"size":"18px","weight":500,"lineHeight":"125%","letterSpacing":"0em","font":"display"},
        "label": {"size":"14px","weight":600,"lineHeight":"150%","letterSpacing":"0em","font":"ui"},
        "paragraph": {"size":"14px","weight":400,"lineHeight":"150%","letterSpacing":"0.05em","font":"ui"}
      }
    }
  },
  "shadows": {
    "level1": {"x":"0px","y":"4px","blur":"8px","spread":"0px","color":"rgba(0,0,0,0.08)"},
    "level2": {"x":"0px","y":"8px","blur":"24px","spread":"0px","color":"rgba(0,0,0,0.08)"},
    "level3": {"x":"0px","y":"16px","blur":"32px","spread":"0px","color":"rgba(0,0,0,0.08)"},
    "level4": {"x":"0px","y":"16px","blur":"48px","spread":"0px","color":"rgba(0,0,0,0.08)"}
  },
  "grid": {
    "columns": 12,
    "gutter": {"xs":"16px","sm":"20px","md":"24px","lg":"24px","xl":"24px"},
    "container": {
      "xs":"100%","sm":"640px","md":"768px","lg":"1024px","xl":"1280px","2xl":"1440px"
    },
    "spacingScale": {
      "0":"0px","1":"4px","2":"8px","3":"12px","4":"16px","5":"20px","6":"24px","7":"28px","8":"32px",
      "10":"40px","12":"48px","16":"64px","20":"80px","24":"96px","32":"128px"
    },
    "radius": {"sm":"8px","md":"12px","lg":"16px","xl":"20px","2xl":"24px"}
  }
}

# Save tokens.json
tokens_path = "/mnt/data/lunes.design-tokens.json"
with open(tokens_path, "w") as f:
    json.dump(tokens, f, indent=2)

# Tailwind preset snippet with CSS variables
tailwind_snippet = dedent(f"""
/** Tailwind 4.1 preset for Lunes */
export default {
  theme: {{
    extend: {{
      colors: {{
        neutral: {json.dumps(tokens['colors']['neutral'])},
        primary: {json.dumps(tokens['colors']['primary'])},
        success: {json.dumps(tokens['colors']['success'])},
        warning: {json.dumps(tokens['colors']['warning'])},
        critical: {json.dumps(tokens['colors']['critical'])},
      }},
      boxShadow: {{
        'level-1': '0 4px 8px 0 rgba(0,0,0,0.08)',
        'level-2': '0 8px 24px 0 rgba(0,0,0,0.08)',
        'level-3': '0 16px 32px 0 rgba(0,0,0,0.08)',
        'level-4': '0 16px 48px 0 rgba(0,0,0,0.08)',
      }},
      fontFamily: {{
        display: {json.dumps(tokens['typography']['fonts']['display'])},
        ui: {json.dumps(tokens['typography']['fonts']['ui'])}
      }},
      container: {{
        center: true,
        padding: {{
          DEFAULT: '16px',
          sm: '16px',
          md: '20px',
          lg: '24px',
        }},
        screens: {json.dumps(tokens['grid']['container'])}
      }},
      borderRadius: {json.dumps(tokens['grid']['radius'])}
    }}
  }}
}
""").strip()

with open("/mnt/data/tailwind.lunes.preset.js","w") as f:
    f.write(tailwind_snippet)

# Create a Markdown style guide
md = dedent(f"""
# Lunes • Design System — Core Spec v1.0

**Escopo:** Cores, Tipografia, Sombras, Grid e Tokens para front-end (Tailwind 4.1).  
**Fontes:** Materiais fornecidos (Global Colors, Typography, Shadows).

## 1) Paleta de Cores (tokens)

### Neutral
100 {tokens['colors']['neutral']['100']} • 200 {tokens['colors']['neutral']['200']} • 300 {tokens['colors']['neutral']['300']} • 400 {tokens['colors']['neutral']['400']} • 500 {tokens['colors']['neutral']['500']} • 600 {tokens['colors']['neutral']['600']} • 700 {tokens['colors']['neutral']['700']} • 800 {tokens['colors']['neutral']['800']} • 900 {tokens['colors']['neutral']['900']}

### Primary (Lunes Purple)
100 {tokens['colors']['primary']['100']} • 200 {tokens['colors']['primary']['200']} • 300 {tokens['colors']['primary']['300']} • 400 {tokens['colors']['primary']['400']} • 500 {tokens['colors']['primary']['500']} • 600 {tokens['colors']['primary']['600']} • 700 {tokens['colors']['primary']['700']} • 800 {tokens['colors']['primary']['800']} • 900 {tokens['colors']['primary']['900']}

### Success (Green)
100 {tokens['colors']['success']['100']} • 200 {tokens['colors']['success']['200']} • 300 {tokens['colors']['success']['300']} • 400 {tokens['colors']['success']['400']} • 500 {tokens['colors']['success']['500']} • 600 {tokens['colors']['success']['600']} • 700 {tokens['colors']['success']['700']} • 800 {tokens['colors']['success']['800']} • 900 {tokens['colors']['success']['900']}

### Warning (Orange)
100 {tokens['colors']['warning']['100']} • 200 {tokens['colors']['warning']['200']} • 300 {tokens['colors']['warning']['300']} • 400 {tokens['colors']['warning']['400']} • 500 {tokens['colors']['warning']['500']} • 600 {tokens['colors']['warning']['600']} • 700 {tokens['colors']['warning']['700']} • 800 {tokens['colors']['warning']['800']} • 900 {tokens['colors']['warning']['900']}

### Critical (Red)
100 {tokens['colors']['critical']['100']} • 200 {tokens['colors']['critical']['200']} • 300 {tokens['colors']['critical']['300']} • 400 {tokens['colors']['critical']['400']} • 500 {tokens['colors']['critical']['500']} • 600 {tokens['colors']['critical']['600']} • 700 {tokens['colors']['critical']['700']} • 800 {tokens['colors']['critical']['800']} • 900 {tokens['colors']['critical']['900']}

**Uso sugerido**
- Primary 500/600: CTAs, foco e realces (texto inverso em `#FFFFFF` ou `neutral.100` com AA contrast).  
- Success/Warning/Critical: Estados e feedback.  
- Neutral: superfícies, contornos e texto.  

**Contraste:** priorize AA/AAA; ajuste tons (400–700) conforme fundo claro/escuro.

## 2) Tipografia

**Fontes:**  
- *Display:* Space Grotesk  
- *UI/Texto:* Inter

**Escala (telas maiores):**
- H1 — 48px / 700 / 125% / 0em / Space Grotesk  
- H2 — 32px / 700 / 150% / 0em / Space Grotesk  
- H3 — 24px / 500 / 125% / 0em / Space Grotesk  
- Label — 16px / 600 / 150% / 0em / Inter  
- Paragraph — 16px / 400 / 150% / 0.05em / Inter

**Escala (telas pequenas):**
- H1-sm — 28px / 700 / 125% / 0em / Space Grotesk  
- H2-sm — 22px / 700 / 150% / 0em / Space Grotesk  
- H3-sm — 18px / 500 / 125% / 0em / Space Grotesk  
- Label-sm — 14px / 600 / 150% / 0em / Inter  
- Paragraph-sm — 14px / 400 / 150% / 0.05em / Inter

**Boas práticas**
- Evitar mais de 2 famílias; usar pesos especificados para performance.  
- `prefers-reduced-motion`: reduzir animações em headings.  
- Ajustar `letter-spacing` do Paragraph no dark mode, se necessário.

## 3) Grid & Layout

- **Grid:** 12 colunas, gutters responsivos (xs 16px • sm 20px • md+ 24px).  
- **Container (máx):** xs 100% • sm 640 • md 768 • lg 1024 • xl 1280 • 2xl 1440.  
- **Spacing Scale:** 4px base (4/8/12/16/20/24/32/40/48/64/80/96/128).  
- **Radii:** 8 / 12 / 16 / 20 / 24 px (cards/botões com 16–24px).  
- **Breakpoints:** os padrões do Tailwind (sm 640, md 768, lg 1024, xl 1280, 2xl 1536).  
- **Exemplos:** Cards em grid 12 → md: span-6, lg: span-4; gutters via `gap-6`.

## 4) Sombras

- Level 1 — `0 4px 8px rgba(0,0,0,0.08)`  
- Level 2 — `0 8px 24px rgba(0,0,0,0.08)`  
- Level 3 — `0 16px 32px rgba(0,0,0,0.08)`  
- Level 4 — `0 16px 48px rgba(0,0,0,0.08)`  

**Dicas:** usar sombras mais curtas em superfícies pequenas; evitar no dark mode exagero (usar opacidade menor).

## 5) Tailwind 4.1 Preset

Importe `tailwind.lunes.preset.js` e aplique em `tailwind.config.ts`.

```ts
import preset from './tailwind.lunes.preset'

export default { presets: [preset] }
Font faces (CSS)
css
Sempre exibir os detalhes

Copiar
@font-face {{ font-family: 'Space Grotesk'; font-weight: 400 700; font-style: normal; font-display: swap; src: local('Space Grotesk'); }}
@font-face {{ font-family: 'Inter'; font-weight: 400 700; font-style: normal; font-display: swap; src: local('Inter'); }}
6) Acessibilidade & SEO
Contraste mínimo AA (texto 4.5:1; grandes 3:1).

Estados de foco visíveis (focus:ring-primary-400).

Semântica: h1/h2/h3, landmarks header/main/nav/footer.

Metas: Title/Description por página; hreflang PT/EN/ES.

Arquivos
Tokens JSON: lunes.design-tokens.json

Tailwind preset: tailwind.lunes.preset.js
""")

with open("/mnt/data/Lunes-DesignSystem-CoreSpec.md","w") as f:
f.write(md)

tokens_path, "/mnt/data/tailwind.lunes.preset.js", "/mnt/data/Lunes-DesignSystem-CoreSpec.md"

Sempre exibir os detalhes

Copiar
---------------------------------------------------------------------------
NameError                                 Traceback (most recent call last)
Cell In[10], line 78
     72     json.dump(tokens, f, indent=2)
     74 # Tailwind preset snippet with CSS variables
     75 tailwind_snippet = dedent(f"""
     76 /** Tailwind 4.1 preset for Lunes */
     77 export default {
---> 78   theme: {{
     79     extend: {{
     80       colors: {{
     81         neutral: {json.dumps(tokens['colors']['neutral'])},
     82         primary: {json.dumps(tokens['colors']['primary'])},
     83         success: {json.dumps(tokens['colors']['success'])},
     84         warning: {json.dumps(tokens['colors']['warning'])},
     85         critical: {json.dumps(tokens['colors']['critical'])},
     86       }},
     87       boxShadow: {{
     88         'level-1': '0 4px 8px 0 rgba(0,0,0,0.08)',
     89         'level-2': '0 8px 24px 0 rgba(0,0,0,0.08)',
     90         'level-3': '0 16px 32px 0 rgba(0,0,0,0.08)',
     91         'level-4': '0 16px 48px 0 rgba(0,0,0,0.08)',
     92       }},
     93       fontFamily: {{
     94         display: {json.dumps(tokens['typography']['fonts']['display'])},
     95         ui: {json.dumps(tokens['typography']['fonts']['ui'])}
     96       }},
     97       container: {{
     98         center: true,
     99         padding: {{
    100           DEFAULT: '16px',
    101           sm: '16px',
    102           md: '20px',
    103           lg: '24px',
    104         }},
    105         screens: {json.dumps(tokens['grid']['container'])}
    106       }},
    107       borderRadius: {json.dumps(tokens['grid']['radius'])}
    108     }}
    109   }}
    110 }
    111 """).strip()
    113 with open("/mnt/data/tailwind.lunes.preset.js","w") as f:
    114     f.write(tailwind_snippet)

NameError: name 'theme' is not defined

Analisado
python
Sempre exibir os detalhes

Copiar
NEUTRAL = json.dumps(tokens['colors']['neutral'])
PRIMARY = json.dumps(tokens['colors']['primary'])
SUCCESS = json.dumps(tokens['colors']['success'])
WARNING = json.dumps(tokens['colors']['warning'])
CRITICAL = json.dumps(tokens['colors']['critical'])
FONTS_DISPLAY = json.dumps(tokens['typography']['fonts']['display'])
FONTS_UI = json.dumps(tokens['typography']['fonts']['ui'])
CONTAINER = json.dumps(tokens['grid']['container'])
RADII = json.dumps(tokens['grid']['radius'])

tailwind_snippet_tpl = """
/** Tailwind 4.1 preset for Lunes */
export default {{
  theme: {{
    extend: {{
      colors: {{
        neutral: {NEUTRAL},
        primary: {PRIMARY},
        success: {SUCCESS},
        warning: {WARNING},
        critical: {CRITICAL},
      }},
      boxShadow: {{
        'level-1': '0 4px 8px 0 rgba(0,0,0,0.08)',
        'level-2': '0 8px 24px 0 rgba(0,0,0,0.08)',
        'level-3': '0 16px 32px 0 rgba(0,0,0,0.08)',
        'level-4': '0 16px 48px 0 rgba(0,0,0,0.08)',
      }},
      fontFamily: {{
        display: {FONTS_DISPLAY},
        ui: {FONTS_UI}
      }},
      container: {{
        center: true,
        padding: {{
          DEFAULT: '16px',
          sm: '16px',
          md: '20px',
          lg: '24px',
        }},
        screens: {CONTAINER}
      }},
      borderRadius: {RADII}
    }}
  }}
}}
""".format(NEUTRAL=NEUTRAL, PRIMARY=PRIMARY, SUCCESS=SUCCESS, WARNING=WARNING, CRITICAL=CRITICAL,
           FONTS_DISPLAY=FONTS_DISPLAY, FONTS_UI=FONTS_UI, CONTAINER=CONTAINER, RADII=RADII)

with open("/mnt/data/tailwind.lunes.preset.js","w") as f:
    f.write(tailwind_snippet_tpl)

"/mnt/data/tailwind.lunes.preset.js"
Resultado
'/mnt/data/tailwind.lunes.preset.js'

Analisado
python
Sempre exibir os detalhes

Copiar
# Provide a small preview of the generated Tailwind preset content (first 60 lines)
preset_preview = open("/mnt/data/tailwind.lunes.preset.js").read().splitlines()[:60]
"\n".join(preset_preview)
Resultado
'\n/** Tailwind 4.1 preset for Lunes */\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        neutral: {"100": "#F2F2F2", "200": "#E6E6E6", "300": "#B6B6B6", "400": "#6D6D6D", "500": "#0D0D0D", "600": "#0B0909", "700": "#090607", "800": "#070405", "900": "#060203"},\n        primary: {"100": "#E5D7FF", "200": "#CAAFFF", "300": "#AD87FF", "400": "#9469FF", "500": "#6C38FF", "600": "#5228DB", "700": "#3C1CB7", "800": "#291193", "900": "#1B0A7A"},\n        success: {"100": "#D3FCD7", "200": "#A8FAB9", "300": "#7AF09E", "400": "#57E290", "500": "#26D07C", "600": "#1BB277", "700": "#13956F", "800": "#0C7863", "900": "#07635B"},\n        warning: {"100": "#FEEBCB", "200": "#FED198", "300": "#FEB165", "400": "#FE923F", "500": "#FE5F00", "600": "#DA4400", "700": "#B62E00", "800": "#931C00", "900": "#790F00"},\n        critical: {"100": "#FFDCD3", "200": "#FFB2A9", "300": "#FF807E", "400": "#FF5D69", "500": "#FF284C", "600": "#DB1D4E", "700": "#B7144E", "800": "#930C49", "900": "#7A0746"},\n      },\n      boxShadow: {\n        \'level-1\': \'0 4px 8px 0 rgba(0,0,0,0.08)\',\n        \'level-2\': \'0 8px 24px 0 rgba(0,0,0,0.08)\',\n        \'level-3\': \'0 16px 32px 0 rgba(0,0,0,0.08)\',\n        \'level-4\': \'0 16px 48px 0 rgba(0,0,0,0.08)\',\n      },\n      fontFamily: {\n        display: "Space Grotesk, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial, \'Apple Color Emoji\',\'Segoe UI Emoji\'",\n        ui: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \'Apple Color Emoji\',\'Segoe UI Emoji\'"\n      },\n      container: {\n        center: true,\n        padding: {\n          DEFAULT: \'16px\',\n          sm: \'16px\',\n          md: \'20px\',\n          lg: \'24px\',\n        },\n        screens: {"xs": "100%", "sm": "640px", "md": "768px", "lg": "1024px", "xl": "1280px", "2xl": "1440px"}\n      },\n      borderRadius: {"sm": "8px", "md": "12px", "lg": "16px", "xl": "20px", "2xl": "24px"}\n    }\n  }\n}'

Pensou por 25s
perfeito — documentei cores, tipografia, sombras e grid da Lunes com tokens prontos para Tailwind 4.1 e um preset reutilizável. Também gerei arquivos para você baixar e integrar no projeto.

Baixar — Tokens JSON
Baixar — Tailwind preset (JS)
Baixar — Core Spec (Markdown)

Sistema de Cores (extraído do guia que você enviou)
Neutral
100 #F2F2F2

200 #E6E6E6

300 #B6B6B6

400 #6D6D6D

500 #0D0D0D

600 #0B0909

700 #090607

800 #070405

900 #060203

Primary (Lunes Purple)
100 #E5D7FF

200 #CAAFFF

300 #AD87FF

400 #9469FF

500 #6C38FF

600 #5228DB

700 #3C1CB7

800 #291193

900 #1B0A7A

Success (Green)
100 #D3FCD7

200 #A8FAB9

300 #7AF09E

400 #57E290

500 #26D07C

600 #1BB277

700 #13956F

800 #0C7863

900 #07635B

Warning (Orange)
100 #FEEBCB

200 #FED198

300 #FEB165

400 #FE923F

500 #FE5F00

600 #DA4400

700 #B62E00

800 #931C00

900 #790F00

Critical (Red)
100 #FFDCD3

200 #FFB2A9

300 #FF807E

400 #FF5D69

500 #FF284C

600 #DB1D4E

700 #B7144E

800 #930C49

900 #7A0746

Recomendações de uso e A11y
Use Primary 500/600 para CTAs, com texto #FFFFFF ou neutral.100.

Tons 400–700 funcionam melhor para ícones/links em fundo claro; 200–300 para fills suaves.

Garanta contraste AA (4.5:1) para texto normal e AAA quando possível (principalmente em conteúdos regulatórios).

Tipografia (do seu guideline)
Famílias

Display: Space Grotesk

UI/Texto: Inter

Escala — telas grandes
H1 48px · 700 · line-height 125% · letter-spacing 0em · Space Grotesk

H2 32px · 700 · 150% · 0em · Space Grotesk

H3 24px · 500 · 125% · 0em · Space Grotesk

Label 16px · 600 · 150% · 0em · Inter

Paragraph 16px · 400 · 150% · 0.05em · Inter

Escala — telas pequenas
H1-sm 28px · 700 · 125% · 0em · Space Grotesk

H2-sm 22px · 700 · 150% · 0em · Space Grotesk

H3-sm 18px · 500 · 125% · 0em · Space Grotesk

Label-sm 14px · 600 · 150% · 0em · Inter

Paragraph-sm 14px · 400 · 150% · 0.05em · Inter

Boas práticas
Limite a 2 famílias; carregamento com font-display: swap.

Defina hierarquia semântica real (h1,h2,h3) + landmarks (header,main,footer).

Respeite prefers-reduced-motion em títulos animados.

Sombras (Shadows)
Level 1: 0 4px 8px rgba(0,0,0,0.08)

Level 2: 0 8px 24px rgba(0,0,0,0.08)

Level 3: 0 16px 32px rgba(0,0,0,0.08)

Level 4: 0 16px 48px rgba(0,0,0,0.08)
Dica: reduza opacidade no dark mode para evitar “flutuar” demais.

Grid & Layout
Grid base: 12 colunas.

Gutters: xs 16px · sm 20px · md/lg/xl 24px.

Container (máximo): xs 100% · sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440.

Spacing scale: 4px base (4/8/12/16/20/24/32/40/48/64/80/96/128).

Radii: 8 / 12 / 16 / 20 / 24 px (cards e botões preferir 16–24).

Breakpoints (Tailwind): sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536.

Integração rápida (Tailwind 4.1)
Preset
Coloque o arquivo ao lado do tailwind.config e importe:

ts
Copiar
Editar
// tailwind.config.ts
import preset from './tailwind.lunes.preset'
export default { presets: [preset] }
Font faces (exemplo)

css
Copiar
Editar
@font-face { font-family: 'Space Grotesk'; font-weight: 400 700; font-style: normal; font-display: swap; src: local('Space Grotesk'); }
@font-face { font-family: 'Inter';         font-weight: 400 700; font-style: normal; font-display: swap; src: local('Inter'); }
Uso

jsx
Copiar
Editar
<h1 className="text-[48px] leading-[125%] font-bold font-display text-primary-600">
  Primeiro protocolo descentralizado de garantias
</h1>

<button className="px-6 py-3 rounded-2xl bg-primary-600 text-white shadow-level-2 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300">
  Depositar 
</button>
