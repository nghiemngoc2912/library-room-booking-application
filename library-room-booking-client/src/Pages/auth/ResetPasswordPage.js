import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/AuthAPI';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    console.log(token);
    if (!token) {
      setErrorMsg('Token không hợp lệ. Vui lòng kiểm tra liên kết.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      const response = await resetPassword(token, newPassword, confirmPassword);
      if (response.ok) {
        setSuccessMsg('Mật khẩu đã được đặt lại thành công. Chuyển hướng đến trang đăng nhập...');
        setTimeout(() => navigate('/login'), 3000); // Quay lại login sau 3 giây
      } else {
        setErrorMsg('Token hết hạn hoặc không hợp lệ. Vui lòng thử lại.');
      }
    } catch (err) {
      setErrorMsg('Lỗi mạng. Vui lòng thử lại sau.');
      console.error('Reset password error:', err);
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
        Đặt Lại Mật Khẩu
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
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          Đặt Lại Mật Khẩu
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

export default ResetPasswordPage;