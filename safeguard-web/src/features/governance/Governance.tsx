import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { SEOHead, StructuredData } from '../../components/seo'
import { useMotion } from '../../components/animation/useMotion'
import { Vote, Clock, Users, CheckCircle, XCircle, AlertTriangle, Calendar, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Modal } from '../../components/ui'
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters'
import { contractService } from '../../services/contractService'

interface Proposal {
  id: number
  title: string
  description: string
  type: 'project_approval' | 'parameter_change' | 'emergency_pause'
  status: 'active' | 'passed' | 'rejected' | 'expired'
  projectId?: number
  projectName?: string
  voteEndTime: string
  quorumRequired: number
  votesYes: number
  votesNo: number
  totalVotes: number
  totalEligibleVoters: number
  proposer: string
  createdAt: string
}

const mockProposals: Proposal[] = [
  {
    id: 1,
    title: 'Aprovação do Projeto Lunes DeFi Protocol',
    description: 'Votação para aprovação do projeto Lunes DeFi Protocol com garantias de 2.5M LUNES depositadas.',
    type: 'project_approval',
    status: 'active',
    projectId: 1,
    projectName: 'Lunes DeFi Protocol',
    voteEndTime: '2024-02-15T23:59:59Z',
    quorumRequired: 75,
    votesYes: 1250000,
    votesNo: 180000,
    totalVotes: 1430000,
    totalEligibleVoters: 2000000,
    proposer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    createdAt: '2024-02-08T10:00:00Z'
  },
  {
    id: 2,
    title: 'Ajuste de Parâmetros de Quórum',
    description: 'Proposta para reduzir o quórum mínimo de 75% para 70% em votações de aprovação de projetos.',
    type: 'parameter_change',
    status: 'passed',
    voteEndTime: '2024-01-30T23:59:59Z',
    quorumRequired: 75,
    votesYes: 1800000,
    votesNo: 200000,
    totalVotes: 2000000,
    totalEligibleVoters: 2500000,
    proposer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    createdAt: '2024-01-23T14:30:00Z'
  },
  {
    id: 3,
    title: 'Pausa de Emergência - Lunes Gaming Platform',
    description: 'Votação de emergência para pausar o projeto Lunes Gaming Platform devido a vulnerabilidade crítica identificada.',
    type: 'emergency_pause',
    status: 'rejected',
    projectId: 3,
    projectName: 'Lunes Gaming Platform',
    voteEndTime: '2024-01-20T23:59:59Z',
    quorumRequired: 60,
    votesYes: 800000,
    votesNo: 1400000,
    totalVotes: 2200000,
    totalEligibleVoters: 2500000,
    proposer: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    createdAt: '2024-01-18T09:15:00Z'
  }
]

const Governance = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const motion = useMotion(true)

  const MotionDiv = motion.div
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [voteChoice, setVoteChoice] = useState<'yes' | 'no' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Connect to contract on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        await contractService.connect()
      } catch (error) {
        console.error('Failed to connect to contract:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleVoteClick = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setVoteChoice(null)
    setIsVoteModalOpen(true)
  }

  const handleVoteSubmit = async () => {
    if (!selectedProposal || !voteChoice) return

    setIsVoting(true)
    try {
      await contractService.vote(selectedProposal.projectId || selectedProposal.id, voteChoice === 'yes')

      // Update local state (in real app, refetch from contract)
      const updatedProposal = mockProposals.find(p => p.id === selectedProposal.id)
      if (updatedProposal) {
        if (voteChoice === 'yes') {
          updatedProposal.votesYes += 100000
        } else {
          updatedProposal.votesNo += 100000
        }
        updatedProposal.totalVotes += 100000
      }

      setIsVoteModalOpen(false)
      setSelectedProposal(null)
      setVoteChoice(null)
    } catch (error) {
      console.error('Vote failed:', error)
      alert('Falha ao registrar voto. Por favor, tente novamente.')
    } finally {
      setIsVoting(false)
    }
  }

  const filteredProposals = mockProposals.filter(proposal => {
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter
    const matchesType = typeFilter === 'all' || proposal.type === typeFilter
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proposal.projectName && proposal.projectName.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesStatus && matchesType && matchesSearch
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'passed': return 'success'
      case 'rejected': return 'destructive'
      case 'expired': return 'secondary'
      default: return 'outline'
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'project_approval': return 'default'
      case 'parameter_change': return 'warning'
      case 'emergency_pause': return 'destructive'
      default: return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project_approval': return <CheckCircle className="w-4 h-4" />
      case 'parameter_change': return <AlertTriangle className="w-4 h-4" />
      case 'emergency_pause': return <XCircle className="w-4 h-4" />
      default: return <Vote className="w-4 h-4" />
    }
  }

  const calculateParticipation = (proposal: Proposal) => {
    return (proposal.totalVotes / proposal.totalEligibleVoters) * 100
  }

  const calculateApprovalRate = (proposal: Proposal) => {
    return proposal.totalVotes > 0 ? (proposal.votesYes / proposal.totalVotes) * 100 : 0
  }

  const isQuorumMet = (proposal: Proposal) => {
    const participation = calculateParticipation(proposal)
    const approvalRate = calculateApprovalRate(proposal)
    return participation >= 50 && approvalRate >= proposal.quorumRequired
  }

  return (
    <>
      <SEOHead
        title={t('governance.meta.title')}
        description={t('governance.meta.description')}
        keywords={['Governance', 'Voting', 'DAO', 'Proposals', 'Decentralized']}
        type="website"
      />

      <StructuredData
        type="governance"
        data={{
          governance: {
            name: 'SafeGard Governance',
            description: t('governance.meta.description'),
            url: 'https://safeguard.lunes.io/governanca',
            activeProposals: mockProposals.filter(p => p.status === 'active').length
          }
        }}
      />

      <main className="min-h-screen bg-lunes-dark">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-lunes-purple-dark/20 to-lunes-dark border-b border-white/5 text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lunes-purple/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-lunes-purple-dark/10 rounded-full blur-3xl -z-10"></div>
          <div className="container mx-auto px-4">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <header className="flex items-center justify-center gap-3 mb-6">
                <Vote className="w-12 h-12 text-white" aria-hidden="true" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {t('governance.hero.title')}
                </h1>
              </header>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {t('governance.hero.subtitle')}
              </p>
              <section className="flex flex-wrap justify-center gap-4" aria-label="Estatísticas de governança">
                <article className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4 min-w-[120px]">
                  <div className="text-3xl font-bold text-white" aria-label={`${mockProposals.filter(p => p.status === 'active').length} votações ativas`}>
                    {mockProposals.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-sm text-white/80 font-medium">{t('governance.stats.activeVotes')}</div>
                </article>
                <article className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4 min-w-[120px]">
                  <div className="text-3xl font-bold text-white" aria-label="75% de quórum necessário">
                    75%
                  </div>
                  <div className="text-sm text-white/80 font-medium">{t('governance.stats.quorumRequired')}</div>
                </article>
                <article className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-4 min-w-[120px]">
                  <div className="text-3xl font-bold text-white" aria-label="7 dias de período de votação">
                    7
                  </div>
                  <div className="text-sm text-white/80 font-medium">{t('governance.stats.votingPeriod')}</div>
                </article>
              </section>
            </MotionDiv>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-b border-white/5">
          <div className="container mx-auto px-4">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col lg:flex-row gap-4 items-center justify-between"
            >
              <div className="flex-1 max-w-md relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  placeholder={t('governance.filters.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple focus:ring-2 focus:ring-lunes-purple/20 shadow-sm"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-lunes-purple/20 focus:border-lunes-purple bg-white/5 text-neutral-300 shadow-sm"
                >
                  <option value="all">{t('governance.filters.allStatus')}</option>
                  <option value="active">{t('governance.filters.active')}</option>
                  <option value="passed">{t('governance.filters.passed')}</option>
                  <option value="rejected">{t('governance.filters.rejected')}</option>
                  <option value="expired">{t('governance.filters.expired')}</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 border border-white/10 rounded-lg focus:ring-2 focus:ring-lunes-purple/20 focus:border-lunes-purple bg-white/5 text-neutral-300 shadow-sm"
                >
                  <option value="all">{t('governance.filters.allTypes')}</option>
                  <option value="project_approval">{t('governance.filters.projectApproval')}</option>
                  <option value="parameter_change">{t('governance.filters.parameterChange')}</option>
                  <option value="emergency_pause">{t('governance.filters.emergencyPause')}</option>
                </select>
              </div>
            </MotionDiv>
          </div>
        </section>

        {/* Proposals List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {filteredProposals.length === 0 ? (
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <Vote className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-neutral-400 mb-2">
                  {t('governance.noProposals.title')}
                </h3>
                <p className="text-neutral-500 mb-6">
                  {t('governance.empty.description')}
                </p>
                <Button onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                }}>
                  {t('governance.empty.clearFilters')}
                </Button>
              </MotionDiv>
            ) : (
              <section className="space-y-6" aria-label="Lista de propostas">
                {filteredProposals.map((proposal, index) => (
                  <MotionDiv
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <Card className="overflow-hidden bg-white/5 border-white/10 backdrop-blur-sm" role="article" aria-labelledby={`proposal-title-${proposal.id}`}>
                      <CardHeader>
                        <header className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(proposal.type)}
                            <div>
                              <CardTitle id={`proposal-title-${proposal.id}`} className="text-xl mb-2 text-white">{proposal.title}</CardTitle>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant={getStatusBadgeVariant(proposal.status)}>
                                  {t(`governance.status.${proposal.status}`)}
                                </Badge>
                                <Badge variant={getTypeBadgeVariant(proposal.type)}>
                                  {t(`governance.type.${proposal.type}`)}
                                </Badge>
                                {proposal.status === 'active' && (
                                  <Badge variant={isQuorumMet(proposal) ? 'success' : 'warning'}>
                                    {isQuorumMet(proposal) ? t('governance.quorum.met') : t('governance.quorum.pending')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {proposal.status === 'active' && (
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                              <Clock className="w-4 h-4" />
                              <span>{t('governance.endsAt')}: {formatDate(new Date(proposal.voteEndTime))}</span>
                            </div>
                          )}
                        </header>

                        <CardDescription className="text-base mb-6 text-neutral-300">
                          {proposal.description}
                        </CardDescription>

                        {/* Voting Stats */}
                        <section className="mb-6" aria-label="Estatísticas de votação">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Yes votes */}
                            <article className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <span className="font-medium text-green-400">{t('governance.votes.yes')}</span>
                              </div>
                              <div className="text-2xl font-bold text-green-400">
                                {formatCurrency(proposal.votesYes, 'LUNES')}
                              </div>
                              <div className="text-sm text-green-300/80 font-medium">
                                {formatPercentage(calculateApprovalRate(proposal))}
                              </div>
                            </article>

                            {/* No votes */}
                            <article className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="font-medium text-red-400">{t('governance.votes.no')}</span>
                              </div>
                              <div className="text-2xl font-bold text-red-400">
                                {formatCurrency(proposal.votesNo, 'LUNES')}
                              </div>
                              <div className="text-sm text-red-300/80 font-medium">
                                {formatPercentage(100 - calculateApprovalRate(proposal))}
                              </div>
                            </article>

                            {/* Participation */}
                            <article className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                <span className="font-medium text-blue-400">{t('governance.participation')}</span>
                              </div>
                              <div className="text-2xl font-bold text-blue-400">
                                {formatPercentage(proposal.totalVotes / proposal.totalEligibleVoters)}
                              </div>
                              <div className="text-sm text-blue-300/80 font-medium">
                                {formatCurrency(proposal.totalVotes, 'LUNES')} / {formatCurrency(proposal.totalEligibleVoters, 'LUNES')}
                              </div>
                            </article>
                          </div>
                        </section>

                        {/* Progress Bar */}
                        <section className="mb-4" aria-label="Progresso da aprovação">
                          <div className="flex justify-between text-sm text-neutral-400 mb-2">
                            <span>{t('governance.approvalProgress')}</span>
                            <span>{proposal.quorumRequired}% {t('governance.required')}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${calculateApprovalRate(proposal) >= proposal.quorumRequired
                                ? 'bg-success-500'
                                : 'bg-warning-500'
                                }`}
                              style={{ width: `${Math.min(calculateApprovalRate(proposal), 100)}%` }}
                            />
                          </div>
                        </section>
                      </CardHeader>

                      <CardContent>
                        <footer className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{t('governance.created')}: {formatDate(new Date(proposal.createdAt))}</span>
                            </div>
                            {proposal.projectName && (
                              <div>
                                <span>{t('governance.project')}: </span>
                                <span className="font-medium text-neutral-300">{proposal.projectName}</span>
                              </div>
                            )}
                          </div>

                          {proposal.status === 'active' && (
                            <div className="flex gap-3">
                              {proposal.projectId && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    console.log('Navigating to project:', proposal.projectId);
                                    navigate(`/projeto/${proposal.projectId}`);
                                  }}
                                  className="border-lunes-purple text-lunes-purple hover:bg-lunes-purple/10 hover:text-white"
                                >
                                  Ver Projeto
                                </Button>
                              )}
                              <Button
                                onClick={() => handleVoteClick(proposal)}
                                className="bg-lunes-purple hover:bg-purple-700"
                              >
                                {t('governance.vote')}
                              </Button>
                            </div>
                          )}
                        </footer>
                      </CardContent>
                    </Card>
                  </MotionDiv>
                ))}
              </section>
            )}
          </div>
        </section>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-lunes-dark border border-white/10 rounded-lg p-8 text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin text-lunes-purple mx-auto mb-4" />
              <p>Conectando ao contrato...</p>
            </div>
          </div>
        )}

        {/* Vote Modal */}
        <Modal
          isOpen={isVoteModalOpen}
          onClose={() => setIsVoteModalOpen(false)}
          title={`Votar: ${selectedProposal?.title || ''}`}
          size="md"
          variant="glass"
        >
          <div className="space-y-6 p-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-2">
              <p className="text-neutral-300 text-sm leading-relaxed italic">
                {selectedProposal?.description}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-3xl"
            >
              <h4 className="font-bold text-white mb-6 text-center text-lg">Selecione sua decisão:</h4>
              <div className="grid grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVoteChoice('yes')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[160px] relative overflow-hidden group ${voteChoice === 'yes'
                    ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                    : 'border-white/10 bg-white/5 hover:border-green-500/40 hover:bg-green-500/10'
                    }`}
                >
                  {voteChoice === 'yes' && (
                    <motion.div
                      layoutId="voteGlow"
                      className="absolute inset-0 bg-green-500/10 blur-xl transition-all"
                    />
                  )}
                  <ThumbsUp className={`w-12 h-12 transition-colors duration-300 ${voteChoice === 'yes' ? 'text-green-400' : 'text-neutral-500 group-hover:text-green-500/70'}`} />
                  <span className={`font-bold text-xl tracking-tight transition-colors duration-300 ${voteChoice === 'yes' ? 'text-green-400' : 'text-neutral-400 group-hover:text-green-400'}`}>
                    A Favor
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVoteChoice('no')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[160px] relative overflow-hidden group ${voteChoice === 'no'
                    ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20'
                    : 'border-white/10 bg-white/5 hover:border-red-500/40 hover:bg-red-500/10'
                    }`}
                >
                  {voteChoice === 'no' && (
                    <motion.div
                      layoutId="voteGlow"
                      className="absolute inset-0 bg-red-500/10 blur-xl transition-all"
                    />
                  )}
                  <ThumbsDown className={`w-12 h-12 transition-colors duration-300 ${voteChoice === 'no' ? 'text-red-400' : 'text-neutral-500 group-hover:text-red-500/70'}`} />
                  <span className={`font-bold text-xl tracking-tight transition-colors duration-300 ${voteChoice === 'no' ? 'text-red-400' : 'text-neutral-400 group-hover:text-red-400'}`}>
                    Contra
                  </span>
                </motion.button>
              </div>
            </motion.div>

            <div className="bg-lunes-purple/5 border border-lunes-purple/20 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lunes-purple/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-lunes-purple/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-lunes-purple" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white mb-1 uppercase tracking-wider text-xs">Protocolo de Confirmação</p>
                  <p className="text-neutral-400 leading-relaxed font-medium">
                    Seu voto será registrado permanentemente na blockchain Lunes. Esta ação é irreversível e requer confirmação de integridade.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsVoteModalOpen(false)}
                disabled={isVoting}
                className="px-6 py-2.5 border-white/10 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVoteSubmit}
                disabled={!voteChoice || isVoting}
                className={`px-6 py-2.5 ${voteChoice === 'yes'
                  ? 'bg-green-600 hover:bg-green-700'
                  : voteChoice === 'no'
                    ? 'bg-red-600 hover:bg-red-700'
                    : ''
                  }`}
              >
                {isVoting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Confirmar Voto'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </>
  )
}

export { Governance }
