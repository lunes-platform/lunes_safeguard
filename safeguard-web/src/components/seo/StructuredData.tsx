import { Helmet } from 'react-helmet-async'

interface OrganizationData {
  name: string
  url: string
  logo: string
  description: string
  foundingDate?: string
  sameAs?: string[]
}

interface WebsiteData {
  name: string
  url: string
  description: string
  inLanguage: string[]
  potentialAction?: {
    '@type': string
    target: string
    'query-input': string
  }
}

interface ProjectData {
  id: number
  name: string
  description: string
  url: string
  score: number
  totalGuarantees: number
  status: string
  createdAt: string
}

interface StructuredDataProps {
  type: 'website' | 'organization' | 'project' | 'governance'
  data?: {
    organization?: OrganizationData
    website?: WebsiteData
    project?: ProjectData
    governance?: {
      name: string
      description: string
      url: string
      activeProposals: number
    }
  }
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  const generateOrganizationSchema = (org: OrganizationData) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    foundingDate: org.foundingDate,
    sameAs: org.sameAs,
    industry: 'Blockchain Technology',
    keywords: 'DeFi, Blockchain, Guarantee Protocol, Web3, Decentralized Finance',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Portuguese', 'English', 'Spanish']
    }
  })

  const generateWebsiteSchema = (website: WebsiteData) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: website.name,
    url: website.url,
    description: website.description,
    inLanguage: website.inLanguage,
    potentialAction: website.potentialAction,
    publisher: {
      '@type': 'Organization',
      name: 'SafeGard',
      url: 'https://safeguard.lunes.io'
    }
  })

  const generateProjectSchema = (project: ProjectData) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: project.name,
    description: project.description,
    url: project.url,
    category: 'DeFi Project',
    brand: {
      '@type': 'Brand',
      name: 'SafeGard'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: project.score,
      bestRating: 100,
      worstRating: 0,
      ratingCount: 1
    },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: project.totalGuarantees,
      priceCurrency: 'LUNES'
    },
    dateCreated: project.createdAt
  })

  const generateGovernanceSchema = (governance: { name: string; description: string; url: string; activeProposals: number }) => ({
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: governance.name,
    description: governance.description,
    url: governance.url,
    governmentType: 'Decentralized Autonomous Organization',
    areaServed: 'Global',
    numberOfEmployees: governance.activeProposals,
    foundingDate: '2024-01-01'
  })

  const getSchema = () => {
    switch (type) {
      case 'organization':
        return data?.organization ? generateOrganizationSchema(data.organization) : null
      case 'website':
        return data?.website ? generateWebsiteSchema(data.website) : null
      case 'project':
        return data?.project ? generateProjectSchema(data.project) : null
      case 'governance':
        return data?.governance ? generateGovernanceSchema(data.governance) : null
      default:
        return null
    }
  }

  const schema = getSchema()

  if (!schema) return null

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

export { StructuredData }
export type { OrganizationData, WebsiteData, ProjectData, StructuredDataProps }
