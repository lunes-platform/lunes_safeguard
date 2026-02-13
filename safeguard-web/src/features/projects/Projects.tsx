import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Badge, Input, OptimizedImage } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Project } from '../../types'
import { Search, Filter, SlidersHorizontal, ArrowUpRight, Calendar, Shield, Zap } from 'lucide-react'

const Projects: React.FC = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scoreFilter, setScoreFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'score' | 'guarantee' | 'name'>('score')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9) // 3x3 grid

  // Mock data - in real app this would come from API
  const projects: Project[] = useMemo(() => [
    {
      id: 1,
      name: 'Lunes DeFi Protocol',
      description: 'Protocolo DeFi completo com staking, lending e DEX',
      category: 'DeFi',
      score: 95,
      guaranteeValue: 2500000,
      status: 'active',
      createdAt: new Date('2023-01-15'),
      nextVoting: new Date('2028-01-15'),
      contractAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      vaultComposition: {
        lunes: 2000000,
        psp22Tokens: [{ tokenId: 'LUSDT', amount: 400000 }],
        nfts: [{ collectionId: 'LunesNFT', count: 10, totalValue: 100000 }]
      }
    },
    {
      id: 2,
      name: 'Lunes NFT Marketplace',
      description: 'Marketplace descentralizado para NFTs do ecossistema Lunes',
      category: 'NFT',
      score: 88,
      guaranteeValue: 1800000,
      status: 'active',
      createdAt: new Date('2023-03-20'),
      nextVoting: new Date('2028-03-20'),
      contractAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      vaultComposition: {
        lunes: 1500000,
        psp22Tokens: [{ tokenId: 'LUSDT', amount: 250000 }],
        nfts: [{ collectionId: 'ArtNFT', count: 5, totalValue: 50000 }]
      }
    },
    {
      id: 3,
      name: 'Lunes Gaming Platform',
      description: 'Plataforma de jogos Web3 com economia tokenizada',
      category: 'Gaming',
      score: 82,
      guaranteeValue: 1200000,
      status: 'active',
      createdAt: new Date('2023-06-10'),
      nextVoting: new Date('2028-06-10'),
      contractAddress: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
      vaultComposition: {
        lunes: 1000000,
        psp22Tokens: [{ tokenId: 'LUSDT', amount: 150000 }, { tokenId: 'GAME', amount: 50000 }],
        nfts: []
      }
    },
    {
      id: 4,
      name: 'Lunes Identity Protocol',
      description: 'Sistema de identidade descentralizada para Web3',
      category: 'Identity',
      score: 76,
      guaranteeValue: 900000,
      status: 'active',
      createdAt: new Date('2023-09-05'),
      nextVoting: new Date('2028-09-05'),
      contractAddress: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
      vaultComposition: {
        lunes: 800000,
        psp22Tokens: [{ tokenId: 'LUSDT', amount: 100000 }],
        nfts: []
      }
    },
    {
      id: 5,
      name: 'Lunes Oracle Network',
      description: 'Rede de oráculos para dados externos confiáveis',
      category: 'Infrastructure',
      score: 71,
      guaranteeValue: 650000,
      status: 'active',
      createdAt: new Date('2023-11-12'),
      nextVoting: new Date('2028-11-12'),
      contractAddress: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
      vaultComposition: {
        lunes: 600000,
        psp22Tokens: [{ tokenId: 'LUSDT', amount: 50000 }],
        nfts: []
      }
    },
    {
      id: 6,
      name: 'New Lunes Project',
      description: 'Projeto recente em fase inicial de desenvolvimento',
      category: 'Other',
      score: 45,
      guaranteeValue: 200000,
      status: 'active',
      createdAt: new Date('2024-01-20'),
      nextVoting: new Date('2029-01-20'),
      contractAddress: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
      vaultComposition: {
        lunes: 180000,
        psp22Tokens: [{ tokenId: 'LUSDT', amount: 20000 }],
        nfts: []
      }
    }
  ], [])

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.contractAddress.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter

      const matchesScore = scoreFilter === 'all' ||
        (scoreFilter === 'high' && project.score >= 90) ||
        (scoreFilter === 'good' && project.score >= 80 && project.score < 90) ||
        (scoreFilter === 'fair' && project.score >= 70 && project.score < 80) ||
        (scoreFilter === 'low' && project.score < 70)

      return matchesSearch && matchesStatus && matchesScore
    })

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score
        case 'guarantee':
          return b.guaranteeValue - a.guaranteeValue
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [projects, searchTerm, statusFilter, scoreFilter, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, scoreFilter, sortBy])

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 80) return 'default'
    if (score >= 70) return 'warning'
    return 'destructive'
  }


  return (
    <>
      <Helmet>
        <title>{t('projects.meta.title')}</title>
        <meta name="description" content={t('projects.meta.description')} />
        <link rel="canonical" href="https://safeguard.lunes.io/projetos" />
      </Helmet>

      <div className="min-h-screen bg-lunes-dark text-white">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lunes-purple/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                  {t('projects.hero.title')}
                </span>
              </h1>
              <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t('projects.hero.subtitle')}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lunes-purple/20">
                    <Zap className="w-4 h-4 text-lunes-purple" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs text-neutral-400">Projetos</span>
                    <span className="block text-sm font-bold text-white leading-none">{filteredProjects.length} Encontrados</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-sm">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20">
                    <Shield className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs text-neutral-400">Total em Garantia</span>
                    <span className="block text-sm font-bold text-white leading-none">
                      {formatCurrency(filteredProjects.reduce((sum, p) => sum + p.guaranteeValue, 0), 'LUSDT')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="sticky top-20 z-30 bg-lunes-dark/80 backdrop-blur-xl border-y border-white/5 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative w-full lg:max-w-md group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-500 group-focus-within:text-lunes-purple transition-colors" />
                </div>
                <Input
                  placeholder={t('projects.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:border-lunes-purple focus:ring-1 focus:ring-lunes-purple rounded-xl h-12 transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-grow lg:flex-grow-0">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full lg:w-40 pl-9 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-300 focus:outline-none focus:border-lunes-purple hover:bg-white/10 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-neutral-800">{t('projects.filters.status.all')}</option>
                    <option value="active" className="bg-neutral-800">{t('projects.filters.status.active')}</option>
                    <option value="voting" className="bg-neutral-800">{t('projects.filters.status.voting')}</option>
                    <option value="completed" className="bg-neutral-800">{t('projects.filters.status.completed')}</option>
                  </select>
                </div>

                <div className="relative flex-grow lg:flex-grow-0">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="w-full lg:w-40 pl-9 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-300 focus:outline-none focus:border-lunes-purple hover:bg-white/10 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all" className="bg-neutral-800">{t('projects.filters.score.all')}</option>
                    <option value="high" className="bg-neutral-800">{t('projects.filters.score.high')}</option>
                    <option value="good" className="bg-neutral-800">{t('projects.filters.score.good')}</option>
                    <option value="fair" className="bg-neutral-800">{t('projects.filters.score.fair')}</option>
                    <option value="low" className="bg-neutral-800">{t('projects.filters.score.low')}</option>
                  </select>
                </div>

                <div className="relative flex-grow lg:flex-grow-0">
                  <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'score' | 'guarantee' | 'name')}
                    className="w-full lg:w-40 pl-9 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-neutral-300 focus:outline-none focus:border-lunes-purple hover:bg-white/10 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="score" className="bg-neutral-800">{t('projects.sort.score')}</option>
                    <option value="guarantee" className="bg-neutral-800">{t('projects.sort.guarantee')}</option>
                    <option value="name" className="bg-neutral-800">{t('projects.sort.name')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 min-h-[50vh]">
          <div className="container mx-auto px-4">
            {filteredProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm max-w-2xl mx-auto"
              >
                <div className="text-6xl mb-6 opacity-50">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {t('projects.empty.title')}
                </h3>
                <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                  {t('projects.empty.description')}
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setScoreFilter('all')
                  }}
                  className="bg-lunes-purple hover:bg-lunes-purple-dark text-white rounded-full px-8"
                >
                  {t('projects.empty.clearFilters')}
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence>
                    {paginatedProjects.map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-lunes-purple/40 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lunes-purple/10 flex flex-col">
                          {/* Card Image */}
                          <div className="relative h-48 overflow-hidden">
                            <OptimizedImage
                              src={`/images/projects/project${(project.id <= 3 ? project.id : (project.id % 3) + 1)}.svg`}
                              alt={project.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-lunes-dark/90 to-transparent" />

                            <div className="absolute top-4 right-4 flex gap-2">
                              <Badge variant="outline" className="bg-lunes-dark/60 backdrop-blur-md text-white border-white/20">
                                {project.category}
                              </Badge>
                              <Badge variant={getScoreBadgeVariant(project.score)} className="backdrop-blur-md shadow-lg">
                                {project.score}
                              </Badge>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-xl font-bold text-white mb-1 leading-tight">{project.name}</h3>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-6 flex-grow flex flex-col justify-between">
                            <div>
                              <p className="text-neutral-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                {project.description}
                              </p>

                              <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                                    <Shield className="w-3 h-3" />
                                    {t('projects.card.guarantee')}
                                  </div>
                                  <div className="font-bold text-lunes-purple-light text-sm truncate">
                                    {formatCurrency(project.guaranteeValue, 'LUSDT')}
                                  </div>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                                    <Calendar className="w-3 h-3" />
                                    {t('projects.card.created')}
                                  </div>
                                  <div className="font-medium text-neutral-300 text-sm">
                                    {formatDate(project.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-neutral-500'}`} />
                                <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                                  {t(`status.${project.status}`)}
                                </span>
                              </div>

                              <Link
                                to={`/projeto/${project.id}`}
                                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white hover:text-lunes-purple transition-colors group/link"
                              >
                                {t('projects.card.viewDetails')}
                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-16 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 p-0 rounded-full border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      ←
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 p-0 rounded-full font-medium transition-all ${currentPage === page
                          ? 'bg-lunes-purple hover:bg-lunes-purple-dark text-white border-none shadow-lg shadow-lunes-purple/20'
                          : 'border-white/10 text-white hover:bg-white/10'
                          }`}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 p-0 rounded-full border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export { Projects }
