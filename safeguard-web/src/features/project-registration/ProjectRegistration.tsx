import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Info, Loader2, Image, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Textarea } from '../../components/ui'
import { SEOHead } from '../../components/seo'
import { DepositGuaranteeModal } from './components/DepositGuaranteeModal'
import { contractService } from '../../services/contractService'
import { pinataService, type ProjectMetadata } from '../../services/pinataService'
import { useWeb3 } from '../../hooks/useWeb3'
import { useToast } from '../../hooks/useToast'
import type { ProjectRegistrationData } from './types'

// Schema de validação com Zod
const projectRegistrationSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(64, 'Nome deve ter no máximo 64 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Nome contém caracteres inválidos'),

  description: z.string()
    .min(50, 'Descrição deve ter pelo menos 50 caracteres')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),

  category: z.enum(['DeFi', 'NFT', 'Gaming', 'Infrastructure', 'Other'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida' })
  }),

  website: z.string()
    .url('URL do website inválida')
    .optional()
    .or(z.literal('')),

  github: z.string()
    .url('URL do GitHub inválida')
    .optional()
    .or(z.literal('')),

  twitter: z.string()
    .url('URL do Twitter inválida')
    .optional()
    .or(z.literal('')),

  telegram: z.string()
    .url('URL do Telegram inválida')
    .optional()
    .or(z.literal('')),

  tokenContract: z.string()
    .min(48, 'Endereço do contrato deve ter 48 caracteres')
    .max(48, 'Endereço do contrato deve ter 48 caracteres')
    .regex(/^5[A-Za-z0-9]+$/, 'Endereço do contrato inválido'),

  treasuryAddress: z.string()
    .min(48, 'Endereço do treasury deve ter 48 caracteres')
    .max(48, 'Endereço do treasury deve ter 48 caracteres')
    .regex(/^5[A-Za-z0-9]+$/, 'Endereço do treasury inválido'),

  teamSize: z.number()
    .min(1, 'Equipe deve ter pelo menos 1 membro')
    .max(50, 'Equipe deve ter no máximo 50 membros'),

  hasAudit: z.boolean(),
  hasKYC: z.boolean(),

  auditReport: z.string().optional(),
  kycProvider: z.string().optional(),

  agreedToTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve concordar com os termos e condições'
  })
})

type ProjectRegistrationFormData = z.infer<typeof projectRegistrationSchema>

const ProjectRegistration: React.FC = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [registrationData, setRegistrationData] = useState<ProjectRegistrationData | null>(null)
  const [registrationStep, setRegistrationStep] = useState<'form' | 'connecting' | 'uploading_metadata' | 'registering' | 'deposit'>('form')
  const [registrationError, setRegistrationError] = useState<string | null>(null)
  const [projectLogo, setProjectLogo] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null) // Will be used for upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.make('error', 'Imagem deve ter no máximo 2MB')
        return
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.make('error', 'Formato aceito: JPG, PNG ou WebP')
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setProjectLogo(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setProjectLogo(null)
    setLogoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Hook Web3 para conectar carteira
  const { wallet, connectWallet, isProcessing: isConnecting } = useWeb3()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<ProjectRegistrationFormData>({
    resolver: zodResolver(projectRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      hasAudit: false,
      hasKYC: false,
      agreedToTerms: false,
      teamSize: 1
    }
  })

  const watchedValues = watch()

  const onSubmit = async (data: ProjectRegistrationFormData) => {
    setIsSubmitting(true)
    setRegistrationError(null)

    try {
      // Step 1: Conectar carteira se não estiver conectada
      if (!wallet.isConnected) {
        setRegistrationStep('connecting')
        const connected = await connectWallet()
        if (!connected) {
          throw new Error('Falha ao conectar carteira. Por favor, tente novamente.')
        }
      }

      // Step 2: Upload de Metadados (Pinata/IPFS)
      setRegistrationStep('uploading_metadata')

      // Upload do Logo (se existir)
      let logoUri = ''
      if (logoFile) {
        try {
          logoUri = await pinataService.uploadFile(logoFile)
        } catch (err) {
          console.warn('Falha no upload do logo, prosseguindo sem ele:', err)
        }
      }

      // Montar JSON de metadados
      const metadata: ProjectMetadata = {
        name: data.name,
        description: data.description,
        category: data.category,
        logoUri: logoUri,
        website: data.website,
        socials: {
          twitter: data.twitter,
          github: data.github,
          telegram: data.telegram
        },
        documents: {
          audit: data.auditReport
        },
        team: {
          size: data.teamSize
        }
      }

      // Upload do JSON para IPFS
      const metadataUri = await pinataService.uploadMetadata(metadata)
      console.log('Metadados salvos no IPFS:', metadataUri)

      // Step 3: Conectar ao serviço do contrato
      setRegistrationStep('registering')
      await contractService.connect()

      // Step 4: Registrar projeto no contrato
      const result = await contractService.registerProject(
        data.name,
        metadataUri, // Passando URI do IPFS
        wallet.address || data.treasuryAddress, // owner address
        data.tokenContract // pairPsp22 (opcional)
      )

      console.log('Projeto registrado com sucesso:', result)

      // Step 5: Preparar dados para depósito
      const projectData: ProjectRegistrationData = {
        ...data,
        id: result.projectId, // ID gerado pelo contrato
        status: 'pending_deposit',
        createdAt: new Date(),
        estimatedScore: calculateEstimatedScore(data),
        contractTxHash: result.txHash
      }

      setRegistrationData(projectData)
      setRegistrationStep('deposit')
      setShowDepositModal(true)

    } catch (error) {
      console.error('Erro ao processar cadastro:', error)
      setRegistrationError(error instanceof Error ? error.message : 'Erro ao registrar projeto')
      setRegistrationStep('form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateEstimatedScore = (data: ProjectRegistrationFormData): number => {
    let score = 50 // Base score

    // Audit bonus
    if (data.hasAudit) score += 20

    // KYC bonus
    if (data.hasKYC) score += 15

    // Social presence bonus
    const socialLinks = [data.website, data.github, data.twitter, data.telegram]
      .filter(link => link && link.length > 0).length
    score += socialLinks * 2

    // Team size bonus
    if (data.teamSize >= 5) score += 5
    if (data.teamSize >= 10) score += 5

    return Math.min(score, 100)
  }

  const handleDepositSuccess = () => {
    setShowDepositModal(false)
    // TODO: Redirecionar para dashboard do projeto ou página de sucesso
    navigate('/projetos')
  }

  return (
    <>
      <SEOHead
        title="Cadastrar Projeto - Lunes SafeGuard"
        description="Registre seu projeto no protocolo Lunes SafeGuard e obtenha garantias descentralizadas para seus investidores."
        keywords={["cadastro projeto", "DeFi", "garantias", "blockchain", "SafeGuard"]}
      />

      <div className="min-h-screen bg-lunes-dark py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              to="/projetos"
              className="inline-flex items-center text-lunes-purple hover:text-purple-400 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">Voltar para Projetos</span>
            </Link>

            <h1 className="text-4xl font-bold text-white mb-2">
              Cadastrar Novo Projeto
            </h1>
            <p className="text-lg text-neutral-400">
              Registre seu projeto no protocolo Lunes SafeGuard e ofereça garantias aos seus investidores
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-lunes-purple text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg shadow-purple-900/20">
                  1
                </div>
                <span className="ml-3 text-sm font-medium text-white">Informações do Projeto</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/10 text-neutral-500 rounded-full flex items-center justify-center text-sm font-semibold border border-white/5">
                  2
                </div>
                <span className="ml-3 text-sm font-medium text-neutral-500">Depósito de Garantia</span>
              </div>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div className="bg-lunes-purple h-2 rounded-full w-1/2 shadow-[0_0_10px_rgba(108,56,255,0.5)]"></div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Info className="w-5 h-5 text-lunes-purple" />
                  Informações do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Nome do Projeto *
                      </label>
                      <Input
                        {...register('name')}
                        placeholder="Ex: Lunes DeFi Protocol"
                        className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Descrição *
                      </label>
                      <Textarea
                        {...register('description')}
                        placeholder="Descreva seu projeto, seus objetivos e como ele funciona..."
                        rows={4}
                        className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple resize-none"
                      />
                      {errors.description && (
                        <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                      )}
                      <p className="text-xs text-neutral-500 mt-1">
                        {watchedValues.description?.length || 0}/500 caracteres
                      </p>
                    </div>

                    {/* Logo Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Logo do Projeto
                      </label>
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          {projectLogo ? (
                            <div className="relative group">
                              <img src={projectLogo} alt="Logo preview" className="w-32 h-32 rounded-xl object-cover border-2 border-white/10" />
                              <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-lunes-purple hover:bg-white/5 transition-colors group">
                              <Image className="w-8 h-8 text-neutral-500 group-hover:text-lunes-purple transition-colors mb-2" />
                              <span className="text-xs text-neutral-500 group-hover:text-neutral-300 transition-colors">Adicionar Logo</span>
                            </div>
                          )}
                          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} className="hidden" />
                        </div>
                        <div className="flex-1 text-sm text-neutral-400">
                          <p className="font-medium text-neutral-300 mb-1">Recomendações:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>400x400px ou maior</li>
                            <li>JPG, PNG ou WebP</li>
                            <li>Máx 2MB</li>
                            <li>Fundo transparente recomendado</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Categoria *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-lunes-purple focus:border-transparent cursor-pointer [&>option]:bg-zinc-900"
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="DeFi">DeFi</option>
                        <option value="NFT">NFT</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Other">Outros</option>
                      </select>
                      {errors.category && (
                        <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Tamanho da Equipe *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        {...register('teamSize', { valueAsNumber: true })}
                        placeholder="5"
                        className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                      />
                      {errors.teamSize && (
                        <p className="text-red-400 text-sm mt-1">{errors.teamSize.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Links e Redes Sociais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Website
                        </label>
                        <Input
                          {...register('website')}
                          placeholder="https://meusite.com"
                          className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                        />
                        {errors.website && (
                          <p className="text-red-400 text-sm mt-1">{errors.website.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          GitHub
                        </label>
                        <Input
                          {...register('github')}
                          placeholder="https://github.com/meuusuario/projeto"
                          className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                        />
                        {errors.github && (
                          <p className="text-red-400 text-sm mt-1">{errors.github.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Twitter
                        </label>
                        <Input
                          {...register('twitter')}
                          placeholder="https://twitter.com/meuprojeto"
                          className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                        />
                        {errors.twitter && (
                          <p className="text-red-400 text-sm mt-1">{errors.twitter.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Telegram
                        </label>
                        <Input
                          {...register('telegram')}
                          placeholder="https://t.me/meuprojeto"
                          className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                        />
                        {errors.telegram && (
                          <p className="text-red-400 text-sm mt-1">{errors.telegram.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Technical Information */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Informações Técnicas</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Endereço do Contrato do Token *
                        </label>
                        <Input
                          {...register('tokenContract')}
                          placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                          className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                        />
                        {errors.tokenContract && (
                          <p className="text-red-400 text-sm mt-1">{errors.tokenContract.message}</p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">
                          Endereço do contrato do token do seu projeto na rede Polkadot
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                          Endereço do Treasury *
                        </label>
                        <Input
                          {...register('treasuryAddress')}
                          placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                          className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                        />
                        {errors.treasuryAddress && (
                          <p className="text-red-400 text-sm mt-1">{errors.treasuryAddress.message}</p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">
                          Endereço da carteira do treasury do projeto
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security & Compliance */}
                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Segurança e Compliance</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          {...register('hasAudit')}
                          className="mt-1 h-4 w-4 bg-white/5 border-neutral-600 text-lunes-purple focus:ring-lunes-purple rounded"
                        />
                        <div>
                          <label className="text-sm font-medium text-neutral-300">
                            Projeto possui auditoria de segurança
                          </label>
                          <p className="text-xs text-neutral-500">
                            Auditorias aumentam significativamente o Score de Garantia
                          </p>
                        </div>
                      </div>

                      {watchedValues.hasAudit && (
                        <div className="ml-7">
                          <Input
                            {...register('auditReport')}
                            placeholder="Link para o relatório de auditoria"
                            className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                          />
                          {errors.auditReport && (
                            <p className="text-red-400 text-sm mt-1">{errors.auditReport.message}</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          {...register('hasKYC')}
                          className="mt-1 h-4 w-4 bg-white/5 border-neutral-600 text-lunes-purple focus:ring-lunes-purple rounded"
                        />
                        <div>
                          <label className="text-sm font-medium text-neutral-300">
                            Equipe passou por processo KYC
                          </label>
                          <p className="text-xs text-neutral-500">
                            KYC aumenta a confiança e o Score de Garantia
                          </p>
                        </div>
                      </div>

                      {watchedValues.hasKYC && (
                        <div className="ml-7">
                          <Input
                            {...register('kycProvider')}
                            placeholder="Nome do provedor KYC (ex: Jumio, Onfido)"
                            className="bg-white/5 border-white/10 text-white placeholder-neutral-500 focus:border-lunes-purple"
                          />
                          {errors.kycProvider && (
                            <p className="text-red-400 text-sm mt-1">{errors.kycProvider.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Preview */}
                  {isValid && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-t border-white/10 pt-6"
                    >
                      <div className="bg-lunes-purple/10 border border-lunes-purple/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="w-5 h-5 text-lunes-purple" />
                          <h4 className="font-semibold text-white">Score Estimado</h4>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold text-lunes-purple">
                            {calculateEstimatedScore(watchedValues)}/100
                          </div>
                          <div className="text-sm text-neutral-400">
                            <p>Este é um score estimado baseado nas informações fornecidas.</p>
                            <p>O score final será calculado após a análise completa.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Terms Agreement */}
                  <div className="border-t border-white/10 pt-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        {...register('agreedToTerms')}
                        className="mt-1 h-4 w-4 bg-white/5 border-neutral-600 text-lunes-purple focus:ring-lunes-purple rounded"
                      />
                      <div>
                        <label className="text-sm font-medium text-neutral-300">
                          Concordo com os{' '}
                          <Link to="/termos" className="text-lunes-purple hover:text-purple-400 underline">
                            Termos e Condições
                          </Link>
                          {' '}e{' '}
                          <Link to="/privacidade" className="text-lunes-purple hover:text-purple-400 underline">
                            Política de Privacidade
                          </Link>
                        </label>
                        {errors.agreedToTerms && (
                          <p className="text-red-400 text-sm mt-1">{errors.agreedToTerms.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Registration Error */}
                  {registrationError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-900">Erro no Cadastro</h4>
                          <p className="text-red-700 text-sm">{registrationError}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Registration Progress */}
                  {isSubmitting && registrationStep !== 'form' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            {registrationStep === 'connecting' && 'Conectando carteira...'}
                            {registrationStep === 'registering' && 'Registrando projeto no contrato...'}
                            {registrationStep === 'deposit' && 'Preparando depósito de garantia...'}
                          </h4>
                          <p className="text-blue-700 text-sm">Por favor, aguarde e não feche esta página.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Wallet Connection Status */}
                  {wallet.isConnected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Carteira conectada: {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-6)}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={!isValid || isSubmitting || isConnecting}
                      className="px-8 py-3 text-lg bg-lunes-purple hover:bg-lunes-purple-dark text-white rounded-full transition-all shadow-lg hover:shadow-purple-500/25"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {registrationStep === 'connecting' && 'Conectando...'}
                          {registrationStep === 'registering' && 'Registrando...'}
                          {registrationStep === 'deposit' && 'Preparando...'}
                          {registrationStep === 'form' && 'Processando...'}
                        </>
                      ) : wallet.isConnected ? (
                        'Registrar e Depositar Garantia'
                      ) : (
                        'Conectar Carteira e Cadastrar'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && registrationData && (
        <DepositGuaranteeModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          onSuccess={handleDepositSuccess}
          projectData={registrationData}
        />
      )}
    </>
  )
}

export default ProjectRegistration