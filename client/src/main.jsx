import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LiveKitProvider } from './context/LiveKitContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LiveKitProvider>
        <App />
      </LiveKitProvider>
    </AuthProvider>
  </React.StrictMode>
);
