import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import {
  Home,
  Projects,
  ProjectDetails,
  Vote,
  About,
  Ranking,
  NotFound,
  Diagnostic,
} from '@/pages';

import { Web3Provider } from '@safeguard/web3';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="vote" element={<Vote />} />
            <Route path="about" element={<About />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="diagnostic" element={<Diagnostic />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Web3Provider>
  );
}

export default App;