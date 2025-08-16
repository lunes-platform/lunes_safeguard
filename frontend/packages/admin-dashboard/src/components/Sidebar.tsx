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

/**
 * Sidebar do Admin Dashboard
 * 
 * Funcionalidades:
 * - Navegação principal
 * - Indicadores de status (badges)
 * - Estado ativo dos links
 */
export function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border shadow-sm">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
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
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-muted/50 rounded-[5px] p-4 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-muted-foreground font-medium">Sistema Online</p>
          </div>
          <p className="text-sm font-semibold text-foreground">SafeGuard v1.0.0</p>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
      </div>
    </aside>
  );
}