import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, TrendingUp, Users, Calendar, AlertTriangle, Info, Loader2, ArrowUpRight, ExternalLink } from 'lucide-react'
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { StarRating } from "../../components/ui"
import { formatCurrency, formatDate } from '../../utils/formatters'
import type { Project } from '../../types'

import { contractService } from '../../services/contractService'
import { DonutChart } from '../../components/charts/DonutChart'

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError('ID do projeto não fornecido')
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const projectId = parseInt(id)

        // Ensure contract is connected
        if (!contractService.isContractConnected()) {
          await contractService.connect();
        }

        const info = await contractService.getProjectInfo(projectId)
        const vault = await contractService.getProjectVault(projectId)

        if (info && vault) {
          // Map to Project type
          const mappedProject: Project = {
            id: info.id,
            name: info.name,
            description: info.metadataUri ? `Carregando descrição de ${info.metadataUri}...` : 'Descrição não disponível no contrato.',
            category: 'Blockchain', // Could be extracted from metadata
            owner: info.owner,
            status: info.status === 'active' ? 'active' : 'voting_open',
            score: info.score || 50,
            guaranteeValue: Number(vault.totalLunes / BigInt(10 ** 8)), // Using 8 decimals for visual simplicity
            createdAt: new Date(info.creationTimestamp),
            nextVoting: new Date(info.creationTimestamp + 365 * 24 * 60 * 60 * 1000), // Approx 1 year
            contractAddress: info.owner, // Usually owner address in this context
            vaultComposition: {
              lunes: Number(vault.totalLunes / BigInt(10 ** 8)),
              psp22Tokens: vault.totalLusdt > 0 ? [{ tokenId: 'LUSDT', amount: Number(vault.totalLusdt / BigInt(10 ** 12)) }] : [],
              nfts: []
            },
            isAudited: info.score > 80,
            isKYC: true
          }

          setProject(mappedProject)
          setError(null)
        } else {
          setError('Projeto não encontrado ou erro na blockchain')
        }
      } catch (err) {
        console.error('Error fetching project:', err)
        setError('Erro ao conectar com a rede Lunes')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-lunes-dark flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Loader2 className="w-12 h-12 text-lunes-purple mx-auto" />
          </motion.div>
          <p className="text-neutral-400 font-medium tracking-widest text-sm uppercase">Carregando detalhes do projeto...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-lunes-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-10 max-w-md text-center bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Projeto não encontrado</h2>
            <p className="text-neutral-400 mb-8 leading-relaxed">{error || 'O projeto solicitado não existe ou foi removido de nossa base de dados.'}</p>
            <Button
              size="lg"
              className="w-full bg-lunes-purple hover:bg-lunes-purple-dark text-white font-bold h-14"
              onClick={() => navigate('/ranking')}
            >
              Voltar ao Ranking
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-lunes-purple'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (score >= 80) return 'bg-lunes-purple/10 text-lunes-purple border-lunes-purple/20'
    if (score >= 70) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    return 'bg-red-500/10 text-red-500 border-red-500/20'
  }

  return (
    <>
      <Helmet>
        <title>{project.name} | SafeGard Details</title>
        <meta name="description" content={project.description} />
      </Helmet>

      <div className="min-h-screen bg-lunes-dark pb-20 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lunes-purple/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-lunes-light/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02]"></div>
        </div>

        <div className="container mx-auto px-4 pt-12 relative z-10">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-10"
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-neutral-400 hover:text-white hover:bg-white/5 gap-2 px-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          </motion.div>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lunes-purple via-lunes-light to-lunes-purple opacity-50"></div>

                <header className="relative z-10">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <Badge className="bg-lunes-purple/20 text-lunes-purple border-lunes-purple/30 px-4 py-1.5 text-xs font-bold tracking-widest uppercase">
                      {project.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-500/5 px-4 py-1.5 rounded-full border border-green-500/10">
                      <Shield className="w-4 h-4" />
                      <span>{project.status === 'active' ? 'Status: Ativo' : 'Status: Em Votação'}</span>
                    </div>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    {project.name}
                  </h1>
                  <p className="text-xl text-neutral-400 max-w-3xl leading-relaxed mb-10">
                    {project.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-2">Garantia Total</span>
                      <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                        {formatCurrency(project.guaranteeValue, 'LUNES')}
                        <span className="text-sm text-neutral-500 font-normal">Equiv.</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-2">Data de Criação</span>
                      <div className="text-xl font-medium text-neutral-300">
                        {formatDate(project.createdAt)}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-2">Auditoria</span>
                      <div className={`text-xl font-medium ${project.isAudited ? 'text-green-400' : 'text-neutral-500'}`}>
                        {project.isAudited ? 'Certificada' : 'Em Processo'}
                      </div>
                    </div>
                  </div>
                </header>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="h-full bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border-white/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-lunes-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className={`text-7xl font-black mb-4 ${getScoreColor(project.score)} transition-transform group-hover:scale-110 duration-500`}>
                  {project.score}
                </div>
                <div className={`px-4 py-1.5 rounded-lg border text-xs font-black uppercase tracking-tighter mb-6 ${getScoreBadgeColor(project.score)}`}>
                  Score de Garantia
                </div>
                <StarRating score={project.score} maxScore={100} size="lg" />
                <p className="mt-8 text-sm text-neutral-500 leading-relaxed font-medium">
                  Classificação baseada em segurança, liquidez e estabilidade do projeto.
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Detailed Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Vault & Charts */}
            <div className="lg:col-span-8 space-y-8">
              {/* Vault Composition */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 relative overflow-hidden">
                  <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <TrendingUp className="text-lunes-purple" />
                    Composição do Cofre
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                      {/* LUNES Row */}
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-lunes-purple/30 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-lunes-purple rounded-xl flex items-center justify-center shadow-lg shadow-lunes-purple/20">
                              <span className="text-white font-black">L</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg tracking-tight">LUNES</h3>
                              <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Token Nativo</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">
                              {formatCurrency(project.vaultComposition.lunes, 'LUNES')}
                            </div>
                            <div className="text-xs font-black text-lunes-purple">
                              {Math.round((project.vaultComposition.lunes / project.guaranteeValue) * 100)}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(project.vaultComposition.lunes / project.guaranteeValue) * 100}%` }}
                            className="h-full bg-lunes-purple"
                          />
                        </div>
                      </div>

                      {/* PSP22 Tokens */}
                      {project.vaultComposition.psp22Tokens.map((token) => (
                        <div key={token.tokenId} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/10">
                                <span className="text-white font-black">{token.tokenId[0]}</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-lg tracking-tight">{token.tokenId}</h3>
                                <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Token PSP22</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">
                                {formatCurrency(token.amount, token.tokenId)}
                              </div>
                              <div className="text-xs font-black text-neutral-400">
                                {Math.round((token.amount / project.guaranteeValue) * 100)}%
                              </div>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(token.amount / project.guaranteeValue) * 100}%` }}
                              className="h-full bg-neutral-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <DonutChart
                        data={[
                          { label: 'LUNES', value: project.vaultComposition.lunes, color: '#6C38FF' },
                          ...project.vaultComposition.psp22Tokens.map(t => ({
                            label: t.tokenId,
                            value: t.amount,
                            color: '#444444'
                          }))
                        ]}
                        size={250}
                        thickness={40}
                        showLegend={true}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Technical Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-8">Informações Técnicas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest block mb-3 pl-1">Endereço do Contrato</span>
                        <div className="flex items-center gap-3 bg-black/20 p-4 rounded-2xl border border-white/5 group">
                          <code className="text-sm font-mono text-neutral-300 flex-1 truncate">{project.contractAddress}</code>
                          <Button variant="ghost" size="sm" className="hover:bg-white/10 text-neutral-400">
                            <ExternalLink size={16} />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest block mb-3 pl-1">Próxima Votação de Governança</span>
                        <div className="flex items-center gap-4 text-white">
                          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
                            <Calendar className="text-yellow-500" size={24} />
                          </div>
                          <div>
                            <div className="text-xl font-bold">{formatDate(project.nextVoting)}</div>
                            <div className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Até às 23:59 GMT</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="text-lunes-purple" />
                        <h3 className="font-bold text-white tracking-tight">Equipe e KYC</h3>
                      </div>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                        O projeto passou por verificação de KYC completa dos membros fundadores e possui uma equipe pública ativa.
                      </p>
                      <div className="flex gap-2">
                        {project.isKYC ? (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-3 py-1">Identidade Verificada</Badge>
                        ) : (
                          <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/20 px-3 py-1">Não Verificado</Badge>
                        )}
                        <Badge className="bg-lunes-purple/10 text-lunes-purple border-lunes-purple/20 px-3 py-1">Lunes Hub Certified</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Sidebar Actions */}
            <div className="lg:col-span-4 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="sticky top-8"
              >
                <Card className="bg-white/5 border border-lunes-purple/30 backdrop-blur-3xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-lunes-purple/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                  <h3 className="text-2xl font-bold text-white mb-8 relative z-10">Opções de DApp</h3>

                  <div className="space-y-4 relative z-10">
                    <Button
                      className="w-full bg-lunes-purple hover:bg-lunes-purple-dark text-white font-black h-14 rounded-2xl shadow-xl shadow-lunes-purple/20 transition-all active:scale-[0.98]"
                      onClick={() => { }}
                    >
                      Reforçar Garantia
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-white/10 text-white hover:bg-white/10 h-14 rounded-2xl font-bold transition-all"
                      onClick={() => navigate('/governance')}
                    >
                      Acessar Votação
                    </Button>
                    <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                      <Button
                        variant="ghost"
                        className="w-full text-neutral-400 hover:text-white hover:bg-white/5 justify-between px-4 group"
                      >
                        <span className="flex items-center gap-3">
                          <ExternalLink className="group-hover:text-lunes-purple transition-colors" size={18} />
                          Documentação do Projeto
                        </span>
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 transition-all" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-neutral-400 hover:text-white hover:bg-white/5 justify-between px-4 group"
                      >
                        <span className="flex items-center gap-3">
                          <Info className="group-hover:text-lunes-light transition-colors" size={18} />
                          Whitepaper Técnico
                        </span>
                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 -translate-y-1 translate-x-1 transition-all" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Safety Card */}
                <Card className="mt-8 bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-3xl backdrop-blur-lg">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="text-yellow-500 font-bold mb-2 uppercase tracking-widest text-[10px]">Aviso de Risco</h4>
                      <p className="text-neutral-400 text-xs leading-relaxed font-medium">
                        O SafeGard avalia garantias, mas não garante a performance do projeto.
                        Investimentos em DeFi possuem riscos inerentes de volatilidade e smart contracts.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export { ProjectDetail }
