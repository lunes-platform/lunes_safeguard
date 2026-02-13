import React, { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, Badge } from '../../components/ui'
import { Trophy, Crown, Medal, Award, Search, Zap, Star } from 'lucide-react'

import { contractService } from '../../services/contractService'

interface RankedProject {
  rank: number
  id: number
  name: string
  score: number
  lunes: number
  totalValue: number
  category: string
}

const Ranking: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [projects, setProjects] = useState<RankedProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true)
      try {
        if (!contractService.isContractConnected()) {
          await contractService.connect()
        }

        const allProjects = await contractService.getAllProjects()

        // Fetch vault for each project to get balances (LUNES only for now)
        const ranked: RankedProject[] = await Promise.all(
          allProjects.map(async (p, idx) => {
            const vault = await contractService.getProjectVault(p.id)
            return {
              rank: 0, // Will be set after sort
              id: p.id,
              name: p.name,
              score: p.score || 50,
              lunes: vault ? Number(vault.totalLunes / BigInt(10 ** 8)) : 0,
              totalValue: vault ? Number(vault.totalLunes / BigInt(10 ** 8)) + Number(vault.totalLusdt / BigInt(10 ** 12)) : 0,
              category: 'Blockchain'
            }
          })
        )

        // Sort by score and then by value
        const sorted = ranked.sort((a, b) => b.score - a.score || b.totalValue - a.totalValue)
          .map((p, i) => ({ ...p, rank: i + 1 }))

        setProjects(sorted)
      } catch (err) {
        console.error('Error fetching ranking:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  const filteredData = useMemo(() => {
    if (!searchTerm) return projects
    return projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm, projects])

  const totalPages = Math.ceil(filteredData.length / (projects.length === 0 ? 1 : 10)) // Prevent div by 0
  const paginatedData = filteredData.slice((currentPage - 1) * 10, currentPage * 10)

  const ITEMS_PER_PAGE = 10

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const formatNum = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toString()

  const getScoreInfo = (s: number) => {
    if (s >= 90) return { bg: 'bg-green-500', label: 'Excelente', labelColor: 'text-green-600' }
    if (s >= 80) return { bg: 'bg-blue-500', label: 'Muito Bom', labelColor: 'text-blue-600' }
    if (s >= 70) return { bg: 'bg-yellow-500', label: 'Bom', labelColor: 'text-yellow-600' }
    return { bg: 'bg-red-500', label: 'Baixo', labelColor: 'text-red-600' }
  }

  const totalGuarantees = projects.reduce((sum, p) => sum + p.totalValue, 0)
  const totalLunes = projects.reduce((sum, p) => sum + p.lunes, 0)

  return (
    <>
      <Helmet><title>Ranking de Projetos | SafeGard</title></Helmet>
      <div className="min-h-screen bg-lunes-dark text-white selection:bg-lunes-purple/30">
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lunes-purple/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-lunes-light/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
                <Star className="w-4 h-4 text-lunes-yellow" fill="currentColor" />
                <span className="text-sm font-medium text-lunes-light tracking-wide uppercase">Ecossistema On-Chain</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-neutral-400 bg-clip-text text-transparent tracking-tight">
                Ranking de Projetos
              </h1>
              <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                Os projetos mais confiáveis do ecossistema <span className="text-lunes-light font-medium">Lunes</span>, auditados e classificados por Score de Garantia.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { label: 'Projetos Rankeados', value: projects.length, icon: Trophy },
                  { label: 'Total em Garantias', value: `${formatNum(totalGuarantees)} LUSDT`, icon: Zap },
                  { label: 'Total em LUNES', value: formatNum(totalLunes), icon: Award },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[200px] hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-2 justify-center">
                      <stat.icon className="w-5 h-5 text-lunes-light group-hover:scale-110 transition-transform" />
                      <p className="text-neutral-400 text-sm font-medium">{stat.label}</p>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search */}
        <section className="py-12 relative z-20 -mt-10">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-white/10 flex items-center gap-3 focus-within:border-lunes-purple/50 focus-within:ring-4 focus-within:ring-lunes-purple/10 transition-all"
              >
                <Search className="w-6 h-6 text-neutral-500 ml-4" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar projeto por nome ou categoria..."
                  className="flex-1 bg-transparent py-4 px-2 text-lg text-white outline-none placeholder:text-neutral-500 font-medium"
                />
                <div className="hidden sm:block mr-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs text-neutral-500 font-mono">
                  ENTER
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Top 3 Podium */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Elite do Ecossistema</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">Os projetos com as maiores garantias e scores de confiabilidade verificados na rede.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-end pb-12">
              {/* 2nd Place */}
              {projects[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="md:order-1"
                >
                  <Link to={`/projeto/${projects[1].id}`} className="block group">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 overflow-hidden hover:scale-[1.02] border-t-2 border-t-neutral-400">
                      <div className="bg-gradient-to-br from-neutral-400/20 to-neutral-500/10 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-neutral-400/5 blur-3xl rounded-full translate-y-1/2"></div>
                        <Medal className="w-12 h-12 mx-auto mb-3 text-neutral-300 relative z-10" />
                        <div className="text-4xl font-black text-white relative z-10">#2</div>
                      </div>
                      <CardContent className="p-6 text-center">
                        <h3 className="font-bold text-xl text-white mb-2 group-hover:text-lunes-light transition-colors">{projects[1].name}</h3>
                        <Badge variant="outline" className="mb-4 bg-white/5 border-white/10 text-neutral-400 uppercase tracking-widest text-[10px]">
                          {projects[1].category}
                        </Badge>
                        <div className="flex flex-col items-center">
                          <div className={`text-4xl font-black ${getScoreInfo(projects[1].score).labelColor.replace('text-', 'text-')} mb-1 drop-shadow-sm`}>
                            {projects[1].score}
                          </div>
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-tighter mb-4">WARRANTY SCORE</p>
                          <div className="h-px w-12 bg-white/10 mb-4"></div>
                          <p className="text-sm font-mono text-lunes-light/80">{formatNum(projects[1].lunes)} <span className="text-neutral-600">LUNES</span></p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )}

              {/* 1st Place */}
              {projects[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:order-2 md:-mt-8 relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-lunes-yellow/20 via-lunes-purple/20 to-lunes-yellow/20 rounded-2xl blur-xl opacity-50"></div>
                  <Link to={`/projeto/${projects[0].id}`} className="block group relative z-10">
                    <Card className="bg-white/10 border-lunes-yellow/30 backdrop-blur-md hover:bg-white/15 transition-all duration-500 overflow-hidden hover:scale-[1.03] border-t-4 border-t-lunes-yellow shadow-2xl shadow-lunes-yellow/10">
                      <div className="bg-gradient-to-br from-lunes-yellow/20 to-yellow-600/10 p-10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-lunes-yellow/10 blur-3xl rounded-full translate-y-1/2"></div>
                        <Crown className="w-16 h-16 mx-auto mb-4 text-lunes-yellow animate-pulse relative z-10" />
                        <div className="text-5xl font-black text-white relative z-10">#1</div>
                      </div>
                      <CardContent className="p-8 text-center">
                        <h3 className="font-bold text-2xl text-white mb-2 group-hover:text-lunes-yellow transition-colors tracking-tight">{projects[0].name}</h3>
                        <Badge variant="outline" className="mb-6 bg-lunes-yellow/10 border-lunes-yellow/30 text-lunes-yellow uppercase tracking-widest text-[10px]">
                          {projects[0].category}
                        </Badge>
                        <div className="flex flex-col items-center">
                          <div className="text-6xl font-black text-green-400 mb-2 drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">
                            {projects[0].score}
                          </div>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-tighter mb-6">WARRANTY SCORE</p>
                          <div className="h-px w-20 bg-white/10 mb-6"></div>
                          <p className="text-lg font-mono text-lunes-light">{formatNum(projects[0].lunes)} <span className="text-neutral-600">LUNES</span></p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )}

              {/* 3rd Place */}
              {projects[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="md:order-3"
                >
                  <Link to={`/projeto/${projects[2].id}`} className="block group">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500 overflow-hidden hover:scale-[1.02] border-t-2 border-t-orange-500/50">
                      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-orange-500/5 blur-3xl rounded-full translate-y-1/2"></div>
                        <Award className="w-12 h-12 mx-auto mb-3 text-orange-400 relative z-10" />
                        <div className="text-4xl font-black text-white relative z-10">#3</div>
                      </div>
                      <CardContent className="p-6 text-center">
                        <h3 className="font-bold text-xl text-white mb-2 group-hover:text-lunes-light transition-colors">{projects[2].name}</h3>
                        <Badge variant="outline" className="mb-4 bg-white/5 border-white/10 text-neutral-400 uppercase tracking-widest text-[10px]">
                          {projects[2].category}
                        </Badge>
                        <div className="flex flex-col items-center">
                          <div className={`text-4xl font-black ${getScoreInfo(projects[2].score).labelColor.replace('text-', 'text-')} mb-1 drop-shadow-sm`}>
                            {projects[2].score}
                          </div>
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-tighter mb-4">WARRANTY SCORE</p>
                          <div className="h-px w-12 bg-white/10 mb-4"></div>
                          <p className="text-sm font-mono text-lunes-light/80">{formatNum(projects[2].lunes)} <span className="text-neutral-600">LUNES</span></p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Full Ranking */}
        <section className="py-20 bg-black/20 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-lunes-purple/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <h2 className="text-3xl font-bold text-white tracking-tight">Ranking Completo</h2>
              <div className="flex items-center gap-4 text-sm text-neutral-500 font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                  <span>Excelente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"></div>
                  <span>Bom</span>
                </div>
              </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-4">
              {filteredData.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-500 text-lg">Nenhum projeto encontrado para sua busca.</p>
                </div>
              ) : (
                paginatedData.map((project: RankedProject, idx: number) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link to={`/projeto/${project.id}`} className="block group">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 sm:p-6 hover:bg-white/10 hover:border-lunes-purple/30 transition-all duration-300 backdrop-blur-sm flex flex-col sm:flex-row items-center gap-6 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.05)]">
                        {/* Rank */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${project.rank === 1 ? 'bg-lunes-yellow/20 text-lunes-yellow border border-lunes-yellow/30' :
                          project.rank === 2 ? 'bg-neutral-400/20 text-neutral-300 border border-neutral-400/30' :
                            project.rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                              'bg-white/5 text-neutral-500 border border-white/10'
                          }`}>
                          {project.rank}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h3 className="text-xl font-bold text-white group-hover:text-lunes-light transition-colors truncate">{project.name}</h3>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                            <Badge variant="outline" className="bg-white/5 border-white/10 text-neutral-500 text-[10px] uppercase font-bold tracking-widest">{project.category}</Badge>
                            <span className="text-xs text-neutral-600 font-medium sm:hidden">SCORE: {project.score}</span>
                          </div>
                        </div>

                        {/* Score Badge */}
                        <div className="hidden sm:flex flex-col items-center px-6 border-x border-white/5">
                          <div className={`text-3xl font-black ${getScoreInfo(project.score).labelColor.replace('text-', 'text-')} drop-shadow-sm`}>
                            {project.score}
                          </div>
                          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-tighter">SCORE</p>
                        </div>

                        {/* Stats Group */}
                        <div className="flex items-center gap-8 px-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-tighter mb-1">GARANTIA LUNES</p>
                            <p className="font-mono text-lunes-light font-bold">{formatNum(project.lunes)}</p>
                          </div>
                          <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-tighter mb-1">VALOR TOTAL</p>
                            <p className="font-mono text-white font-bold">{formatNum(project.totalValue)} <span className="text-neutral-600">LUSDT</span></p>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-white/10 text-neutral-400 group-hover:text-white group-hover:border-lunes-purple/50 transition-all pointer-events-none"
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-12">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-white/10 hover:bg-white/5 disabled:opacity-30"
                  >
                    ←
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page
                          ? 'bg-lunes-purple text-white shadow-lg shadow-lunes-purple/20'
                          : 'bg-white/5 text-neutral-500 hover:bg-white/10 border border-white/10'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-white/10 hover:bg-white/5 disabled:opacity-30"
                  >
                    →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results info */}
        <p className="text-center text-sm text-neutral-600 pb-20">
          Mostrando {paginatedData.length} de {filteredData.length} projetos
        </p>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-b from-black/20 to-lunes-dark relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-lunes-purple/5 opacity-50"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Quer aparecer no ranking?</h2>
              <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
                Cadastre seu projeto e deposite garantias para ganhar visibilidade e confiança da comunidade Lunes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-lunes-dark hover:bg-neutral-200 h-14 px-8 text-lg font-bold"
                  onClick={() => navigate('/cadastrar-projeto')}
                >
                  Cadastrar Projeto
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 h-14 px-8 text-lg"
                  onClick={() => navigate('/score')}
                >
                  Simular Score
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}

export { Ranking }
export default Ranking
