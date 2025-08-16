import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { UnifiedWalletProvider } from '@safeguard/web3';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UnifiedWalletProvider>
      <App />
    </UnifiedWalletProvider>
  </React.StrictMode>
);