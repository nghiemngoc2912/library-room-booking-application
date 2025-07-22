import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '5rem auto',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid #f5c6cb',
        borderRadius: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>401 - Unauthorized</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Bạn không có quyền truy cập vào đường dẫn này. Vui lòng kiểm tra lại quyền truy cập hoặc liên hệ quản trị viên.
      </p>
      <button
        onClick={handleBackToHome}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default Unauthorized;
