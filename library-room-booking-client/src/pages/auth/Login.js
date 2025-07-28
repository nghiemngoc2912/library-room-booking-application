import React, { useState, useContext } from 'react';
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
      const data = response.data;

      if (data.success === false && data.status === 0) {
        setErrorMsg(data.message);
        return;
      }

      const { role, token, id } = data;

      if (role != null) {
        const parsedRole = parseInt(role, 10);
        setRole(parsedRole);
        localStorage.setItem('role', parsedRole);
        if (token) localStorage.setItem('authToken', token);
        if (id) localStorage.setItem('userId', id);

        console.log('Login successful, role:', parsedRole);
        navigate('/home', { replace: true });
      } else {
        setErrorMsg('Invalid role. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Incorrect email or password.');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return React.createElement(
    'div',
    {
      style: {
        maxWidth: 400,
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #eee',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center',
      },
    },
    [
      React.createElement('h1', { style: { marginBottom: '1rem', fontSize: '1.8rem' } }, 'Booking Room Library'),
      React.createElement('h2', { style: { marginBottom: '1.5rem', fontSize: '1.2rem', color: '#555' } }, 'Login to Your Account'),
      React.createElement(
        'form',
        { onSubmit: handleSubmit, style: { display: 'grid', gap: '1rem' } },
        [
          errorMsg && React.createElement('p', { style: { color: 'red', marginBottom: '0.5rem', fontWeight: 'bold' } }, errorMsg),
          React.createElement('input', {
            type: 'email',
            placeholder: 'Email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            style: {
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box',
            },
          }),
          React.createElement('input', {
            type: 'password',
            placeholder: 'Password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            style: {
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box',
            },
          }),
          React.createElement('button', {
            type: 'submit',
            style: {
              backgroundColor: '#007BFF',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              width: '100%',
            },
          }, 'Login'),
          React.createElement(
            'div',
            { style: { marginTop: '1rem', fontSize: '0.9rem', color: '#555' } },
            [
              React.createElement(
                'p',
                null,
                [
                  'If you don’t have an account, ',
                  React.createElement(
                    'span',
                    {
                      onClick: handleRegister,
                      style: { color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' },
                    },
                    'you can register here'
                  ),
                ]
              ),
              React.createElement(
                'p',
                null,
                [
                  'If you forgot your password, ',
                  React.createElement(
                    'span',
                    {
                      onClick: handleForgotPassword,
                      style: { color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' },
                    },
                    'click here'
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
    ]
  );
}

export default Login;