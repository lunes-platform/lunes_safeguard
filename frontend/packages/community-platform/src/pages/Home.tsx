import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../shared-ui/src';
import {
  Shield,
  Users,
  Vote,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

/**
 * Página inicial da plataforma comunitária
 * Apresenta a plataforma, estatísticas e call-to-actions
 */
export function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Garantias por 5 Anos',
      description:
        'Garantias travadas por 5 anos em LUNES (obrigatório) e LUSDT (opcional) para proteção total dos investidores.',
    },
    {
      icon: Vote,
      title: 'Votações Anuais',
      description:
        'A cada 12 meses, investidores decidem se o projeto segue o roadmap. 75% contra = 90 dias para nova proposta.',
    },
    {
      icon: Users,
      title: 'Processo Democrático',
      description:
        'Comunidade participa ativamente das decisões. Garantias devolvidas proporcionalmente se projeto falhar.',
    },
    {
      icon: TrendingUp,
      title: 'Exclusividade Lunes',
      description:
        'Apenas projetos com garantia ativa podem entrar na Dex e Launchpad Lunes. Mais LUNES = melhor ranking.',
    },
  ];

  const stats = [
    { label: 'Projetos Ativos', value: '24' },
    { label: 'Total Garantido', value: '1.2M LUNES' },
    { label: 'Membros da Comunidade', value: '5.8K' },
    { label: 'Votações Realizadas', value: '156' },
  ];

  return (
    <div className="">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Garantias Descentralizadas
              <br />
              <span className="text-primary">para Projetos Inovadores</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              O SafeGuard é uma plataforma dentro do ecossistema Lunes onde criadores de projetos 
              depositam garantias para oferecer segurança aos investidores.
              <br />
              <strong className="text-primary">Somos o primeiro ecossistema na web3 que oferece projetos com garantias.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="default" 
                size="lg" 
                className="text-lg px-8 flex items-center"
                onClick={() => navigate('/projects')}
              >
                Explorar Projetos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8"
                onClick={() => navigate('/about')}
              >
                Saiba Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher o SafeGuard?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Na Dex e no Launchpad da Lunes, apenas projetos com garantia ativa no SafeGuard poderão ser listados.
              Isso garante que todos os tokens disponíveis tenham lastro de segurança, passando por votação comunitária anual.
            </p>
            <p className="text-lg text-primary font-semibold max-w-2xl mx-auto">
              Mais segurança para quem investe. Mais credibilidade para quem cria.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Um processo democrático e transparente que protege investidores e projetos sérios.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Depósito de Garantia</h3>
              <p className="text-muted-foreground">
                Projeto deposita garantia em LUNES (obrigatório) e LUSDT (opcional) por 5 anos.
                Comunidade pode adicionar mais ao cofre público.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Votações Anuais</h3>
              <p className="text-muted-foreground">
                A cada 12 meses, investidores votam se o projeto segue o roadmap.
                Se 75% votarem contra, projeto tem 90 dias para nova proposta.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Proteção Total</h3>
              <p className="text-muted-foreground">
                Se projeto falhar definitivamente, garantias são devolvidas proporcionalmente.
                Após 5 anos de sucesso, projeto pode resgatar as garantias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Pronto para Participar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se à nossa comunidade e ajude a construir o futuro da
            blockchain Lunes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              size="lg" 
              className="text-lg px-8 flex items-center"
              onClick={() => navigate('/projects')}
            >
              Ver Projetos Ativos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate('/vote')}
            >
              Participar da Votação
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}