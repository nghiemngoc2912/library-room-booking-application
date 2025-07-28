
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../api/AuthAPI'; // Giả định API để gửi yêu cầu quên mật khẩu

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Vui lòng nhập email hợp lệ.');
      return;
    }

    try {
      const response = await forgotPassword(email);

      // Nếu đến đây là đã thành công rồi
      setSuccessMsg('Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Lỗi cụ thể từ server trả về
        setErrorMsg(err.response.data.message || 'Email không tồn tại hoặc đã gửi OTP rồi.');
      } else {
        setErrorMsg('Lỗi mạng. Vui lòng thử lại sau.');
      }
      console.error('Forgot password error:', err);
    }
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
        Quên Mật Khẩu
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        {errorMsg && (
          <p style={{ color: 'red', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p style={{ color: 'green', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {successMsg}
          </p>
        )}

        <input
          type="email"
          placeholder="Nhập email của bạn"
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
          Gửi Yêu Cầu
        </button>
        <button
          type="button"
          onClick={() => navigate('/login')}
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
          Quay lại Đăng Nhập
        </button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;