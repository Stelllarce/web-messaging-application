import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import config from './config';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('accessToken');

      if (token) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${config.API_BASE_URL}/auth/token`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          setIsAuthenticated(false);
        } else {
          const data = await res.json();
          localStorage.setItem('accessToken', data.accessToken);
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />}/>
        <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" />}/>
        <Route path="*" element={<Navigate to={isAuthenticated ? '/chat' : '/auth'} />}/>
      </Routes>
    </Router>
  );
};

export default App;
