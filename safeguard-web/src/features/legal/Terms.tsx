import { Helmet } from 'react-helmet-async';
import { absUrl } from '../../utils/seo';

export default function Terms() {
  const updated = '2025-08-24';
  return (
    <main className="p-8 max-w-4xl mx-auto prose prose-indigo">
      <Helmet>
        <title>Termos de Uso — SafeGard</title>
        <meta name="description" content="Termos de uso do protocolo SafeGard, enfatizando descentralização e ausência de custódia de fundos." />
        <link rel="canonical" href={absUrl('/termos')} />
      </Helmet>

      <h1>Termos de Uso</h1>
      <p><strong>Última atualização:</strong> {updated}</p>

      <h2>1. Natureza do Protocolo</h2>
      <p>
        O SafeGard é um <strong>protocolo descentralizado</strong> operando por meio de contratos inteligentes em redes
        blockchain compatíveis. <strong>Não mantemos custódia de fundos</strong>, não possuímos acesso unilateral a chaves
        privadas, e não realizamos intermediação financeira. Todas as interações são executadas por código aberto e auditável.
      </p>

      <h2>2. Elegibilidade e Responsabilidade do Usuário</h2>
      <ul>
        <li>Você é responsável por sua própria carteira e segurança operacional.</li>
        <li>Ao interagir com o protocolo, você compreende os <strong>riscos inerentes</strong> a redes blockchain.</li>
        <li>Transações são <strong>irreversíveis</strong> e taxas de rede podem variar.</li>
      </ul>

      <h2>3. Governança e Votações</h2>
      <p>
        Decisões de liberação de garantias envolvem um <strong>processo de votação comunitária</strong>. Regras, quórum e prazos
        são definidos on-chain pelos contratos e documentação pública. Nenhuma entidade isolada pode forçar resultados.
      </p>

      <h2>4. Ausência de Garantias</h2>
      <p>
        O protocolo é fornecido “no estado em que se encontra”. Não há garantia de disponibilidade, performance ou adequação a um fim específico.
      </p>

      <h2>5. Conformidade e Jurisdição</h2>
      <p>
        Usuários devem cumprir as leis locais aplicáveis. O uso do protocolo pode ser restrito em certas jurisdições.
      </p>

      <h2>6. Atualizações e Forks</h2>
      <p>
        O protocolo pode receber atualizações, melhorias e correções por meio de governança e releases de código. Forks comunitários podem ocorrer.
      </p>

      <h2>7. Limitação de Responsabilidade</h2>
      <p>
        Na máxima extensão permitida por lei, os mantenedores e contribuidores não serão responsáveis por perdas diretas, indiretas ou consequentes resultantes do uso do protocolo.
      </p>

      <h2>8. Contato</h2>
      <p>
        Para dúvidas sobre estes Termos, utilize os canais públicos documentados do projeto. Não oferecemos suporte individual sobre chaves privadas ou carteiras.
      </p>
    </main>
  );
}
