import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/AuthAPI';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await login(email, password);
      const role = response.data.role;

      if (role != null) {
        navigate('/home');
      } else {
        setErrorMsg('Role không hợp lệ. Vui lòng liên hệ quản trị viên.');
      }
    } catch (err) {
      setErrorMsg('Tài khoản hoặc mật khẩu không đúng.');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #eee',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center',
      }}
    >
      <h1 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>Booking Room Library</h1>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#555' }}>
        Login to Your Account
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        {errorMsg && (
          <p style={{ color: 'red', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {errorMsg}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#007BFF',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleForgotPassword}
          style={{
            background: 'none',
            border: 'none',
            color: '#007BFF',
            fontSize: '0.9rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            marginTop: '0.5rem',
          }}
        >
          Forgot Password?
        </button>
      </form>
    </div>
  );
}

export default Login;