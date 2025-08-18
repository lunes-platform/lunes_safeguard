import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorModal } from '@safeguard/shared-ui';

/**
 * Layout principal da plataforma comunitária
 * Inclui header com navegação, área de conteúdo e footer
 */
export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ErrorModal />
    </div>
  );
}