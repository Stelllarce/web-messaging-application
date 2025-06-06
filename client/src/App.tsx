import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatView from './pages/ChatPage';
import AuthPage from './pages/AuthPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // fake auth state for now

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />} />
        <Route path="/chat" element={isAuthenticated ? <ChatView /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} />
      </Routes>
    </Router>
  );
};

export default App;
