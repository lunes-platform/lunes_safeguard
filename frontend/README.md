# Lunes SafeGuard - Frontend Platform

> Plataforma transparente de garantias para projetos blockchain na rede Lunes

## 🚀 Visão Geral

O Lunes SafeGuard é uma plataforma inovadora que permite aos projetos blockchain oferecerem garantias em tokens para a comunidade, enquanto a comunidade detém o poder de validar a qualidade e continuidade desses projetos através de votações anuais.

### Principais Funcionalidades

- **Painel Administrativo**: Interface completa para donos de projetos gerenciarem garantias e acompanharem votações
- **Plataforma Comunitária**: Interface pública para visualização de projetos e participação em votações
- **Sistema de Scoring**: Algoritmo inteligente de pontuação baseado em valor, diversidade de ativos e tempo de vesting
- **Votação Descentralizada**: Sistema de governança comunitária com votações anuais
- **Multi-Asset Support**: Suporte para tokens PSP22 e NFTs PSP34 como garantias

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura **monorepo** com as seguintes tecnologias:

### Stack Principal
- **React 19.1.0** - Framework de interface
- **Vite 6.x** - Build tool e dev server
- **TypeScript 5.7+** - Tipagem estática
- **Tailwind CSS 4.0** - Framework de estilos
- **Turbo** - Gerenciamento de monorepo

### Ferramentas de Desenvolvimento
- **Vitest** - Framework de testes unitários
- **Playwright** - Testes end-to-end
- **React Testing Library** - Testes de componentes
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Husky** - Git hooks

### Gerenciamento de Estado
- **React 19 Actions** - Estado local e formulários
- **Zustand** - Estado global da aplicação
- **TanStack Query** - Estado do servidor e cache

## 📁 Estrutura do Projeto

```
frontend/
├── apps/
│   ├── admin-dashboard/     # Painel administrativo
│   └── community-platform/  # Interface pública
├── packages/
│   ├── shared-ui/          # Componentes compartilhados
│   ├── utils/              # Utilitários e helpers
│   ├── web3/               # Integração blockchain
│   └── types/              # Definições TypeScript
├── docs/                   # Documentação do projeto
└── config files...
```

## 🚦 Começando

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd lunes_safeguard/frontend

# Instale as dependências
npm install

# Configure os hooks do Git
npm run prepare
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm run dev

# Execute os testes
npm run test

# Execute os testes em modo watch
npm run test:watch

# Execute o linting
npm run lint

# Formate o código
npm run format
```

### Build

```bash
# Build de produção
npm run build

# Verificação de tipos
npm run type-check
```

## 🧪 Testes

O projeto segue a metodologia **TDD (Test-Driven Development)** com cobertura abrangente:

- **Testes Unitários**: Vitest + React Testing Library
- **Testes de Integração**: Componentes e hooks
- **Testes E2E**: Playwright para fluxos completos

```bash
# Executar todos os testes
npm run test

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test -- --coverage
```

## 🔒 Segurança

O projeto implementa as melhores práticas de segurança:

- **Validação de Entrada**: Sanitização de todos os inputs
- **CSP (Content Security Policy)**: Proteção contra XSS
- **Segurança de Carteira**: Integração segura com carteiras Web3
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Auditoria de Dependências**: Verificação regular com `npm audit`

## 📊 Performance

Otimizações implementadas:

- **Code Splitting**: Carregamento sob demanda
- **Memoização**: React.memo e useMemo estratégicos
- **Virtualização**: Para listas grandes
- **Otimização de Imagens**: Lazy loading e formatos modernos
- **Bundle Analysis**: Monitoramento do tamanho dos bundles

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Siga as configurações do ESLint e Prettier
- Escreva testes para novas funcionalidades
- Mantenha a cobertura de testes acima de 80%
- Use commits semânticos

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

- [Documentação da Rede Lunes](https://lunes.io)
- [Contratos Inteligentes](../contracts/)
- [Guia do Desenvolvedor](../DEVELOPER_GUIDE.md)

---

**Desenvolvido com ❤️ pela equipe Lunes**