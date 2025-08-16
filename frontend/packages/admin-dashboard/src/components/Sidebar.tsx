import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Shield,
  Vote,
  Settings,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react';
import { cn } from '@safeguard/shared-ui';

/**
 * Item de navegação do menu lateral
 */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

/**
 * Itens de navegação do Admin Dashboard
 */
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Projetos',
    href: '/projects',
    icon: FolderOpen,
    badge: 12,
  },
  {
    label: 'Garantias',
    href: '/guarantees',
    icon: Shield,
    badge: 5,
  },
  {
    label: 'Votações',
    href: '/voting',
    icon: Vote,
    badge: 3,
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Diagnóstico de Rede',
    href: '/network-diagnostic',
    icon: Activity,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar do Admin Dashboard
 * 
 * Funcionalidades:
 * - Navegação principal
 * - Indicadores de status (badges)
 * - Estado ativo dos links
 */
export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border shadow-sm z-50 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Botão de fechar mobile */}
          <div className="lg:hidden flex justify-end p-4 pb-2">
            <button 
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-[5px] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Navegação Principal */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <NavLink
                   key={item.href}
                   to={item.href}
                   onClick={() => onClose?.()}
                   className={({ isActive }: { isActive: boolean }) =>
                     cn(
                       'flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-[5px] transition-all duration-200 group',
                       isActive
                         ? 'bg-primary text-primary-foreground shadow-sm'
                         : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                     )
                   }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Informações do Sistema */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema Online</span>
              </div>
              <div className="text-xs text-muted-foreground">
                SafeGuard v1.0.0
              </div>
              <div className="text-xs text-muted-foreground">
                Admin Dashboard
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}