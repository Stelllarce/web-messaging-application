import React, { useState } from 'react';
import './AuthForm.css';

interface Props {
  onLogin: (username: string, password: string) => void;
}

const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="app-title">Instant Messenger</h1>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        required
        value={username}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Log In</button>
    </form>
  );
};

export default LoginForm;
