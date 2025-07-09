import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/AuthAPI'; // Đảm bảo đường dẫn này đúng
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); // Reset error

    try {
      const response = await login(email, password);
      const role = response.data.role; // Lấy role từ phản hồi API

      if (role != null) {
        navigate('/home'); 
      }
      else {
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
