import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
  canonical?: string
  alternateLanguages?: Array<{
    hrefLang: string
    href: string
  }>
}

const SEOHead = ({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  noIndex = false,
  canonical,
  alternateLanguages = []
}: SEOHeadProps) => {
  const { i18n } = useTranslation()

  const baseUrl = 'https://safeguard.lunes.io'
  const currentUrl = url || `${baseUrl}${window.location.pathname}`
  const canonicalUrl = canonical || currentUrl

  const defaultKeywords = [
    'SafeGuard',
    'DeFi',
    'Blockchain',
    'Guarantee Protocol',
    'Web3',
    'Decentralized Finance',
    'Lunes',
    'Smart Contracts',
    'Cryptocurrency',
    'Digital Assets'
  ]

  const allKeywords = [...defaultKeywords, ...keywords].join(', ')

  const defaultTitle = 'SafeGuard - First decentralized guarantee protocol for Web3'
  const defaultDescription = 'More security and transparency for Lunes ecosystem investors. Segregated vaults, annual governance and public Guarantee Score (0–100) auditable on-chain.'

  const pageTitle = title ? `${title} | SafeGuard` : defaultTitle
  const pageDescription = description || defaultDescription

  const ogImage = image.startsWith('http') ? image : `${baseUrl}${image}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content="SafeGuard Team" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="language" content={i18n.language} />
      <meta name="revisit-after" content="7 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Alternate Language Links */}
      {alternateLanguages.map((lang) => (
        <link
          key={lang.hrefLang}
          rel="alternate"
          hrefLang={lang.hrefLang}
          href={lang.href}
        />
      ))}

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="SafeGuard" />
      <meta property="og:locale" content={i18n.language === 'pt' ? 'pt_BR' : i18n.language} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={pageTitle} />
      <meta name="twitter:site" content="@SafeGuardProtocol" />
      <meta name="twitter:creator" content="@LunesBlockchain" />

      {/* Additional Meta Tags for DeFi/Blockchain */}
      <meta name="application-name" content="SafeGuard" />
      <meta name="theme-color" content="#6C38FF" />
      <meta name="msapplication-TileColor" content="#6C38FF" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Security Headers - X-Frame-Options removed (HTTP header only) */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />

      {/* Structured Data will be handled by StructuredData component */}
    </Helmet>
  )
}

export { SEOHead }
