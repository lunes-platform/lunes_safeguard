import * as React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ConnectWalletButton } from '../../../shared-ui/src';
import { Menu, X, Shield, Settings } from 'lucide-react';

/**
 * Header da plataforma comunitária
 * Inclui navegação principal e botão de conexão com carteira
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Início', href: '/' },
    { name: 'Projetos', href: '/projects' },
    { name: 'Ranking', href: '/ranking' },
    { name: 'Votação', href: '/vote' },
    { name: 'Sobre', href: '/about' },
  ];

  // Link externo para o painel administrativo
  const adminPanelUrl = 'http://localhost:3001';

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              SafeGuard
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActiveLink(item.href)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Admin Panel Link & Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Admin Panel Link */}
            <a
              href={adminPanelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center space-x-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md hover:bg-muted"
              title="Acesse o painel administrativo para criar garantias (requer conexão com carteira)"
            >
              <Settings className="h-4 w-4" />
              <span>Painel Admin</span>
            </a>
            
            <div className="hidden sm:flex">
              <ConnectWalletButton />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${
                    isActiveLink(item.href)
                      ? 'text-primary bg-blue-100'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {/* Admin Panel Link - Mobile */}
              <a
                href={adminPanelUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors border border-border mt-2"
              >
                <Settings className="h-4 w-4" />
                <span>Painel Admin</span>
              </a>
              
              <div className="mt-4 mx-3">
                <ConnectWalletButton />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}