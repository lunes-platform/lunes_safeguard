import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from './blogData';
import { absUrl } from '../../utils/seo';

export default function BlogList() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Helmet>
        <title>Blog SafeGard — Atualizações e Guias</title>
        <meta name="description" content="Publicações da equipe SafeGard: atualizações do protocolo, guias e segurança." />
        <link rel="canonical" href={absUrl('/blog')} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Blog SafeGard',
            url: absUrl('/blog'),
            hasPart: blogPosts.map(p => ({
              '@type': 'BlogPosting',
              headline: p.title,
              description: p.description,
              datePublished: p.date,
              url: absUrl(`/blog/${p.slug}`),
              keywords: p.tags?.join(', '),
              mainEntityOfPage: absUrl(`/blog/${p.slug}`),
            })),
            about: {
              '@type': 'Blog',
              name: 'SafeGard Blog',
              url: absUrl('/blog')
            }
          })}
        </script>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <p className="text-neutral-700 mb-8">Notícias, guias e atualizações sobre o protocolo SafeGard.</p>

      <ul className="space-y-6">
        {blogPosts.map((p) => (
          <li key={p.slug} className="border-b border-neutral-200 pb-6">
            <h2 className="text-2xl font-semibold">
              <Link className="text-primary-600 hover:underline" to={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <div className="text-sm text-neutral-500">{new Date(p.date).toLocaleDateString()}</div>
              <p className="mt-2 text-neutral-800">{p.description}</p>
            {p.tags && (
              <div className="mt-2 flex flex-wrap gap-2">
                {p.tags.map(tag => (
                  <span key={tag} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
