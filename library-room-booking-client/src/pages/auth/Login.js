import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/AuthAPI';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập sau khi reload
    const checkAuth = async () => {
      try {
        const response = await fetch('https://localhost:7238/api/auth/current-user', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const role = data.role;
          navigate(role === 3 ? '/admin' : '/home');
        }
      } catch (err) {
        // Không làm gì nếu chưa đăng nhập
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // Reset error

    try {
      const response = await login(email, password);
      const role = response.data.role; // Lấy role từ phản hồi API
      if (role === 3) {
        navigate('/admin');
      } else if (role === 1) {
        navigate('/home');
      } else {
        setErrorMsg('Role không hợp lệ.');
      }
    } catch (err) {
      setErrorMsg('Incorrect account or password.');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={styles.root}>
      <div className={styles.loginContainer}>
        <h1>Booking Room Library</h1>
        <h2>Login to Your Account</h2>

        <form onSubmit={handleSubmit}>
          {errorMsg && <p className={styles.errorText}>{errorMsg}</p>}

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
            className={styles.forgotPassword}
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;