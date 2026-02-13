import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, Badge, Input, Slider, Label } from '../../components/ui'
import { Trophy, Calculator, Shield, Flame, AlertTriangle, TrendingUp, Loader2, CheckCircle, Lock, Users, Award, Zap, Target, Banknote } from 'lucide-react'

const SCORE_PARAMS = { S_L_inicial: 200000000, floor_f: 50000000, alpha: 500000, gamma: 1.2, T_min: 100000, theta: 0.20, S_ref: 1000000000, haircut_psp22: 0.10, haircut_nft: 0.50, max_lunes: 95, max_outros: 5 }

const Score: React.FC = () => {
  console.log('--- Score Component Loaded (Banknote Version) ---');
  const navigate = useNavigate()
  const [lunesGuarantee, setLunesGuarantee] = useState(500000)
  const [otherTokensValue, setOtherTokensValue] = useState(50000)
  const [nftValue, setNftValue] = useState(0)
  const [projectSize, setProjectSize] = useState(100000000)
  const [currentLunesSupply, setCurrentLunesSupply] = useState(180000000)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateScore = useCallback(() => {
    const { S_L_inicial, floor_f, alpha, gamma, T_min, theta, S_ref, haircut_psp22, haircut_nft, max_lunes, max_outros } = SCORE_PARAMS
    if (lunesGuarantee <= 0) return { lunesScore: 0, otherScore: 0, finalScore: 0, tBase: T_min, tPrime: T_min, burnProgress: 0, warning: 'LUNES obrigatorio' }
    const burnProgress = Math.min(1, Math.max(0, (S_L_inicial - currentLunesSupply) / (S_L_inicial - floor_f)))
    const tBase = Math.max(T_min, alpha * Math.pow(projectSize / S_ref, gamma))
    const tPrime = tBase / (1 + theta * burnProgress)
    const lunesScore = Math.min(max_lunes, (lunesGuarantee / tPrime) * max_lunes)
    const adjustedOther = (otherTokensValue * haircut_psp22) + (nftValue * haircut_nft)
    const otherScore = Math.min(max_outros, (adjustedOther / tBase) * max_outros)
    const finalScore = Math.min(100, lunesScore + otherScore)
    return { lunesScore: Math.round(lunesScore * 10) / 10, otherScore: Math.round(otherScore * 10) / 10, finalScore: Math.round(finalScore * 10) / 10, tBase: Math.round(tBase), tPrime: Math.round(tPrime), burnProgress, warning: lunesScore < 70 ? 'Considere aumentar garantia' : null }
  }, [lunesGuarantee, otherTokensValue, nftValue, projectSize, currentLunesSupply])

  const score = calculateScore()
  const handleCalculate = async () => { setIsCalculating(true); await new Promise(r => setTimeout(r, 500)); setIsCalculating(false) }
  const formatNum = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toString()
  const getScoreStyle = (s: number) => s >= 90 ? { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', label: 'Excelente' } : s >= 80 ? { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', label: 'Muito Bom' } : s >= 70 ? { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50', label: 'Bom' } : { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50', label: 'Baixo' }



  const benefits = [
    { icon: Shield, title: 'Protecao ao Investidor', desc: 'Garantias bloqueadas protegem contra rug pulls' },
    { icon: TrendingUp, title: 'Credibilidade', desc: 'Score alto atrai mais usuarios e investidores' },
    { icon: Lock, title: 'Compromisso', desc: 'Vesting de 5 anos demonstra visao de longo prazo' },
    { icon: Users, title: 'Governanca', desc: 'Comunidade decide sobre liberacao de garantias' },
  ]

  return (
    <>
      <Helmet><title>Score de Garantia | SafeGard</title></Helmet>
      <div className="min-h-screen bg-lunes-dark text-white selection:bg-lunes-purple/30 selection:text-white">
        {/* Hero */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-lunes-dark">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lunes-purple/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lunes-light/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 shadow-lg shadow-lunes-purple/10">
                <Zap className="w-4 h-4 text-lunes-yellow" fill="currentColor" />
                <span className="text-sm font-medium text-lunes-light tracking-wide">Score v1.1 - On-Chain Analysis</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                Score de Garantia
              </h1>

              <p className="text-xl md:text-2xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Sistema de pontuação transparente que avalia a confiabilidade de projetos Web3 baseado em <span className="text-lunes-light font-medium">garantias reais</span>.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  size="lg"
                  variant="purple"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="h-12 px-8 text-lg shadow-lg shadow-lunes-purple/25 hover:shadow-lunes-purple/40"
                >
                  <Calculator className="w-5 h-5" />
                  Simular Score
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-lg border-white/10 hover:bg-white/5 text-white hover:text-white"
                  onClick={() => navigate('/ranking')}
                >
                  <Trophy className="w-5 h-5" />
                  Ver Ranking
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 lg:py-28 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que o Score importa?</h2>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto">O Score de Garantia cria um ecossistema mais seguro, transparente e sustentável.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-900/20 group">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-lunes-purple/20 transition-colors border border-white/5 group-hover:border-lunes-purple/30">
                        <b.icon className="w-8 h-8 text-lunes-light group-hover:text-lunes-purple transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{b.title}</h3>
                      <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors">{b.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 lg:py-28 bg-white/2 relative border-y border-white/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          <div className="container mx-auto px-4 relative">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">Como Funciona</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { n: '01', t: 'Deposite LUNES', d: 'Token obrigatório, até 95 pontos', icon: Flame },
                { n: '02', t: 'Adicione Ativos', d: 'PSP22 e NFTs complementam', icon: Banknote },
                { n: '03', t: 'Score Calculado', d: 'Fórmula considera TVL', icon: Calculator },
                { n: '04', t: 'Ranking Público', d: 'Visibilidade garantida', icon: Trophy },
              ].map((s, i) => (
                <div key={i} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-lunes-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl"></div>
                  <Card className="relative h-full bg-lunes-dark border-white/10 hover:border-lunes-purple/40 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-4xl font-bold text-white/5 group-hover:text-lunes-purple/20 transition-colors">{s.n}</span>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-lunes-purple/20 transition-colors">
                          <s.icon className="w-5 h-5 text-lunes-light group-hover:text-lunes-purple transition-colors" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lunes-light transition-colors">{s.t}</h3>
                      <p className="text-sm text-neutral-400">{s.d}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Score Ranges */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">Faixas de Score <span className="text-lunes-purple">SafeGuard</span></h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { min: 90, label: 'Excelente', desc: 'Garantias excepcionais', color: 'emerald', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10', Icon: Award },
                { min: 80, label: 'Muito Bom', desc: 'Acima da média', color: 'blue', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: 'shadow-blue-500/10', Icon: CheckCircle },
                { min: 70, label: 'Bom', desc: 'Nível adequado', color: 'amber', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'shadow-amber-500/10', Icon: Target },
                { min: 0, label: 'Atenção', desc: 'Necessita melhorias', color: 'red', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-red-500/10', Icon: AlertTriangle },
              ].map((r, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className={`rounded-2xl border ${r.border} ${r.bg} p-6 backdrop-blur-md transition-all duration-300 hover:shadow-xl ${r.glow}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${r.bg} border ${r.border} mx-auto mb-6 flex items-center justify-center`}>
                    <r.Icon className={`w-7 h-7 ${r.text}`} />
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-black mb-2 ${r.text}`}>{r.min}+</div>
                    <h3 className="font-bold text-white text-lg mb-2">{r.label}</h3>
                    <p className="text-sm text-neutral-400">{r.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section id="calculator" className="py-20 lg:py-32 bg-lunes-dark relative border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-lunes-purple/5 to-transparent pointer-events-none"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4 bg-lunes-purple/10 text-lunes-light border-lunes-purple/20">Simulador 2.0</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Simulador de Score</h2>
              <p className="text-neutral-400 max-w-xl mx-auto">Calcule o impacto das suas garantias e planeje o crescimento do seu projeto.</p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* Inputs - Left Panel */}
                <div className="lg:col-span-7 space-y-6">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-lunes-purple/20 flex items-center justify-center border border-lunes-purple/20">
                          <Calculator className="w-5 h-5 text-lunes-light" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">Configuração de Garantias</h3>
                          <p className="text-sm text-neutral-400">Ajuste os valores para simular</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8 space-y-8">
                      {/* LUNES Input */}
                      <div className="bg-white/5 rounded-xl p-6 border border-white/5 transition-colors hover:border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-base font-semibold text-white flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-400" /> Garantia em LUNES
                          </Label>
                          <span className="text-orange-400 text-xs font-bold uppercase tracking-wider bg-orange-400/10 px-2 py-1 rounded">Obrigatório</span>
                        </div>

                        <div className="flex gap-4 mb-4">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              value={lunesGuarantee}
                              onChange={(e) => setLunesGuarantee(Math.max(0, Number(e.target.value)))}
                              className="bg-black/30 border-white/10 text-white pl-4 pr-16 h-12 text-lg focus:border-lunes-purple/50 focus:ring-lunes-purple/50 font-mono"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">LUNES</span>
                          </div>
                        </div>

                        <Slider
                          value={lunesGuarantee}
                          onValueChange={setLunesGuarantee}
                          min={0}
                          max={5000000}
                          step={10000}
                          className="py-2"
                        />
                        <div className="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                          <span>0 LUNES</span>
                          <span>5M LUNES</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Other Tokens */}
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <Label className="text-sm font-semibold text-white mb-1 block">Outros Tokens (PSP22)</Label>
                          <p className="text-xs text-neutral-500 mb-4">0.1x Peso (90% Haircut)</p>
                          <div className="relative mb-3">
                            <Input
                              type="number"
                              value={otherTokensValue}
                              onChange={(e) => setOtherTokensValue(Math.max(0, Number(e.target.value)))}
                              className="bg-black/30 border-white/10 text-white h-10 font-mono text-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">LUSDT</span>
                          </div>
                          <Slider value={otherTokensValue} onValueChange={setOtherTokensValue} min={0} max={500000} step={5000} />
                        </div>

                        {/* NFTs */}
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                          <Label className="text-sm font-semibold text-white mb-1 block">NFTs & Colecionáveis</Label>
                          <p className="text-xs text-neutral-500 mb-4">0.5x Peso (50% Haircut)</p>
                          <div className="relative mb-3">
                            <Input
                              type="number"
                              value={nftValue}
                              onChange={(e) => setNftValue(Math.max(0, Number(e.target.value)))}
                              className="bg-black/30 border-white/10 text-white h-10 font-mono text-sm"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500">U$</span>
                          </div>
                          <Slider value={nftValue} onValueChange={setNftValue} min={0} max={200000} step={5000} />
                        </div>
                      </div>

                      {/* Advanced Params Toggle or Section */}
                      <div className="border-t border-white/5 pt-6">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => { }}>
                          <Label className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
                            <Target className="w-4 h-4" /> Parâmetros Avançados de Rede
                          </Label>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 mt-4 opacity-75">
                          <div>
                            <Label className="text-xs text-neutral-500 mb-1 block">Tamanho do Projeto (TVL)</Label>
                            <div className="flex gap-2">
                              <Input type="number" value={projectSize} onChange={(e) => setProjectSize(Math.max(1000000, Number(e.target.value)))} className="bg-black/30 border-white/10 text-white h-9 text-xs font-mono" />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-neutral-500 mb-1 block">Supply Circulante</Label>
                            <div className="flex gap-2">
                              <Input type="number" value={currentLunesSupply} onChange={(e) => setCurrentLunesSupply(Math.max(50000000, Number(e.target.value)))} className="bg-black/30 border-white/10 text-white h-9 text-xs font-mono" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results - Right Panel (Sticky) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                  {/* Score Display */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-lunes-purple/20 blur-3xl rounded-full opacity-20"></div>
                    <Card className="relative bg-lunes-dark/50 border-white/10 backdrop-blur-xl overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lunes-purple via-lunes-light to-lunes-purple opacity-50`}></div>
                      <CardContent className="p-8 text-center">
                        <h3 className="text-neutral-400 font-medium mb-4 uppercase tracking-widest text-sm">Score Estimado</h3>

                        <div className="relative inline-block">
                          <span className={`text-8xl font-black bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent flex justify-center items-center tracking-tighter`}>
                            {score.finalScore}
                          </span>
                          {/* Circular Progress (Visual only for now) */}
                          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 -rotate-90 pointer-events-none opacity-20">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="2" fill="none" className="text-white" />
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="4" fill="none" className="text-lunes-light" strokeDasharray="553" strokeDashoffset={553 - (553 * score.finalScore / 100)} />
                          </svg>
                        </div>

                        <div className="mt-6 flex justify-center">
                          <Badge className={`${score.finalScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : score.finalScore >= 70 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} px-6 py-1.5 text-lg border backdrop-blur-md`}>
                            {score.warning || getScoreStyle(score.finalScore).label}
                          </Badge>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <div className="text-xs text-neutral-500 mb-1">LUNES Score</div>
                            <div className="text-xl font-bold text-white">{score.lunesScore} <span className="text-xs text-neutral-600">/ 95</span></div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <div className="text-xs text-neutral-500 mb-1">Outros Score</div>
                            <div className="text-xl font-bold text-white">{score.otherScore} <span className="text-xs text-neutral-600">/ 5</span></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Technical Data */}
                  <Card className="bg-white/5 border-white/5 backdrop-blur-md">
                    <CardContent className="p-5">
                      <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-lunes-yellow" /> Dados de Execução
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <span className="text-neutral-500">Coeficiente T_base</span>
                          <span className="font-mono text-lunes-light">{formatNum(score.tBase)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                          <span className="text-neutral-500">Coeficiente T (Burn Adjusted)</span>
                          <span className="font-mono text-lunes-light">{formatNum(score.tPrime)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-500">Fator de Queima (Burn)</span>
                          <span className="font-mono text-green-400">{(score.burnProgress * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-lunes-purple hover:bg-lunes-purple-dark text-white shadow-lg shadow-lunes-purple/20 h-12"
                      onClick={handleCalculate}
                      disabled={isCalculating}
                    >
                      {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                      {isCalculating ? 'Processando...' : 'Recalcular Agora'}
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ranking CTA */}
        <section className="py-24 relative overflow-hidden border-t border-white/5 bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-lunes-purple/10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lunes-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-lunes-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-lunes-purple/30 shadow-lg shadow-lunes-purple/20">
                <Trophy className="w-10 h-10 text-lunes-yellow drop-shadow-glow" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ranking de Projetos</h2>
              <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Veja os projetos mais confiáveis do ecossistema, auditados e classificados por nosso <span className="text-lunes-light font-semibold">algoritmo on-chain</span>.
              </p>
              <Button size="lg" variant="purple" onClick={() => navigate('/ranking')} className="shadow-xl shadow-lunes-purple/30 h-14 px-10 text-lg font-bold group">
                <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Acessar Ranking Completo
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-28 bg-lunes-dark relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-lunes-purple/20 via-transparent to-lunes-light/5 opacity-30"></div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">
                Pronto para Construir <span className="text-transparent bg-clip-text bg-gradient-to-r from-lunes-purple to-lunes-light">Confiança?</span>
              </h2>
              <p className="text-xl text-neutral-400 mb-12 leading-relaxed">
                Cadastre seu projeto no SafeGuard e demonstre seu compromisso com a comunidade através de garantias verificáveis e transparentes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Button
                  size="lg"
                  className="bg-white text-lunes-dark hover:bg-neutral-200 h-16 px-10 text-xl font-bold shadow-2xl shadow-white/10"
                  onClick={() => navigate('/cadastrar-projeto')}
                >
                  Cadastrar Projeto Agora
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 h-16 px-10 text-xl font-semibold backdrop-blur-sm"
                  onClick={() => navigate('/projetos')}
                >
                  Explorar Projetos
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export { Score }
export default Score
