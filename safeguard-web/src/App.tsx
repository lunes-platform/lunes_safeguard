import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { SkipLink } from './components/accessibility';
import { ToastProvider } from './components/ui/ToastProvider';
import { Spinner } from './components/ui/Spinner';

// Lazy load pages
const Projects = lazy(() => import('./features/projects/Projects').then(module => ({ default: module.Projects })));
const AdminAccess = lazy(() => import('./features/admin/AdminAccess'));
const NotFound = lazy(() => import('./features/not-found/NotFound'));

// Lazy pages
const BlogList = lazy(() => import('./features/blog/BlogList').then(m => ({ default: m.default })));
const BlogPost = lazy(() => import('./features/blog/BlogPost').then(m => ({ default: m.default })));
const BlogAdmin = lazy(() => import('./features/blog/BlogAdmin').then(m => ({ default: m.default })));
const Terms = lazy(() => import('./features/legal/Terms').then(m => ({ default: m.default })));
const Privacy = lazy(() => import('./features/legal/Privacy').then(m => ({ default: m.default })));

// Lazy load pages for better performance
const Home = lazy(() => import('./features/home/Home').then(module => ({ default: module.Home })));
const Governance = lazy(() => import('./features/governance/Governance').then(module => ({ default: module.Governance })));
const HowItWorks = lazy(() => import('./features/how-it-works').then(module => ({ default: module.HowItWorks })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner />
  </div>
);

// Lazy load pages
const ProjectDetail = lazy(() => import('./features/project-detail/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const FAQ = lazy(() => import('./features/faq/FAQ').then(module => ({ default: module.default })));

// Lazy load Score page
const Score = lazy(() => import('./features/score/Score').then(m => ({ default: m.default })));

// Lazy load Ranking page
const Ranking = lazy(() => import('./features/ranking/Ranking').then(m => ({ default: m.Ranking })));

// Lazy load Project Registration page
const ProjectRegistration = lazy(() => import('./features/project-registration/ProjectRegistration'));

// Lazy load Admin pages
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProjectOnboarding = lazy(() => import('./features/admin/ProjectOnboarding').then(m => ({ default: m.ProjectOnboarding })));

function App() {
  return (
    <HelmetProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Router>
            <SkipLink />
            <div className="min-h-screen bg-lunes-dark flex flex-col text-white">
              <Header />

              <main id="main-content" className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />

                    <Route path="/como-funciona" element={<HowItWorks />} />
                    <Route path="/score" element={<Score />} />
                    <Route path="/score-de-garantia" element={<Score />} />
                    <Route path="/ranking" element={<Ranking />} />
                    <Route path="/projetos" element={<Projects />} />
                    <Route path="/cadastrar-projeto" element={<ProjectRegistration />} />
                    <Route path="/acesso-admin" element={<AdminAccess />} />
                    <Route path="/projeto/:id" element={<ProjectDetail />} />
                    <Route path="/governanca" element={<Governance />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/blog" element={<BlogList />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/termos" element={<Terms />} />
                    <Route path="/privacidade" element={<Privacy />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/onboarding" element={<ProjectOnboarding />} />
                    <Route path="/admin/blog" element={<BlogAdmin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
            </div>
          </Router>
        </ErrorBoundary>
      </ToastProvider>
    </HelmetProvider>
  )
}

export default App
