import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RefManager } from './components/RefMessagesManager';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RefManager>
      <App />
    </RefManager>
  </React.StrictMode>
);
