import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import { storeUserIdFromApi } from '../utils/api';
import config from '../config';

const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // 👈 тук е магията

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      await storeUserIdFromApi();
      onLoginSuccess();
      navigate('/chat');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) throw new Error('Registration failed');

      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      await storeUserIdFromApi();
      onLoginSuccess();
      navigate('/chat');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isLogin ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <RegisterForm onRegister={handleRegister} />
      )}
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '1rem' }}>
        {isLogin ? 'Need an account? Register' : 'Already have an account? Log in'}
      </button>
    </div>
  );
};

export default AuthPage;
