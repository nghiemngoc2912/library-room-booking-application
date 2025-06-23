import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/AuthAPI';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.token);
      alert('Login successful!');
      navigate('/home');
    } catch (err) {
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleForgotPassword = () => {
    alert('Redirecting to password reset page...');
    navigate('/forgot-password'); // Adjust the route as needed
  };

  return (
    <div className="login-container">
      <h1>Booking Room Library</h1>
      <h2>Login to Your Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <button
          type="button"
          className="forgot-password"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  );
}

export default Login;