import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMotion } from '../animation/useMotion'
import { Shield, ExternalLink, Heart, Sparkles, Zap, BookOpen, Globe } from 'lucide-react'

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const motion = useMotion(true)

  const MotionDiv = motion ? motion.div : 'div'
  // const MotionLink = motion ? motion.a : 'a'
  const MotionFooter = motion ? motion.footer : 'footer'

  return (
    <MotionFooter
      className="relative bg-gradient-to-br from-lunes-dark via-neutral-800 to-lunes-dark text-lunes-light mt-auto overflow-hidden"
      role="contentinfo"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-lunes-purple/5 via-transparent to-lunes-light/5" />

        {/* Floating geometric shapes */}
        <MotionDiv
          className="absolute top-20 left-10 w-32 h-32 bg-lunes-purple/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <MotionDiv
          className="absolute bottom-32 right-20 w-24 h-24 bg-lunes-light/10 rounded-full blur-2xl"
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      </div>

      <div className="container mx-auto py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 items-start">
          {/* Enhanced Brand Section */}
          <MotionDiv
            className="md:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            aria-labelledby="footer-brand"
          >
            <MotionDiv
              className="flex items-center space-x-4 mb-8 group"
              whileHover={{ scale: 1.02 }}
            >
              <MotionDiv
                className="relative w-12 h-12 bg-gradient-to-br from-lunes-purple to-lunes-purple-dark rounded-xl flex items-center justify-center overflow-hidden"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                aria-hidden="true"
              >
                {/* Animated background sparkles */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Shield className="w-6 h-6 text-white" />

                {/* Floating particles effect */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-lunes-light rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
              </MotionDiv>

              <MotionDiv className="flex flex-col">
                <h2 id="footer-brand" className="text-white font-bold text-3xl group-hover:text-lunes-light transition-colors duration-300">
                  SafeGuard
                </h2>
                <span className="text-lunes-purple/80 font-medium text-sm -mt-1">
                  Web3 Security Platform
                </span>
              </MotionDiv>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <p className="text-lunes-light/70 text-base leading-relaxed mb-8 relative max-w-sm">
                {t('footer.copyright')}
                <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-lunes-purple to-lunes-light/20 rounded-full" />
              </p>
            </MotionDiv>
          </MotionDiv>

          {/* Enhanced Legal Links */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <nav role="navigation" aria-labelledby="footer-legal">
              <MotionDiv className="relative mb-8">
                <h3 id="footer-legal" className="text-lunes-light font-bold text-xl mb-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-lunes-purple to-lunes-purple-dark rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  {t('footer.legal')}
                </h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-lunes-purple to-lunes-light rounded-full" />
              </MotionDiv>

              <ul className="space-y-4" role="list">
                <MotionDiv
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  viewport={{ once: true }}
                  role="listitem"
                >
                  <Link
                    to="/termos"
                    className="flex items-center gap-3 text-lunes-light/80 hover:text-lunes-purple-light transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-lunes-purple/10 text-sm focus:outline-none focus:ring-2 focus:ring-lunes-purple/40"
                  >
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="font-medium">{t('footer.terms')}</span>
                    <div className="ml-auto w-2 h-2 bg-lunes-purple/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </MotionDiv>
                <MotionDiv
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  viewport={{ once: true }}
                  role="listitem"
                >
                  <Link
                    to="/privacidade"
                    className="flex items-center gap-3 text-lunes-light/80 hover:text-lunes-purple-light transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-lunes-purple/10 text-sm focus:outline-none focus:ring-2 focus:ring-lunes-purple/40"
                  >
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="font-medium">{t('footer.privacy')}</span>
                    <div className="ml-auto w-2 h-2 bg-lunes-purple/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </MotionDiv>
                <MotionDiv
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  viewport={{ once: true }}
                  role="listitem"
                >
                  <Link
                    to="/cookies"
                    className="flex items-center gap-3 text-lunes-light/80 hover:text-lunes-purple-light transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-lunes-purple/10 text-sm focus:outline-none focus:ring-2 focus:ring-lunes-purple/40"
                  >
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="font-medium">{t('footer.cookies')}</span>
                    <div className="ml-auto w-2 h-2 bg-lunes-purple/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </MotionDiv>
                <MotionDiv
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  viewport={{ once: true }}
                  role="listitem"
                >
                  <Link
                    to="/compliance"
                    className="flex items-center gap-3 text-lunes-light/80 hover:text-lunes-purple-light transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-lunes-purple/10 text-sm focus:outline-none focus:ring-2 focus:ring-lunes-purple/40"
                  >
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="font-medium">{t('footer.compliance')}</span>
                    <div className="ml-auto w-2 h-2 bg-lunes-purple/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                </MotionDiv>
              </ul>
            </nav>
          </MotionDiv>

          {/* Enhanced Resources & Support */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <nav role="navigation" aria-labelledby="footer-resources">
              <MotionDiv className="relative mb-6">
                <h3 id="footer-resources" className="text-lunes-light font-bold text-lg mb-2 flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-lunes-purple" />
                  {t('footer.resources')}
                </h3>
              </MotionDiv>

              <ul className="space-y-3" role="list">
                {['documentation', 'apiReference', 'faq', 'helpCenter'].map((item, idx) => (
                  <MotionDiv
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * idx }}
                    viewport={{ once: true }}
                    role="listitem"
                  >
                    <Link
                      to={item === 'documentation' ? '/docs' : item === 'apiReference' ? '/api' : `/${item === 'helpCenter' ? 'help' : item}`}
                      className="flex items-center gap-2 text-lunes-light/60 hover:text-white transition-all duration-300 group py-1 text-sm"
                    >
                      <span className="w-1 h-1 bg-lunes-purple rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      {t(`footer.${item}`)}
                    </Link>
                  </MotionDiv>
                ))}
              </ul>
            </nav>
          </MotionDiv>
        </div>

        {/* Enhanced Disclaimer */}
        <MotionDiv
          className="border-t border-lunes-purple/30 mt-12 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          aria-label="Aviso importante"
        >
          <div className="bg-gradient-to-r from-lunes-purple/10 to-lunes-light/5 rounded-2xl p-6 border border-lunes-purple/20">
            <p className="text-lunes-light/90 text-sm leading-relaxed">
              <strong className="text-lunes-light flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lunes-purple" />
                {t('footer.importantNotice')}:
              </strong>
              <span className="ml-6 block mt-2">{t('home.disclaimer.text')}</span>
            </p>
          </div>
        </MotionDiv>

        {/* Enhanced Copyright */}
        <MotionDiv
          className="border-t border-lunes-purple/30 mt-8 pt-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          aria-label="Informações de copyright"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <MotionDiv
              className="flex items-center gap-2 text-lunes-light/80 text-sm"
              whileHover={{ scale: 1.02 }}
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>{t('footer.allRightsReserved', { year: currentYear })}</span>
            </MotionDiv>
            <MotionDiv
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.05 }}
            >
              <Globe className="w-4 h-4 text-lunes-purple/60" />
              <span className="text-lunes-light/70 text-xs font-medium">
                {t('footer.tagline')}
              </span>
              <Zap className="w-4 h-4 text-lunes-light/60" />
            </MotionDiv>
          </div>
        </MotionDiv>
      </div>
    </MotionFooter>
  )
}

export default Footer
