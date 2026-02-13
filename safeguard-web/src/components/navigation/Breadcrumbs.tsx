import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Converte segmentos de URL em títulos legíveis
 * @param segment - Segmento da URL
 * @returns Título formatado
 */
function titleCase(segment: string): string {
  const translations: Record<string, string> = {
    'projetos': 'Projetos',
    'governanca': 'Governança',
    'como-funciona': 'Como Funciona',
    'score': 'Score',
    'score-de-garantia': 'Score de Garantia',
    'faq': 'FAQ',
    'blog': 'Blog',
    'termos': 'Termos de Uso',
    'privacidade': 'Política de Privacidade',
    'acesso-admin': 'Adicionar Garantia'
  };
  
  return translations[segment] || segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Componente Breadcrumbs otimizado para SEO e UX
 * Implementa structured data (JSON-LD) para melhor indexação
 * Design minimalista que não compromete a estética
 */
export function Breadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();
  const parts = location.pathname.split('/').filter(Boolean);
  
  const items = parts.map((part, idx) => {
    const to = '/' + parts.slice(0, idx + 1).join('/');
    return { label: titleCase(part), to };
  });

  // Não exibe breadcrumbs na home
  if (location.pathname === '/') return null;

  // Structured Data para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": window.location.origin
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 2,
        "name": item.label,
        "item": `${window.location.origin}${item.to}`
      }))
    ]
  };

  return (
    <>
      {/* Structured Data para SEO */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Breadcrumb Navigation - Design Minimalista */}
      <div 
        aria-label={t('accessibility.breadcrumb', 'Navegação estrutural')} 
        className="bg-gradient-to-r from-neutral-50/80 to-white/80 backdrop-blur-sm border-b border-neutral-100/50"
        role="navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center py-2 text-xs text-neutral-500" role="list">
            <li role="listitem">
              <Link 
                to="/" 
                className="inline-flex items-center gap-1 hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 rounded px-1 py-0.5"
                aria-label={t('accessibility.backToHome', 'Voltar para página inicial')}
              >
                <Home className="w-3 h-3" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Início</span>
              </Link>
            </li>
            
            {items.map((item, idx) => (
              <li key={item.to} className="flex items-center" role="listitem">
                <ChevronRight 
                  className="w-3 h-3 mx-1 text-neutral-300" 
                  aria-hidden="true" 
                />
                {idx === items.length - 1 ? (
                  <span 
                    aria-current="page" 
                    className="text-neutral-700 font-medium px-1 py-0.5"
                    role="text"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link 
                    to={item.to} 
                    className="hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-1 rounded px-1 py-0.5"
                    aria-label={t('accessibility.navigateTo', 'Navegar para {{destination}}', { destination: item.label })}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

export default Breadcrumbs;
