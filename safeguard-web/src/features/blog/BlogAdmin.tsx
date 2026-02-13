import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function BlogAdmin() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Helmet>
        <title>Admin do Blog — SafeGard</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="/admin/blog" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-4">Admin do Blog</h1>
      <p className="text-neutral-700 mb-6">
        Área administrativa mínima para futura publicação de posts pela equipe do SafeGard. Nesta etapa, os posts são
        mockados em arquivo. Em versões futuras, adicionaremos autenticação e fluxo de publicação.
      </p>

      <div className="space-y-4">
        <Link className="text-primary-600 hover:underline" to="/blog">Ver posts publicados →</Link>
        <div className="p-4 border rounded bg-neutral-100">
          <h2 className="font-semibold mb-2">Próximos passos planejados</h2>
          <ul className="list-disc ml-5 text-sm text-neutral-700">
            <li>Autenticação para equipe (SSO/GitHub OAuth)</li>
            <li>Editor rich-text/markdown</li>
            <li>Pré-visualização e agendamento</li>
            <li>Publicação estática (SSG) ou via CMS headless</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
