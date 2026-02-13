import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import LangSwitcher from './LangSwitcher'
import { Sparkles, Shield, Zap, Menu, X, ChevronRight } from 'lucide-react'

const Header: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const navigation = [
    { name: t('nav.projects'), href: '/projetos' },
    { name: t('nav.registerProject', 'Cadastrar Projeto'), href: '/cadastrar-projeto' },
    { name: t('nav.howItWorks'), href: '/como-funciona' },
    { name: t('nav.score'), href: '/score-de-garantia' },
    { name: t('nav.ranking', 'Ranking'), href: '/ranking' },
    { name: t('nav.governance'), href: '/governanca' },
    { name: t('nav.faq'), href: '/faq' },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
            ? 'bg-lunes-dark/90 backdrop-blur-md shadow-level-3 border-b border-white/5'
            : 'bg-transparent border-b border-transparent'
          }`}
        role="banner"
      >
        <div className="container mx-auto px-4 relative z-50">
          <div className="flex items-center justify-between h-20">
            {/* Logo Area */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative w-10 h-10 bg-gradient-to-br from-lunes-purple to-lunes-purple-dark rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-lunes-purple/20 group-hover:shadow-lunes-purple/40 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-tight leading-none group-hover:text-lunes-purple-light transition-colors">
                  SafeGuard
                </span>
                <span className="text-xs text-neutral-400 font-medium tracking-wide">
                  Web3 Security
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span className={`relative z-10 ${isActive(item.href) ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>
                    {item.name}
                  </span>

                  {/* Active/Hover Background */}
                  {(isActive(item.href) || hoveredItem === item.name) && (
                    <motion.div
                      layoutId="nav-bg"
                      className={`absolute inset-0 rounded-lg ${isActive(item.href) ? 'bg-white/10' : 'bg-white/5'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Active Indicator Dot */}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-lunes-purple rounded-full -translate-x-1/2"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <LangSwitcher />

              <Link
                to="/acesso-admin"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-lunes-purple text-white text-sm font-medium shadow-lg shadow-lunes-purple/20 hover:bg-lunes-purple-dark hover:shadow-lunes-purple/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                <span>{t('nav.adminAccess')}</span>
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-lunes-dark pt-24 px-6 overflow-y-auto lg:hidden"
          >
            <div className="flex flex-col gap-6 pb-10">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <span className="text-neutral-400 text-sm uppercase tracking-wider font-semibold">Menu</span>
                <LangSwitcher />
              </div>

              <div className="flex flex-col gap-2">
                {navigation.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-xl text-lg font-medium transition-all ${isActive(item.href)
                          ? 'bg-lunes-purple/10 text-lunes-purple border border-lunes-purple/20'
                          : 'text-neutral-300 active:bg-white/5'
                        }`}
                    >
                      <span className="flex items-center gap-3">
                        {item.href === '/projetos' && <Zap className="w-5 h-5" />}
                        {item.href === '/ranking' && <Sparkles className="w-5 h-5" />}
                        {item.name}
                      </span>
                      {isActive(item.href) && <ChevronRight className="w-5 h-5" />}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <Link
                  to="/acesso-admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium active:scale-95 transition-all"
                >
                  <Shield className="w-5 h-5" />
                  {t('nav.adminAccess')}
                </Link>
              </motion.div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-lunes-purple/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
