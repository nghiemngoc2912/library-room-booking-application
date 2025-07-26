import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/AuthAPI';
import { useAuth } from '../../App';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await login(email, password);
      const { role, id } = response.data;
      if (role != null) {
        const parsedRole = parseInt(role, 10);
        setRole(parsedRole);
        localStorage.setItem('role', parsedRole);
        if (id) {
          localStorage.setItem('userId', id);
        }
        console.log('Login successful, role:', parsedRole);
        navigate('/home', { replace: true });
      } else {
        setErrorMsg('Invalid role. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      if (err.response?.status === 401 && err.response?.data?.message === 'Account is locked and cannot log in.') {
        setErrorMsg('Account is locked and cannot log in.');
      } else if (err.response?.status === 401) {
        setErrorMsg('Invalid username or password.');
      } else {
        setErrorMsg('An error occurred during login. Please try again.');
      }
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          marginBottom: '1rem',
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#1f2937',
        }}
      >
        Booking Room Library
      </h1>
      <h2
        style={{
          marginBottom: '1.5rem',
          fontSize: '1.2rem',
          fontWeight: '500',
          color: '#374151',
        }}
      >
        Login to Your Account
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        {errorMsg && (
          <p
            style={{
              color: '#dc3545',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}
          >
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
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
        >
          Login
        </button>
        <button
          type="button"
          onClick={handleForgotPassword}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontSize: '0.875rem',
            fontWeight: '500',
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