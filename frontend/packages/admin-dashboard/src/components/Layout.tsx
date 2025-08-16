import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Layout principal do Admin Dashboard
 * 
 * Estrutura:
 * - Header: Barra superior com navegação e perfil do usuário
 * - Sidebar: Menu lateral com navegação principal
 * - Main: Conteúdo principal das páginas, renderizado via <Outlet />
 */
export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="ml-0 lg:ml-64 pt-16 p-6 min-h-[calc(100vh-4rem)] transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}