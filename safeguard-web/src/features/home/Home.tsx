import React from 'react'
import { useTranslation } from 'react-i18next'
import { SEOHead, StructuredData } from '../../components/seo'
import { useMotion } from '../../components/animation/useMotion'
import { Button } from '../../components/ui'
import { Hero } from './components/Hero'
import { Shield, Zap, Globe, ArrowRight, ExternalLink, CheckCircle } from 'lucide-react'

const Home: React.FC = () => {
  const { t } = useTranslation()
  const motion = useMotion(true)
  const MotionDiv = motion ? motion.div : 'div'

  // Mock data for stats
  const stats = [
    {
      value: '15.4M LUNES',
      label: t('home.stats.totalLocked'),
      change: '+12.5%',
      positive: true
    },
    {
      value: '24',
      label: t('home.stats.activeProtocols'),
      change: '+8.3%',
      positive: true
    },
    {
      value: '87.3%',
      label: t('home.stats.avgApy'),
      change: '+2.1%',
      positive: true
    }
  ]

  return (
    <>
      <SEOHead
        title={t('home.seo.title')}
        description={t('home.seo.description')}
        keywords={[
          'safeguard', 'protocol', 'defi', 'web3', 'lunes', 'blockchain',
          'cryptocurrency', 'decentralized finance'
        ]}
        canonical="https://safeguard.lunes.io"
        image="https://safeguard.lunes.io/og-image.jpg"
      />

      <StructuredData
        type="organization"
        data={{
          organization: {
            name: 'SafeGuard Protocol',
            description: t('home.hero.subtitle'),
            url: 'https://safeguard.lunes.io',
            logo: 'https://safeguard.lunes.io/logo.png',
            sameAs: [
              'https://twitter.com/safeguardprotocol',
              'https://github.com/safeguard-protocol',
              'https://discord.gg/safeguard'
            ]
          }
        }}
      />

      <main className="min-h-screen bg-lunes-dark text-white overflow-hidden">
        {/* New Hero Component */}
        <Hero />

        {/* Stats Section - Dark & Glassmorphic */}
        <section className="relative z-10 -mt-20 pb-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <MotionDiv
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-lunes-purple/40 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-lunes-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                  <div className="relative z-10">
                    <div className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-neutral-400 font-medium uppercase tracking-wide text-xs">
                        {stat.label}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stat.positive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>


        {/* Features Section - Dark */}
        <section className="py-24 relative" aria-labelledby="features-title">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-lunes-purple/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 id="features-title" className="text-3xl md:text-5xl font-bold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                  Por que Escolher SafeGuard?
                </span>
              </h2>
              <p className="text-xl text-neutral-400 leading-relaxed">
                Descubra as vantagens revolucionárias que posicionam o SafeGuard como líder no ecossistema Web3
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  title: 'Segurança Máxima',
                  description: 'Protocolo auditado e descentralizado que garante a segurança das suas transações Web3.',
                  icon: <Shield className="w-8 h-8 text-lunes-purple" />
                },
                {
                  title: 'Transações Rápidas',
                  description: 'Processamento otimizado que reduz custos e acelera suas operações DeFi.',
                  icon: <Zap className="w-8 h-8 text-lunes-purple" />
                },
                {
                  title: 'Multi-Chain',
                  description: 'Compatível com múltiplas blockchains para máxima flexibilidade e alcance.',
                  icon: <Globe className="w-8 h-8 text-lunes-purple" />
                }
              ].map((feature, index) => (
                <MotionDiv
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 p-8 rounded-3xl backdrop-blur-sm border border-white/5 hover:border-lunes-purple/30 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-lunes-purple/10 flex items-center justify-center mb-6 group-hover:bg-lunes-purple group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                    {feature.description}
                  </p>
                </MotionDiv>
              ))}
            </div>

            {/* CTA Box */}
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 p-12 lg:p-20 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-lunes-purple/20 via-lunes-dark to-lunes-dark z-0" />
              <div className="absolute inset-0 bg-transparent opacity-20" />

              <div className="relative z-10 max-w-3xl mx-auto">
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">Pronto para Começar?</h3>
                <p className="text-lg text-neutral-400 mb-10 leading-relaxed">
                  Explore todas as funcionalidades e integre seu projeto hoje mesmo com segurança e eficiência.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-white text-lunes-dark hover:bg-neutral-200 h-12 px-8 text-base font-semibold rounded-full">
                    Acessar Documentação <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base font-semibold rounded-full backdrop-blur-sm">
                    Ver Demo <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section - Dark */}
        <section className="relative py-32 overflow-hidden" aria-labelledby="how-it-works-title">
          {/* Background Gradients */}
          <div className="absolute inset-0 bg-lunes-dark z-0" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-lunes-purple/5 to-transparent rounded-full blur-[100px] opacity-60" />

          <div className="container mx-auto px-4 relative z-10">
            <header className="text-center mb-24">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lunes-purple opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-lunes-purple"></span>
                  </span>
                  <span className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">Processo Simplificado</span>
                </div>

                <h2 id="how-it-works-title" className="text-4xl lg:text-6xl font-bold text-white mb-8">
                  <span className="bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                    {t('home.howItWorks.title')}
                  </span>
                </h2>
                <p className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                  {t('home.howItWorks.description')}
                </p>
              </MotionDiv>
            </header>

            {/* Timeline */}
            <div className="relative max-w-5xl mx-auto">
              {/* Central Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-lunes-purple/50 to-transparent" />

              <div className="space-y-24">
                {[1, 2, 3].map((step, index) => (
                  <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>

                    {/* Center Node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-lunes-dark border-4 border-lunes-purple/20 flex items-center justify-center shadow-[0_0_30px_rgba(108,56,255,0.3)]">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className={`w-[45%] ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                      <MotionDiv
                        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-4">
                          {t(`home.howItWorks.steps.${step}.title`)}
                        </h3>
                        <p className="text-lg text-neutral-400 leading-relaxed mb-6">
                          {t(`home.howItWorks.steps.${step}.description`)}
                        </p>

                        <div className={`flex items-center gap-3 text-sm text-lunes-purple ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">
                            {index === 0 ? 'Integração imediata' : index === 1 ? 'Segurança automatizada' : 'Insights em tempo real'}
                          </span>
                        </div>
                      </MotionDiv>
                    </div>

                    {/* Empty space for balance */}
                    <div className="w-[45%]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <footer className="mt-32 text-center pb-20">
              <MotionDiv
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
              >
                <h3 className="text-3xl font-bold text-white mb-8">
                  Evolua sua segurança on-chain
                </h3>
                <Button size="lg" className="bg-lunes-purple hover:bg-lunes-purple-dark text-white px-10 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-lunes-purple/25 transition-all hover:scale-105">
                  {t('home.howItWorks.learnMore')} <ArrowRight className="w-5 h-5" />
                </Button>
              </MotionDiv>
            </footer>
          </div>
        </section>
      </main>
    </>
  )
}

export { Home }
