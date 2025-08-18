# 🔧 Guia do Usuário: Soluções para Problemas de Carteiras Web3

## 🎯 Objetivo

Este guia ajuda usuários finais a resolver problemas comuns com extensões de carteira e conectividade Web3 no Lunes SafeGuard.

## 🚨 Problemas Mais Comuns

### 1. **"Carteira não detectada" ou "Extensão não encontrada"**

#### ✅ **Soluções Passo a Passo:**

**Passo 1: Verificar se a extensão está instalada**
- Abra o Chrome e vá em `Configurações > Extensões` (ou digite `chrome://extensions/`)
- Procure por sua carteira (Polkadot{.js}, Talisman, SubWallet, etc.)
- Se não estiver instalada, instale pela Chrome Web Store

**Passo 2: Ativar a extensão**
- Certifique-se de que o botão está **LIGADO** (azul)
- Clique em "Detalhes" da extensão
- Ative "Permitir no modo anônimo" se necessário

**Passo 3: Atualizar a extensão**
- No topo da página de extensões, clique em "Modo do desenvolvedor"
- Clique em "Atualizar" no canto superior esquerdo
- Ou desinstale e reinstale a extensão

**Passo 4: Recarregar a página**
- Pressione `F5` ou `Ctrl+R` (Windows) / `Cmd+R` (Mac)
- Aguarde alguns segundos para a detecção automática

### 2. **"Falha ao conectar" ou "Timeout de conexão"**

#### ✅ **Soluções:**

**Verificar conexão com internet:**
- Teste outros sites para confirmar conectividade
- Reinicie seu roteador se necessário

**Desativar bloqueadores temporariamente:**
- AdBlock, uBlock Origin, etc. podem bloquear conexões Web3
- Adicione `localhost:5173` e `localhost:3002` às exceções
- Ou desative completamente para testar

**Limpar cache do navegador:**
- Pressione `Ctrl+Shift+Delete` (Windows) / `Cmd+Shift+Delete` (Mac)
- Selecione "Imagens e arquivos em cache"
- Clique em "Limpar dados"

### 3. **"Erro de carregamento de recursos" (chrome-extension://...)**

#### ✅ **Soluções:**

**Atualizar todas as extensões:**
```
1. Vá para chrome://extensions/
2. Ative "Modo do desenvolvedor"
3. Clique em "Atualizar" no topo
4. Reinicie o Chrome
```

**Reinstalar extensão problemática:**
```
1. Anote suas contas/senhas da carteira
2. Remova a extensão
3. Reinstale da Chrome Web Store
4. Restaure suas contas
```

### 4. **"Buffer is not defined" ou erros de módulo**

#### ✅ **Solução:**
- Este é um erro técnico já resolvido pelos desenvolvedores
- Se ainda aparecer, recarregue a página (`F5`)
- Limpe o cache do navegador

## 🔍 Diagnóstico Rápido

### **Teste 1: Verificar extensões no console**
```javascript
// Abra o console (F12) e digite:
console.log('Extensões:', Object.keys(window.injectedWeb3 || {}));
```
**Resultado esperado:** Lista com nomes das carteiras instaladas

### **Teste 2: Verificar Polkadot.js especificamente**
```javascript
// No console:
console.log('Polkadot.js:', !!window.injectedWeb3?.['polkadot-js']);
```
**Resultado esperado:** `true` se instalada corretamente

### **Teste 3: Verificar conectividade WebSocket**
```javascript
// No console:
const ws = new WebSocket('wss://rpc.polkadot.io');
ws.onopen = () => console.log('✅ Conectado');
ws.onerror = (e) => console.log('❌ Erro:', e);
```
**Resultado esperado:** "✅ Conectado" em alguns segundos

## 🛠️ Soluções Avançadas

### **Problema: Extensão instalada mas não funciona**

1. **Verificar permissões:**
   - Clique no ícone da extensão na barra do Chrome
   - Vá em "Gerenciar extensão"
   - Certifique-se de que tem acesso a "todos os sites"

2. **Resetar configurações:**
   - Abra a extensão da carteira
   - Procure por "Configurações" ou "Settings"
   - Faça backup das contas antes de resetar

3. **Testar em modo anônimo:**
   - Abra uma janela anônima (`Ctrl+Shift+N`)
   - Ative a extensão para modo anônimo
   - Teste se funciona sem outras extensões

### **Problema: Conexão lenta ou instável**

1. **Trocar endpoint:**
   - O sistema automaticamente tenta diferentes servidores
   - Aguarde até 30 segundos para reconexão automática

2. **Verificar firewall:**
   - Permita conexões WebSocket na porta 443
   - Adicione exceções para domínios `.polkadot.io`

## 📱 Carteiras Suportadas

| Carteira | Status | Link de Download |
|----------|--------|------------------|
| **Polkadot{.js}** | ✅ Totalmente suportada | [Chrome Store](https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd) |
| **Talisman** | ✅ Totalmente suportada | [Chrome Store](https://chrome.google.com/webstore/detail/talisman-polkadot-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld) |
| **SubWallet** | ✅ Totalmente suportada | [Chrome Store](https://chrome.google.com/webstore/detail/subwallet-polkadot-wallet/onhogfjeacnfoofkfgppdlbmlmnplgbn) |
| **Nova Wallet** | ⚠️ Suporte limitado | [Site Oficial](https://novawallet.io/) |

## 🆘 Quando Nada Funciona

### **Checklist Final:**

- [ ] Chrome atualizado para versão mais recente
- [ ] Extensão da carteira atualizada
- [ ] Cache do navegador limpo
- [ ] Bloqueadores de anúncio desativados
- [ ] Testado em modo anônimo
- [ ] Testado em navegador diferente (Firefox, Edge)
- [ ] Internet funcionando normalmente

### **Informações para Suporte:**

Se o problema persistir, colete estas informações:

```
1. Versão do Chrome: chrome://version/
2. Extensões instaladas: chrome://extensions/
3. Console errors: F12 > Console (screenshot)
4. Sistema operacional e versão
5. Passos exatos que causam o erro
```

## 🔄 Atualizações Automáticas

O sistema Lunes SafeGuard inclui:
- ✅ Reconexão automática em caso de falha
- ✅ Detecção inteligente de carteiras
- ✅ Fallback para diferentes servidores
- ✅ Mensagens de erro claras e acionáveis

## 📞 Contato

Para suporte adicional:
- 📧 Email: suporte@lunes.io
- 💬 Discord: [Lunes Community](https://discord.gg/lunes)
- 📖 Documentação: [docs.lunes.io](https://docs.lunes.io)

---

**Última atualização:** Janeiro 2025  
**Versão do guia:** 1.0.0  
**Compatível com:** Chrome 120+, Firefox 115+, Edge 120+