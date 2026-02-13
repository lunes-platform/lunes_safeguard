import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <section className="text-center">
        <p className="text-sm font-semibold text-lunes-purple">Erro 404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-lunes-dark">Página não encontrada</h1>
        <p className="mt-2 text-base text-lunes-dark/70">
          A página que você procura pode ter sido removida, renomeada ou está temporariamente indisponível.
        </p>
        <nav className="mt-6 flex items-center justify-center gap-x-4" role="navigation" aria-label="Navegação de erro 404">
           <Link to="/">
             <Button variant="purple" size="lg">
               Voltar ao início
             </Button>
           </Link>
           <Link to="/projetos">
             <Button variant="purple-outline" size="lg">
               Ver projetos
             </Button>
           </Link>
         </nav>
      </section>
    </main>
  );
}
