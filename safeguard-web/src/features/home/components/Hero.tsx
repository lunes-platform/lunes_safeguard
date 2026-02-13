import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../../components/ui'

export const Hero: React.FC = () => {

    return (
        <section className="relative overflow-hidden bg-lunes-dark min-h-[85vh] flex items-center justify-center pt-20">
            {/* Background with modern gradient mesh */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-lunes-purple/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 z-10 relative text-center max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-medium text-lunes-light/80 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                        Protocolo 100% On-Chain
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                        A Nova Era da <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lunes-purple to-purple-400">
                            Segurança DeFi
                        </span>
                    </h1>

                    <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Proteja seus ativos com a tecnologia de garantia descentralizada mais avançada da Lunes Blockchain. Transparência, rapidez e confiança.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            size="lg"
                            className="bg-lunes-purple hover:bg-lunes-purple-dark text-white px-8 h-12 rounded-full font-semibold text-lg shadow-lg hover:shadow-purple-500/25 transition-all"
                        >
                            Começar Agora
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white/20 text-white hover:bg-white/10 px-8 h-12 rounded-full font-medium text-lg backdrop-blur-sm"
                        >
                            Ler Documentação
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </motion.div>
        </section>
    )
}
