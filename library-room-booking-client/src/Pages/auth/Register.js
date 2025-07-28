import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, verifyOtp } from '../../api/AuthAPI';
import axios from 'axios';

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dob: '',
  });
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.email) return 'Email is required.';
    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters long.';
    if (!formData.confirmPassword) return 'Confirm Password is required.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    if (!formData.fullName) return 'Full Name is required.';
    if (!formData.dob) return 'Date of Birth is required.';
    
    const today = new Date();
    const dob = new Date(formData.dob);
    const maxValidDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    
    if (dob > today) return 'Date of Birth cannot be in the future.';
    if (dob > maxValidDate) return 'You must be at least 18 years old.';
    
    return '';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      setIsLoading(false);
      return;
    }

    try {
      await register({
        username: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        dob: formData.dob,
      });
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await verifyOtp(formData.email, otp);
      setSuccessMsg('You have successfully registered! Redirecting to login in 2 seconds...');
      setTimeout(() => {
        navigate('/login', { state: { successMsg: 'Registration successful! Please log in.' } });
      }, 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid OTP code.');
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsResendLoading(true);

    try {
      const response = await axios.post('/api/auth/resend-otp', { username: formData.email });
      setSuccessMsg(response.data.message);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResendLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/login');
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
        {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
      </h2>

      {step === 1 ? (
        <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1rem' }}>
          {errorMsg && (
            <p style={{ color: 'red', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {errorMsg}
            </p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
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
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#007BFF',
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
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
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                color: '#007BFF',
              }}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            disabled={isLoading}
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
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            required
            disabled={isLoading}
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#6c757d' : '#007BFF',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      border: '2px solid #fff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px',
                    }}
                  ></span>
                  Sending OTP...
                </>
              ) : (
                'Register'
              )}
            </button>
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#6c757d' : '#007BFF',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              Back to Login
            </button>
          </div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: 'grid', gap: '1rem' }}>
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
          <p style={{ color: '#555', marginBottom: '1rem' }}>
            Please enter the OTP sent to {formData.email}
          </p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
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
          <div style={{ display: 'flex', gap: '1rem' }}>
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
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={handleBack}
              style={{
                backgroundColor: '#007BFF',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              Back to Login
            </button>
          </div>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResendLoading}
            style={{
              backgroundColor: isResendLoading ? '#6c757d' : '#007BFF',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '1rem',
              cursor: isResendLoading ? 'not-allowed' : 'pointer',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {isResendLoading ? (
              <>
                <span
                  style={{
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px',
                  }}
                ></span>
                Sending...
              </>
            ) : (
              'Resend OTP'
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default Register;