import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// Componente ErrorModal temporário até a correção do @safeguard/shared-ui
const ErrorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}> = ({ isOpen, onClose, title = 'Erro', message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-600">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end">
           <button
             onClick={onClose}
             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
           >
             Fechar
           </button>
         </div>
       </div>
     </div>
   );
 };

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
      <ErrorModal 
          isOpen={false}
          onClose={() => {}}
          message=""
        />
    </div>
  );
}