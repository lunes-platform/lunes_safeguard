import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Search, HelpCircle, Shield, Coins, Vote, Lock, TrendingUp, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'

interface FAQItem { id: string; question: string; answer: string; category: string }

const faqData: FAQItem[] = [
  { id: 'what-is', category: 'geral', question: 'O que e o SafeGard?', answer: 'SafeGard e um protocolo descentralizado de garantias para projetos Web3 na rede Lunes. Ele permite que projetos depositem colateral (principalmente LUNES) em cofres segregados, recebendo um Score de Garantia publico que demonstra sua confiabilidade para a comunidade.' },
  { id: 'why-use', category: 'geral', question: 'Por que usar o SafeGard?', answer: 'O SafeGard oferece transparencia e seguranca para investidores e usuarios de projetos Web3. Com garantias bloqueadas on-chain e um sistema de score publico, e possivel avaliar a seriedade e compromisso de cada projeto antes de interagir com ele.' },
  { id: 'who-can', category: 'geral', question: 'Quem pode cadastrar um projeto?', answer: 'Qualquer pessoa pode cadastrar um projeto no SafeGard. Basta conectar sua carteira, preencher as informacoes do projeto e depositar a garantia inicial em LUNES. O processo e totalmente descentralizado e permissionless.' },
  { id: 'lunes-network', category: 'geral', question: 'O SafeGard funciona apenas na rede Lunes?', answer: 'Sim, atualmente o SafeGard opera exclusivamente na rede Lunes, utilizando tokens PSP22 (equivalente ao ERC-20) e NFTs PSP34 como colateral. Isso garante taxas baixas e transacoes rapidas.' },
  { id: 'how-score', category: 'score', question: 'Como e calculado o Score de Garantia?', answer: 'O Score (0-100) e calculado com base em: 1) Garantia em LUNES (ate 95 pontos) - quanto mais LUNES depositado, maior o score; 2) Outros ativos como LUSDT e NFTs (ate 5 pontos com haircuts aplicados); 3) Formula considera o tamanho do projeto e o progresso da queima de LUNES.' },
  { id: 'lunes-mandatory', category: 'score', question: 'Por que LUNES e obrigatorio?', answer: 'LUNES e o token nativo da rede e serve como base de confianca do ecossistema. Sem LUNES depositado, o Score sera zero. Isso garante que todos os projetos tenham compromisso real com a rede Lunes.' },
  { id: 'score-ranges', category: 'score', question: 'O que significam as faixas de score?', answer: '90-100: Excelente - garantias robustas e projeto muito confiavel. 80-89: Muito Bom - garantias acima da media. 70-79: Bom - garantias adequadas para operacao. 0-69: Baixo - projeto precisa aumentar garantias para maior credibilidade.' },
  { id: 'haircuts', category: 'score', question: 'O que sao haircuts nos ativos?', answer: 'Haircuts sao descontos aplicados ao valor de ativos que nao sao LUNES. Por exemplo: LUSDT tem 90% de haircut (conta apenas 10% do valor), NFTs tem 50% de haircut. Isso incentiva o uso de LUNES como garantia principal.' },
  { id: 'vault-segregated', category: 'cofres', question: 'O que sao cofres segregados?', answer: 'Cada projeto tem seu proprio cofre isolado no smart contract. Isso significa que as garantias de um projeto nunca se misturam com as de outro, garantindo seguranca e transparencia total.' },
  { id: 'deposit-types', category: 'cofres', question: 'Quais ativos posso depositar?', answer: 'Voce pode depositar: LUNES (obrigatorio e mais valorizado), LUSDT e outros tokens PSP22 aprovados pela governanca, e NFTs de colecoes aceitas. Cada tipo tem diferentes pesos no calculo do score.' },
  { id: 'withdraw', category: 'cofres', question: 'Posso retirar minhas garantias?', answer: 'Sim, mas existe um periodo de vesting de 5 anos. Apos este periodo, voce pode solicitar a liberacao das garantias, que passara por uma votacao da comunidade. Isso protege os usuarios do projeto.' },
  { id: 'vesting-period', category: 'governanca', question: 'O que e o periodo de vesting?', answer: 'O vesting e um periodo de 5 anos durante o qual as garantias ficam bloqueadas. Isso demonstra o compromisso de longo prazo do projeto. Apos o vesting, e possivel solicitar liberacao via votacao.' },
  { id: 'voting-process', category: 'governanca', question: 'Como funciona a votacao?', answer: 'Quando um projeto solicita liberacao de garantias apos o vesting, inicia-se uma votacao de 7 dias. Detentores de LUNES podem votar a favor ou contra. E necessario atingir um quorum de 75% para aprovacao.' },
  { id: 'voting-power', category: 'governanca', question: 'Quem pode votar?', answer: 'Qualquer detentor de LUNES pode participar das votacoes. O peso do voto e proporcional a quantidade de LUNES que voce possui. Votos sao registrados on-chain e sao imutaveis.' },
  { id: 'fees', category: 'taxas', question: 'Existem taxas para usar o SafeGard?', answer: 'Sim, existem pequenas taxas de rede (gas) para transacoes como depositos, saques e votacoes. Nao ha taxas de plataforma - o SafeGard e um protocolo publico e descentralizado.' },
  { id: 'fee-burn', category: 'taxas', question: 'Como funciona a queima de LUNES?', answer: 'A rede Lunes possui um mecanismo de queima: 12,5% das taxas de transacao sao queimadas quando o supply esta acima de 50M. Isso cria escassez gradual e beneficia projetos com garantias em LUNES.' },
  { id: 'security', category: 'seguranca', question: 'Como o SafeGard garante seguranca?', answer: 'O SafeGard utiliza: smart contracts auditados, cofres segregados por projeto, CSP e headers de seguranca, sanitizacao de entradas, e sistema de governanca descentralizado para decisoes criticas.' },
  { id: 'rug-protection', category: 'seguranca', question: 'Como o SafeGard protege contra rug pulls?', answer: 'O periodo de vesting de 5 anos e a necessidade de votacao comunitaria para liberacao de garantias dificultam significativamente rug pulls. Projetos com garantias bloqueadas demonstram compromisso real.' },
]

const categories = [
  { id: 'geral', label: 'Sobre o SafeGard', icon: HelpCircle, color: 'bg-lunes-purple text-white shadow-lg shadow-purple-900/50' },
  { id: 'score', label: 'Score de Garantia', icon: TrendingUp, color: 'bg-green-500 text-white shadow-lg shadow-green-900/50' },
  { id: 'cofres', label: 'Garantias e Cofres', icon: Shield, color: 'bg-blue-500 text-white shadow-lg shadow-blue-900/50' },
  { id: 'governanca', label: 'Governança', icon: Vote, color: 'bg-orange-500 text-white shadow-lg shadow-orange-900/50' },
  { id: 'taxas', label: 'Taxas', icon: Coins, color: 'bg-yellow-500 text-white shadow-lg shadow-yellow-900/50' },
  { id: 'seguranca', label: 'Segurança', icon: Lock, color: 'bg-red-500 text-white shadow-lg shadow-red-900/50' },
]

export default function FAQ() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    let items = faqData
    if (activeCategory) items = items.filter(i => i.category === activeCategory)
    if (query.trim()) {
      const q = query.toLowerCase()
      items = items.filter(i => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q))
    }
    return items
  }, [query, activeCategory])

  return (
    <>
      <Helmet><title>FAQ - Perguntas Frequentes | SafeGard</title></Helmet>
      <div className="min-h-screen bg-lunes-dark">
        <section className="bg-gradient-to-br from-lunes-purple-dark/20 to-lunes-dark border-b border-white/5 text-white py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lunes-purple/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-lunes-purple-dark/10 rounded-full blur-3xl -z-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col items-center justify-center gap-6 mb-8">
                <div className="w-20 h-20 bg-lunes-purple/20 rounded-3xl flex items-center justify-center border border-lunes-purple/30 backdrop-blur-xl shadow-[0_0_30px_rgba(109,40,217,0.2)]">
                  <MessageCircle className="w-10 h-10 text-lunes-purple" />
                </div>
                <h1 className="text-4xl lg:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 tracking-tighter">
                  Central de Ajuda
                </h1>
              </div>
              <p className="text-xl text-neutral-300 max-w-2xl mx-auto">Encontre respostas para as perguntas mais frequentes sobre o protocolo SafeGard</p>
            </motion.div>
          </div>
        </section>
        <section className="py-8 -mt-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-2 flex items-center gap-3">
                <Search className="w-6 h-6 text-neutral-400 ml-4" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar perguntas..." className="flex-1 py-4 px-2 text-lg outline-none bg-transparent text-white placeholder-neutral-500" />
              </div>
            </div>
          </div>
        </section>
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              <button onClick={() => setActiveCategory(null)} className={'px-4 py-2 rounded-full font-medium transition-all ' + (!activeCategory ? 'bg-lunes-purple text-white shadow-lg shadow-purple-900/50' : 'bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white')}>Todas</button>
              {categories.map(cat => {
                const Icon = cat.icon
                return <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={'px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ' + (activeCategory === cat.id ? 'bg-lunes-purple text-white shadow-lg shadow-purple-900/50' : 'bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10 hover:text-white')}><Icon className="w-4 h-4" />{cat.label}</button>
              })}
            </div>
          </div>
        </section>
        <section className="py-6 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-3">
              {filteredItems.length === 0 ? <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl"><p className="text-neutral-400">Nenhuma pergunta encontrada</p></div> : filteredItems.map((item, idx) => {
                const cat = categories.find(c => c.id === item.category)
                const isOpen = openId === item.id
                const Icon = cat?.icon || HelpCircle
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="bg-white/5 rounded-xl shadow-lg border border-white/10 overflow-hidden backdrop-blur-sm">
                    <button onClick={() => setOpenId(isOpen ? null : item.id)} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors">
                      {cat && <span className={'p-2 rounded-lg ' + cat.color.replace('text-white', 'text-white/90')}><Icon className="w-5 h-5" /></span>}
                      <span className="flex-1 font-semibold text-white">{item.question}</span>
                      {isOpen ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
                    </button>
                    {isOpen && <div className="px-5 pb-5"><div className="pl-14 text-neutral-300 leading-relaxed border-t border-white/5 pt-4">{item.answer}</div></div>}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
        <section className="py-12 border-t border-white/5 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ainda tem dúvidas?</h2>
            <p className="text-neutral-400 mb-6">Nossa comunidade está pronta para ajudar</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://discord.gg/lunes" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-lunes-purple text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-900/50">Discord</a>
              <a href="https://t.me/likitoken" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/50">Telegram</a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
