import { Button } from '@safeguard/shared-ui';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Página 404 - Não Encontrado
 * Exibida quando o usuário acessa uma rota que não existe
 */
export function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const quickLinks = [
    {
      title: 'Explorar Projetos',
      description: 'Descubra projetos inovadores na plataforma',
      href: '/projects',
      icon: Search
    },
    {
      title: 'Participar de Votações',
      description: 'Vote nos projetos da comunidade',
      href: '/vote',
      icon: HelpCircle
    },
    {
      title: 'Sobre a SafeGuard',
      description: 'Conheça mais sobre nossa plataforma',
      href: '/about',
      icon: HelpCircle
    }
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl md:text-9xl font-bold text-primary/20 mb-4">
            404
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-blue-300 mx-auto rounded-full" />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Página Não Encontrada
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Ops! A página que você está procurando não existe ou foi movida.
            Que tal explorar outras áreas da plataforma?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button asChild variant="lunes" size="lg">
            <Link to="/">
              <Home className="h-5 w-5 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Página Anterior
          </Button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                to={link.href}
                className="group p-6 bg-card border border-border rounded-lg hover:shadow-lg transition-all duration-200 hover:border-blue-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Se você acredita que isso é um erro ou precisa de ajuda, 
            entre em contato com nossa equipe de suporte.
          </p>
        </div>
      </div>
    </div>
  );
}