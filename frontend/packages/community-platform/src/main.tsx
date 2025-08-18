import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { UnifiedWalletProvider } from '@safeguard/web3';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UnifiedWalletProvider>
        <App />
      </UnifiedWalletProvider>
    </BrowserRouter>
  </React.StrictMode>
);