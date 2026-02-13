import { Helmet } from 'react-helmet-async';
import { absUrl } from '../../utils/seo';

export default function Privacy() {
  const updated = '2025-08-24';
  return (
    <main className="p-8 max-w-4xl mx-auto prose prose-indigo">
      <Helmet>
        <title>Política de Privacidade — SafeGard</title>
        <meta name="description" content="Política de privacidade do protocolo SafeGard com foco em minimização de dados e transparência." />
        <link rel="canonical" href={absUrl('/privacidade')} />
      </Helmet>

      <h1>Política de Privacidade</h1>
      <p><strong>Última atualização:</strong> {updated}</p>

      <h2>1. Minimização de Dados</h2>
      <p>
        O SafeGard é projetado para operar sem coleta de dados pessoais sensíveis. Interações ocorrem diretamente via
        carteira e contratos inteligentes. Não armazenamos chaves privadas e não temos acesso a fundos dos usuários.
      </p>

      <h2>2. Dados de Telemetria</h2>
      <p>
        Podemos coletar métricas agregadas e anônimas para melhorar a experiência (por exemplo, contagem de visitas, performance).
        Você pode utilizar bloqueadores ou desativar cookies não essenciais.
      </p>

      <h2>3. Cookies</h2>
      <p>
        Utilizamos cookies estritamente necessários para funcionalidades básicas (ex: preferências de idioma). Cookies de
        analytics são opcionais e podem ser recusados.
      </p>

      <h2>4. Terceiros</h2>
      <p>
        Integrações de terceiros (ex: nós RPC, provedores de carteira) possuem suas próprias políticas. Revise-as antes de utilizar.
      </p>

      <h2>5. Seus Direitos</h2>
      <p>
        Você pode solicitar a remoção de dados opcionais fornecidos (se existirem) e ajustar preferências de cookies. Como protocolo
        descentralizado, a maior parte dos dados é on-chain e pública por natureza.
      </p>

      <h2>6. Contato</h2>
      <p>
        Para questões sobre privacidade, utilize os canais públicos do projeto. Não fornecemos suporte individual para recuperação de contas.
      </p>
    </main>
  );
}
