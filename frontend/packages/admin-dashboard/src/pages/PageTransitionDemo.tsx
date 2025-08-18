import React, { useState } from 'react'
import { PageTransition, RouteTransition, usePageTransition } from '@safeguard/shared-ui'
import { Button } from '@safeguard/shared-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@safeguard/shared-ui'

/**
 * Página de demonstração das transições de página
 * Mostra diferentes tipos de animações e como utilizá-las
 */
export const PageTransitionDemo: React.FC = () => {
  const [currentTransition, setCurrentTransition] = useState<'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'scale' | 'rotate'>('fade')
  const [showContent, setShowContent] = useState(true)
  const [routeKey, setRouteKey] = useState('page1')
  const { isTransitioning, transitionType, startTransition, endTransition } = usePageTransition()

  const transitionTypes = [
    { value: 'fade' as const, label: 'Fade' },
    { value: 'slide-left' as const, label: 'Slide Left' },
    { value: 'slide-right' as const, label: 'Slide Right' },
    { value: 'slide-up' as const, label: 'Slide Up' },
    { value: 'slide-down' as const, label: 'Slide Down' },
    { value: 'scale' as const, label: 'Scale' },
    { value: 'rotate' as const, label: 'Rotate' }
  ]

  const handleTransitionChange = (type: typeof currentTransition) => {
    setShowContent(false)
    setTimeout(() => {
      setCurrentTransition(type)
      setShowContent(true)
    }, 300)
  }

  const handleRouteTransition = () => {
    setRouteKey(routeKey === 'page1' ? 'page2' : 'page1')
  }

  const handleProgrammaticTransition = () => {
    startTransition('scale')
    setTimeout(() => {
      endTransition()
    }, 1000)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Demonstração de Transições de Página
        </h1>
        <p className="text-gray-600">
          Explore diferentes tipos de animações para transições suaves entre páginas
        </p>
      </div>

      {/* Controles de Transição */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Transição</CardTitle>
          <CardDescription>
            Selecione um tipo de transição para ver a animação em ação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {transitionTypes.map((type) => (
              <Button
                key={type.value}
                variant={currentTransition === type.value ? 'default' : 'outline'}
                onClick={() => handleTransitionChange(type.value)}
                className="text-sm"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demonstração da Transição Básica */}
      <Card>
        <CardHeader>
          <CardTitle>Transição Básica - {currentTransition}</CardTitle>
          <CardDescription>
            Componente PageTransition com animação {currentTransition}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
            {showContent && (
              <PageTransition
                type={currentTransition}
                duration={500}
                animateIn={true}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl font-bold mb-2">Conteúdo Animado</h3>
                  <p className="text-blue-100">
                    Esta caixa aparece com a animação <strong>{currentTransition}</strong>
                  </p>
                  <div className="mt-4 flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </PageTransition>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demonstração de Transição de Rota */}
      <Card>
        <CardHeader>
          <CardTitle>Transição de Rota</CardTitle>
          <CardDescription>
            Simula transições automáticas entre diferentes páginas/rotas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleRouteTransition} className="mb-4">
              Alternar Página ({routeKey === 'page1' ? 'Ir para Página 2' : 'Voltar para Página 1'})
            </Button>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[150px]">
              <RouteTransition
                routeKey={routeKey}
                type="slide-right"
                duration={400}
              >
                {routeKey === 'page1' ? (
                  <div className="bg-green-100 p-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold text-green-800 mb-2">📄 Página 1</h3>
                    <p className="text-green-600">
                      Esta é a primeira página com conteúdo específico.
                    </p>
                    <div className="mt-3 text-sm text-green-500">
                      Transição: slide-right
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-100 p-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold text-purple-800 mb-2">📋 Página 2</h3>
                    <p className="text-purple-600">
                      Esta é a segunda página com conteúdo diferente.
                    </p>
                    <div className="mt-3 text-sm text-purple-500">
                      Transição: slide-right
                    </div>
                  </div>
                )}
              </RouteTransition>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demonstração de Hook Programático */}
      <Card>
        <CardHeader>
          <CardTitle>Controle Programático</CardTitle>
          <CardDescription>
            Use o hook usePageTransition para controlar transições via código
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button onClick={handleProgrammaticTransition}>
                Iniciar Transição Programática
              </Button>
              <div className={`px-3 py-1 rounded-full text-sm ${
                isTransitioning 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isTransitioning ? '🔄 Transitioning...' : '✅ Ready'}
              </div>
            </div>
            
            {isTransitioning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  🎬 Transição ativa com tipo: <strong>{transitionType}</strong>
                </p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exemplos de Código */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplos de Uso</CardTitle>
          <CardDescription>
            Como implementar essas transições em seu código
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Transição Básica:</h4>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`<PageTransition type="fade" duration={300}>
  <YourPageContent />
</PageTransition>`}
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Transição de Rota:</h4>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`<RouteTransition routeKey={location.pathname} type="slide-left">
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</RouteTransition>`}
              </pre>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Hook Programático:</h4>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`const { isTransitioning, startTransition } = usePageTransition()

const handleClick = () => {
  startTransition('scale')
  // Sua lógica aqui
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PageTransitionDemo