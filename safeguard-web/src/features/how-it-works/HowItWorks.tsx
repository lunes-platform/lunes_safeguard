import React from 'react'
// import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';
import { Shield, Coins, TrendingUp, Users, Lock, Wallet, FileCheck, Gift, PlusCircle, Search } from 'lucide-react'
import { DonutChart, OptimizedImage } from '../../components/ui'

export const HowItWorks: React.FC = () => {
  // const { t } = useTranslation();

  const platformSteps = [
    {
      id: 1,
      title: "Cadastro de Projetos",
      description: "Desenvolvedores cadastram seus projetos na plataforma",
      details: "Os projetos cadastram seu token informando o endereço do contrato e adicionam garantias em Lunes e outros tokens da rede",
      icon: <FileCheck className="h-8 w-8 text-lunes-purple" />,
      color: 'bg-lunes-purple',
    },
    {
      id: 2,
      title: "Adição de Garantias",
      description: "Tokens Lunes e outros ativos da rede são adicionados como garantia",
      details: "Lunes tem maior peso no score de garantia (quanto mais Lunes, maior a garantia). LUSDT e outros tokens da rede têm peso menor",
      icon: <Coins className="h-8 w-8 text-lunes-purple" />,
      color: 'bg-lunes-light',
    },
    {
      id: 3,
      title: "Pagamento de Taxas",
      description: "Taxa de pagamento: 1000 + 100 LUSDT",
      details: "As taxas são utilizadas para manutenção da plataforma e desenvolvimento contínuo do ecossistema",
      icon: <Wallet className="h-8 w-8 text-lunes-purple" />,
      color: 'bg-lunes-purple-dark',
    },
    {
      id: 4,
      title: "Aumento do Score",
      description: "O score do projeto aumenta progressivamente com novas garantias",
      details: "Garantias podem ser adicionadas múltiplas vezes, aumentando o score do projeto progressivamente",
      icon: <TrendingUp className="h-8 w-8 text-lunes-purple" />,
      color: 'bg-lunes-dark',
    },
    {
      id: 5,
      title: "Doações da Comunidade",
      description: "A comunidade pode fazer doações para aumentar as garantias",
      details: "Membros da comunidade podem contribuir com garantias adicionais para projetos em que acreditam",
      icon: <Gift className="h-8 w-8 text-lunes-purple" />,
      color: 'bg-critical-500',
    },
  ]

  const benefits = [
    {
      title: "Segurança para Investidores",
      description: "Garantia mínima assegurada para investidores em caso de problemas com o projeto",
      icon: <Shield className="h-8 w-8 text-lunes-purple" />,
    },
    {
      title: "Decisões Informadas",
      description: "Melhor base para decisões de investimento com transparência sobre as garantias",
      icon: <Lock className="h-8 w-8 text-lunes-purple" />,
    },
    {
      title: "Benefícios para Desenvolvedores",
      description: "Maior credibilidade e confiança da comunidade em seus projetos",
      icon: <FileCheck className="h-8 w-8 text-lunes-purple" />,
    },
    {
      title: "Vantagens para a Comunidade",
      description: "Ecossistema mais seguro e confiável para todos os participantes",
      icon: <Users className="h-8 w-8 text-lunes-purple" />,
    },
  ]

  const scoreData = [
    { label: "Tokens Lunes", value: 90, color: "#6366f1" },
    { label: "LUSDT", value: 5, color: "#22c55e" },
    { label: "Outros Tokens", value: 5, color: "#f59e0b" }
  ]

  return (
    <>
      <Helmet>
        <title>Como Funciona o SafeGard | Lunes</title>
        <meta name="description" content="Entenda como funciona a plataforma SafeGard da Lunes, que permite que desenvolvedores adicionem garantias para investidores do ecossistema." />
        <meta property="og:title" content="Como Funciona o SafeGard | Lunes" />
        <meta property="og:description" content="Entenda como funciona a plataforma SafeGard da Lunes, que permite que desenvolvedores adicionem garantias para investidores do ecossistema." />
        <link rel="canonical" href="https://safeguard.lunes.io/como-funciona" />
      </Helmet>

      <main id="main-content" className="min-h-screen bg-lunes-dark text-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-lunes-purple-dark/20 to-lunes-dark py-16 lg:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Badge variant="secondary" className="text-sm px-4 py-1 mb-6 bg-lunes-purple/20 text-lunes-purple border border-lunes-purple/30 backdrop-blur-md">
                Protocolo de Garantias Web3
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Como Funciona o SafeGuide
              </h1>
              <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
                Entenda como a plataforma permite que desenvolvedores adicionem garantias para investidores do ecossistema Lunes
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" variant="purple">
                  Ver Projetos
                </Button>
                <Button size="lg" variant="purple-outline">
                  Cadastrar Projeto
                </Button>
              </div>
            </motion.header>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-lunes-purple/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-lunes-light/5 rounded-full blur-2xl"></div>
        </section>

        {/* Platform Flow Section */}
        <section className="py-16 lg:py-24 relative overflow-hidden bg-lunes-dark">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <header className="text-center mb-16">
              <Badge variant="secondary" className="text-sm px-4 py-1 mb-4 bg-lunes-purple/20 text-lunes-purple border border-lunes-purple/30 backdrop-blur-md">
                Passo a Passo
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                Como Funciona o Fluxo da Plataforma
              </h2>
              <p className="text-lg text-neutral-400 max-w-3xl mx-auto">
                Entenda o passo a passo de como a plataforma funciona para garantir segurança e transparência no ecossistema Lunes
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {platformSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 rounded-xl p-8 shadow-lg border border-white/10 backdrop-blur-sm hover:border-lunes-purple/50 transition-all hover:shadow-purple-900/20 hover:shadow-xl group"
                >
                  <div className="mb-6 bg-lunes-purple/10 p-4 rounded-lg inline-block group-hover:bg-lunes-purple/20 transition-all">
                    <div className="flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <span className="inline-block bg-lunes-purple/20 text-lunes-purple text-xs font-medium px-2.5 py-1 rounded-full mb-3 border border-lunes-purple/30">
                    Etapa {step.id}
                  </span>
                  <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-neutral-400">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Button variant="purple-outline" size="lg">
                Ver Documentação Completa
              </Button>
            </div>
          </div>
        </section>

        {/* Score Distribution Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-lunes-dark to-lunes-purple/5 relative border-y border-white/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <header className="text-center mb-16">
              <Badge variant="secondary" className="text-sm px-4 py-1 mb-4 bg-lunes-purple/20 text-lunes-purple border border-lunes-purple/30 backdrop-blur-md">
                Transparência
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                Distribuição do Score de Confiança
              </h2>
              <p className="text-lg text-neutral-400 max-w-3xl mx-auto">
                Entenda como calculamos o score de confiabilidade dos projetos para garantir transparência e segurança
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white/5 p-8 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm"
              >
                <DonutChart
                  data={scoreData}
                  size={300}
                  thickness={50}
                  showLegend={true}
                  ariaLabel="Distribuição do Score de Garantia"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-semibold mb-6 text-lunes-dark">Composição do Score</h3>
                <div className="space-y-6">
                  {scoreData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      viewport={{ once: true }}
                      className="bg-white/5 p-4 rounded-lg shadow-sm border border-white/10 backdrop-blur-sm hover:border-lunes-purple/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-10 h-10 rounded-full mr-4 flex items-center justify-center"
                            style={{ backgroundColor: `${item.color}20` }}
                          >
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{item.label}</h4>
                            <p className="text-sm text-neutral-400">{item.value}%</p>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-lunes-purple">{item.value}%</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-lunes-purple/10 rounded-lg border border-lunes-purple/20">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-lunes-purple mr-3 mt-0.5" />
                    <p className="text-sm text-neutral-700">
                      O score é calculado automaticamente com base em dados verificáveis on-chain e informações validadas pela equipe Lunes. Projetos com score acima de 80% são considerados de alta confiabilidade.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-lunes-dark to-lunes-purple/5 relative border-t border-white/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          <div className="container mx-auto px-4">
            <header className="text-center mb-16">
              <Badge variant="secondary" className="text-sm px-4 py-1 mb-4 bg-lunes-purple/20 text-lunes-purple border border-lunes-purple/30 backdrop-blur-md">
                Vantagens
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                Benefícios para o Ecossistema
              </h2>
              <p className="text-lg text-neutral-400 max-w-3xl mx-auto">
                O SafeGuard traz diversos benefícios para todos os participantes do ecossistema Lunes
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 rounded-xl p-8 shadow-lg border border-white/10 backdrop-blur-sm hover:border-lunes-purple/50 transition-all hover:shadow-purple-900/20 hover:shadow-xl group"
                >
                  <div className="mb-6 bg-lunes-purple/10 p-4 rounded-lg inline-block group-hover:bg-lunes-purple/20 transition-all">
                    <div className="flex items-center justify-center">
                      {benefit.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{benefit.title}</h3>
                  <p className="text-neutral-400">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 p-6 bg-white/5 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <OptimizedImage
                    src="/images/ecosystem.svg"
                    alt="Ecossistema Lunes"
                    width={200}
                    height={200}
                    className="w-32 h-32"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">Junte-se ao Ecossistema</h3>
                  <p className="text-neutral-400 mb-4">
                    Faça parte de um ecossistema em crescimento que valoriza a segurança, transparência e inovação no mundo Web3.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="purple">
                      Cadastrar Projeto
                    </Button>
                    <Button variant="purple-outline">
                      Explorar Projetos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detalhes do Contrato */}
        <section className="py-16 lg:py-24 bg-lunes-dark border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="text-sm px-4 py-1 mb-4 bg-lunes-purple/20 text-lunes-purple border-lunes-purple/30">
                Smart Contracts
              </Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">Detalhes do Contrato</h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
                Entenda como funciona o contrato inteligente que garante a segurança das garantias
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Funcionamento do Contrato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Lock className="h-5 w-5 text-lunes-purple mt-1" />
                      <div>
                        <p className="font-medium text-white">Custódia Segura</p>
                        <p className="text-neutral-400">Os tokens de garantia são mantidos em custódia pelo contrato inteligente, garantindo que não possam ser retirados sem o devido processo.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-lunes-purple mt-1" />
                      <div>
                        <p className="font-medium text-white">Proteção ao Investidor</p>
                        <p className="text-neutral-400">Em caso de problemas com o projeto, os tokens de garantia podem ser distribuídos aos investidores afetados.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-lunes-purple mt-1" />
                      <div>
                        <p className="font-medium text-white">Aumento Progressivo</p>
                        <p className="text-neutral-400">O contrato permite adicionar mais garantias ao longo do tempo, aumentando o score do projeto e a confiança dos investidores.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Taxas e Requisitos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Wallet className="h-5 w-5 text-lunes-purple mt-1" />
                      <div>
                        <p className="font-medium">Taxa de Cadastro</p>
                        <p className="text-neutral-600">Para cadastrar um projeto, é necessário pagar uma taxa de 1000 + 100 LUSDT, que é utilizada para manutenção da plataforma.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Coins className="h-5 w-5 text-lunes-purple mt-1" />
                      <div>
                        <p className="font-medium">Garantia Mínima</p>
                        <p className="text-neutral-600">É necessário adicionar uma garantia mínima em tokens Lunes para que o projeto seja listado na plataforma.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileCheck className="h-5 w-5 text-lunes-purple mt-1" />
                      <div>
                        <p className="font-medium">Verificação do Contrato</p>
                        <p className="text-neutral-600">O endereço do contrato do token do projeto é verificado para garantir sua autenticidade antes da listagem.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="mt-12 text-center">
              <Button variant="purple" size="lg">
                Ver Documentação Técnica
              </Button>
            </div>
          </div>
        </section>



        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-lunes-purple/20 to-lunes-dark border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">Pronto para adicionar garantias ao seu projeto?</h2>
              <p className="text-lg text-neutral-400 mb-8">
                Cadastre seu projeto agora e aumente a confiança dos investidores com o SafeGuard
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" variant="purple">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Cadastrar Projeto
                </Button>
                <Button size="lg" variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  Ver Projetos Existentes
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default HowItWorks
