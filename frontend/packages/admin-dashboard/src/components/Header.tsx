import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown, Wallet, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Web3WalletModal from './Web3WalletModal';

// Componentes temporários para contornar problemas de dependência
const Input = ({ type, placeholder, leftIcon, className, ...props }: any) => (
  <div className={`relative ${className}`}>
    {leftIcon && (
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        {leftIcon}
      </div>
    )}
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-3 py-2 ${leftIcon ? 'pl-10' : ''} bg-background border border-border rounded-[5px] text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
      {...props}
    />
  </div>
);

interface HeaderProps {
  onToggleSidebar?: () => void;
}

/**
 * Header do Admin Dashboard
 * 
 * Funcionalidades:
 * - Barra de pesquisa
 * - Notificações
 * - Menu do usuário com dropdown
 * - Sistema de login/logout
 */
export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, isAuthenticated, disconnectWallet, error } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Fecha dropdown quando clicar fora
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  /**
   * Manipula desconexão da carteira
   */
  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  /**
   * Manipula abertura do modal de carteira
   */
  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  /**
   * Formata endereço da carteira
   */
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  return (
    <header className="bg-card border-b border-border h-16 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {/* Logo e Título */}
      <div className="flex items-center space-x-4">
        {/* Botão Menu Mobile */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-[5px] flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground hidden sm:block">
            SafeGuard Admin
          </h1>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-12">
        <div className="w-full">
          <Input
            type="text"
            placeholder="Pesquisar projetos, garantias..."
            leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Botão de Pesquisa Mobile */}
      <div className="md:hidden">
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors">
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Ações do Usuário */}
      <div className="flex items-center space-x-3">
        {/* Notificações */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            3
          </span>
        </button>

        {/* Perfil do Usuário */}
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors"
            >
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user?.name || 'Carteira Conectada'}</div>
                <div className="text-xs text-muted-foreground">
                  {formatAddress(user?.address || '')}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {/* Informações do usuário */}
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user?.address}</p>
                    <p className="text-xs text-primary mt-1">
                      {user?.network} • {user?.walletType === 'substrate' ? 'Substrate' : 'Ethereum'}
                    </p>
                  </div>
                  
                  {/* Opções do menu */}
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                    <User className="h-4 w-4" />
                    Perfil
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </button>
                  
                  <button 
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Desconectar Carteira
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={handleConnectWallet}
            className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors"
          >
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Conectar Carteira</span>
          </button>
        )}
      </div>

      {/* Modal de Carteira */}
      <Web3WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
      
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </header>
  );
}