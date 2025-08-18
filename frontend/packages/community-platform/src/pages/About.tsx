import { Card, CardContent, CardHeader, CardTitle, Button } from '../../../shared-ui/src';
import { Shield, Users, Zap, Globe, Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

/**
 * Página sobre a plataforma SafeGuard
 * Apresenta informações sobre a missão, valores e equipe
 */
export function About() {
  const features = [
    {
      icon: Shield,
      title: 'Garantias por 5 Anos',
      description: 'Projetos depositam garantias em LUNES (obrigatório) e LUSDT (opcional) por 5 anos, oferecendo proteção real aos investidores.'
    },
    {
      icon: Users,
      title: 'Processo Democrático',
      description: 'Votações anuais da comunidade decidem a continuidade. 75% contra = 90 dias para nova proposta ou devolução proporcional.'
    },
    {
      icon: Zap,
      title: 'Exclusividade Lunes',
      description: 'Apenas projetos com garantia ativa podem entrar na Dex e Launchpad Lunes. Mais LUNES = melhor ranking.'
    },
    {
      icon: Globe,
      title: 'Primeiro do Mundo',
      description: 'Somos o primeiro ecossistema na web3 que oferece projetos com garantias. Pioneiros em segurança blockchain.'
    }
  ];

  const team = [
    {
      name: 'Equipe Lunes',
      role: 'Desenvolvimento Core',
      description: 'Especialistas em blockchain e desenvolvimento descentralizado'
    },
    {
      name: 'Comunidade SafeGuard',
      role: 'Governança e Validação',
      description: 'Membros ativos que participam das decisões e validações'
    },
    {
      name: 'Desenvolvedores Parceiros',
      role: 'Projetos e Inovação',
      description: 'Criadores de projetos inovadores no ecossistema'
    }
  ];

  const stats = [
    { label: 'Projetos Ativos', value: '25+' },
    { label: 'Membros da Comunidade', value: '1,200+' },
    { label: 'Garantias Processadas', value: '500K LUNES' },
    { label: 'Votações Realizadas', value: '150+' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Sobre a <span className="text-primary">SafeGuard</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
          Uma plataforma dentro do ecossistema Lunes onde criadores de projetos depositam 
          garantias para oferecer segurança aos investidores. Somos o primeiro ecossistema 
          na web3 que oferece projetos com garantias travadas por 5 anos e processo democrático 
          de votação anual.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => window.open('http://localhost:3001', '_blank')}
            className="cursor-pointer"
          >
            Adicionar Garantia
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open('https://github.com', '_blank')}
            className="cursor-pointer"
          >
            <Github className="h-5 w-5 mr-2" />
            Ver no GitHub
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nossa Missão</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Garantir que projetos novos ou pouco conhecidos ofereçam um nível mínimo de segurança 
              aos investidores através de garantias travadas por 5 anos. Criamos um processo democrático 
              onde a comunidade participa das decisões importantes do projeto, oferecendo proteção real 
              através de devolução proporcional das garantias em caso de falha do projeto.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Por que SafeGuard?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How it Works */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <CardTitle>Cadastro e Garantia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Criador informa contratos do projeto e token, depois deposita 
                garantia em LUNES (obrigatório) e LUSDT (opcional) por 5 anos.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <CardTitle>Votações Anuais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                A cada 12 meses, investidores votam se o projeto segue o roadmap. 
                Mais de 75% contra = 90 dias para nova proposta.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <CardTitle>Proteção e Resgate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Se projeto falhar, garantias são devolvidas proporcionalmente. 
                Após 5 anos de sucesso, projeto pode resgatar as garantias.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nossa Comunidade</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle>{member.name}</CardTitle>
                <p className="text-primary font-medium">{member.role}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-16">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Benefícios Exclusivos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Para Investidores</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Garantia travada protege o investimento</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Devolução proporcional se projeto falhar</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Votações anuais para decidir continuidade</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Acesso apenas a projetos com garantia ativa</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">Para Projetos</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Demonstra compromisso e seriedade</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Exclusividade na Dex e Launchpad Lunes</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Ranking baseado em LUNES travados</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
                    <span>Comunidade pode adicionar mais garantias</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technology */}
      <div className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Tecnologia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-4">Blockchain Lunes</h3>
                <p className="text-muted-foreground mb-4">
                  Construída sobre a blockchain Lunes, a SafeGuard oferece:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Transações rápidas e econômicas
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Contratos inteligentes auditados
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Governança descentralizada
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Interoperabilidade com outras blockchains
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-16 w-16 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Powered by Lunes Blockchain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact */}
      <div className="text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Junte-se à Comunidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Faça parte da revolução da inovação descentralizada. 
              Conecte-se conosco e acompanhe as novidades.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline">
                <Github className="h-4 w-4 mr-2" />
                GitHub
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
              <Button variant="outline">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Discord
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}