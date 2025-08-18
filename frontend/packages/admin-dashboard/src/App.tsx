import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { CreateProject } from './pages/CreateProject';
import { Guarantees } from './pages/Guarantees';
import { Voting } from './pages/Voting';
import { NetworkDiagnostic } from './pages/NetworkDiagnostic';
import { FormValidationDemo } from './pages/FormValidationDemo';
import { TooltipDemo } from './pages/TooltipDemo';
import { PageTransitionDemo } from './pages/PageTransitionDemo';
import { ShakeAnimationDemo } from './pages/ShakeAnimationDemo';
import { IconAnimationDemo } from './pages/IconAnimationDemo'
import AudioFeedbackDemo from './pages/AudioFeedbackDemo'
import FloatingLabelsDemo from './pages/FloatingLabelsDemo';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
             <Route path="/" element={<Layout />}>
               <Route path="" element={<Dashboard />} />
               <Route path="projects" element={<Projects />} />
               <Route path="create-project" element={<CreateProject />} />
               <Route path="guarantees" element={<Guarantees />} />
               <Route path="voting" element={<Voting />} />
               <Route path="network-diagnostic" element={<NetworkDiagnostic />} />
               <Route path="/form-validation-demo" element={<FormValidationDemo />} />
           <Route path="/tooltip-demo" element={<TooltipDemo />} />
                <Route path="/page-transition-demo" element={<PageTransitionDemo />} />
            <Route path="/shake-animation-demo" element={<ShakeAnimationDemo />} />
            <Route path="/icon-animation-demo" element={<IconAnimationDemo />} />
          <Route path="/audio-feedback-demo" element={<AudioFeedbackDemo />} />
          <Route path="/floating-labels-demo" element={<FloatingLabelsDemo />} />
               <Route path="settings" element={<Settings />} />
             </Route>
             <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}