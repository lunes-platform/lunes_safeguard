import React from 'react';
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16 p-6 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}