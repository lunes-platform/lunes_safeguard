import React from 'react'
import { Button } from './ui/Button'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can integrate logging here
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center p-6 text-center">
          <section>
            <h1 className="text-2xl font-semibold mb-2 text-lunes-dark">Algo deu errado</h1>
            <p className="text-lunes-dark/70 mb-4">Tente recarregar a página. Se o problema persistir, contate o suporte.</p>
            <Button
              variant="purple"
              size="lg"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
            >
              Recarregar
            </Button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
