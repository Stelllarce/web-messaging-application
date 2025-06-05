import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (email: string, password: string) => {
    console.log('Login:', email, password);
    // Call your backend API and validate response
    onLoginSuccess();
  };

const handleRegister = (username: string, email: string, password: string) => {
  console.log('Registering:', { username, email, password });
  // Call your backend API here
  onLoginSuccess();
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
