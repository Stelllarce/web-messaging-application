import React, { useState } from 'react';
import './AuthForm.css';

interface Props {
  onRegister: (username: string, email: string, password: string) => void;
}

const RegisterForm: React.FC<Props> = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    onRegister(username, email, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1 className="app-title">Instant Messenger</h1>
      <h2>Register</h2>

      <input
        type="text"
        placeholder="Username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
