import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from './blogData';
import { absUrl } from '../../utils/seo';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
        <Link className="text-primary-600 hover:underline" to="/blog">Voltar ao Blog</Link>
      </div>
    );
  }

  return (
    <article className="p-8 max-w-3xl mx-auto prose prose-indigo">
      <Helmet>
        <title>{post.title} — Blog SafeGard</title>
        <meta name="description" content={post.description} />
        <link rel="canonical" href={absUrl(`/blog/${post.slug}`)} />
        {post.tags?.map(tag => (
          <meta key={tag} name="keywords" content={tag} />
        ))}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.date,
            keywords: post.tags?.join(', '),
            mainEntityOfPage: absUrl(`/blog/${post.slug}`),
            url: absUrl(`/blog/${post.slug}`),
            author: { '@type': 'Organization', name: 'SafeGard' },
            publisher: { '@type': 'Organization', name: 'SafeGard' }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: absUrl('/blog') },
              { '@type': 'ListItem', position: 3, name: post.title, item: absUrl(`/blog/${post.slug}`) },
            ],
          })}
        </script>
      </Helmet>

      <nav className="mb-6 text-sm">
        <Link className="text-primary-600 hover:underline" to="/blog">← Voltar ao Blog</Link>
      </nav>

      <h1>{post.title}</h1>
      <p className="text-sm text-neutral-500">{new Date(post.date).toLocaleDateString()}</p>
      {post.tags && (
        <div className="mt-2 flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">#{tag}</span>
          ))}
        </div>
      )}
      <hr className="my-6" />
      {post.content.split('\n').map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </article>
  );
}
