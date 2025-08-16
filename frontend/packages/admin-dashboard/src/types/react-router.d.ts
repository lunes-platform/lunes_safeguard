/**
 * Declarações de tipos para React Router DOM
 * Resolve problemas de compatibilidade de tipos JSX
 */

declare module 'react-router-dom' {
  import { ComponentType, ReactElement, ReactNode } from 'react';

  export interface RouteProps {
    path?: string;
    element?: ReactNode;
    children?: ReactNode;
  }

  export interface RoutesProps {
    children?: ReactNode;
    location?: any;
  }

  export const Route: ComponentType<RouteProps>;
  export const Routes: ComponentType<RoutesProps>;
  export const BrowserRouter: ComponentType<{ children?: ReactNode }>;
  export const Link: ComponentType<{ to: string; children?: ReactNode; className?: string }>;
  export const NavLink: ComponentType<{ to: string; children?: ReactNode; className?: string }>;
  export const Navigate: ComponentType<{ to: string; replace?: boolean }>;
  
  export function useNavigate(): (to: string, options?: { replace?: boolean }) => void;
  export function useLocation(): { pathname: string; search: string; hash: string; state: any };
  export function useParams<T = {}>(): T;
}