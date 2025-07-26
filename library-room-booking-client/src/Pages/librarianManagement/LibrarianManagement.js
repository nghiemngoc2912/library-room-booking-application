// src/pages/librarianManagement/LibrarianManagement.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LibrarianManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [staffPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    dob: '',
    code: ''
  });
  const [updateStaff, setUpdateStaff] = useState(null);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (searchTerm) params.append('keyword', searchTerm);
      if (statusFilter !== '') params.append('status', statusFilter === 'Active' ? 1 : 0);
      params.append('page', currentPage);
      params.append('pageSize', staffPerPage);

      const response = await fetch(`https://localhost:7238/api/LibrarianManage?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load staff list.');

      const data = await response.json();
      setStaff(data.items);
      setTotalItems(data.totalItems);
    } catch (err) {
      console.error(err);
      setError('Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [searchTerm, statusFilter, currentPage]);

  const validateForm = (formData) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.username)) {
      return 'Username must be a valid email address.';
    }
    if (formData.password && formData.password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return '';
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setFormError('');

    const validationError = validateForm(newStaff);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const response = await fetch('https://localhost:7238/api/LibrarianManage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newStaff),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create staff.');
      }

      alert('Staff created successfully!');
      setIsCreateModalOpen(false);
      setNewStaff({
        username: '',
        password: '',
        fullName: '',
        email: '',
        dob: '',
        code: ''
      });
      setCurrentPage(1);
      await fetchStaff();
    } catch (err) {
      console.error(err);
      setFormError(err.message);
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    setFormError('');

    const validationError = validateForm(updateStaff);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/LibrarianManage/${updateStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: updateStaff.username,
          password: updateStaff.password,
          fullName: updateStaff.fullName,
          email: updateStaff.email,
          dob: updateStaff.dob,
          code: updateStaff.code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update staff.');
      }

      alert('Staff updated successfully!');
      setIsUpdateModalOpen(false);
      setUpdateStaff(null);
      await fetchStaff();
    } catch (err) {
      console.error(err);
      setFormError(err.message);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const isActive = currentStatus === 'Active';
    const confirmMessage = isActive
      ? 'Are you sure you want to deactivate this staff account?'
      : 'Are you sure you want to activate this staff account?';

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      const response = await fetch('https://localhost:7238/api/LibrarianManage/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id, status: isActive ? 0 : 1 }),
      });

      if (!response.ok) throw new Error('Failed to update status.');

      alert('Status updated successfully!');
      await fetchStaff();
    } catch (err) {
      console.error(err);
      alert('Failed to update status!');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this staff account?');
    if (!confirmed) return;

    try {
      const response = await fetch(`https://localhost:7238/api/LibrarianManage/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete staff.');

      alert('Staff deleted successfully!');
      await fetchStaff();
    } catch (err) {
      console.error(err);
      alert('Failed to delete staff!');
    }
  };

  const openUpdateModal = (member) => {
    setUpdateStaff({
      id: member.id,
      username: member.username,
      password: '',
      fullName: member.fullName,
      email: member.email,
      dob: member.dob || '',
      code: member.code || ''
    });
    setFormError('');
    setIsUpdateModalOpen(true);
  };

  const totalPages = Math.ceil(totalItems / staffPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '2rem auto',
      padding: '2rem',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#1f2937',
      }}>
        👩‍💼 Staff Management
      </h1>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#218838')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#28a745')}
          >
            Add Staff
          </button>
          <select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              width: '200px',
              fontSize: '1rem',
              backgroundColor: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or code..."
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            width: '250px',
            fontSize: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.125rem', color: '#6b7280' }}>Loading...</p>
      ) : error ? (
        <p style={{ color: '#dc3545', textAlign: 'center', fontWeight: '600', fontSize: '1.125rem' }}>{error}</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: '600', color: '#374151' }}>
                  <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left', width: '10%' }}>ID</th>
                  <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left', width: '20%' }}>Username</th>
                  <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left', width: '25%' }}>Full Name</th>
                  <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left', width: '25%' }}>Email</th>
                  <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left', width: '10%' }}>Status</th>
                  <th style={{ padding: '1rem', border: '1px solid #dee2e6', textAlign: 'left', width: '10%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    style={{
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>{member.id}</td>
                    <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>{member.username}</td>
                    <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>{member.fullName}</td>
                    <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>{member.email}</td>
                    <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>
                      <button
                        onClick={() => handleStatusToggle(member.id, member.status)}
                        style={{
                          backgroundColor: member.status === 'Active' ? '#28a745' : '#dc3545',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = member.status === 'Active' ? '#1f7a38' : '#b91c1c')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = member.status === 'Active' ? '#28a745' : '#dc3545')}
                      >
                        {member.status}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', border: '1px solid #dee2e6' }}>
                      <button
                        onClick={() => openUpdateModal(member)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease',
                          marginRight: '0.5rem',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseOver={(e) => (e.target.style.backgroundColor = '#b91c1c')}
                        onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => paginate(page)}
                style={{
                  backgroundColor: currentPage === page ? '#3b82f6' : '#f8f9fa',
                  color: currentPage === page ? 'white' : '#374151',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (currentPage !== page) e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  if (currentPage !== page) e.target.style.backgroundColor = '#f8f9fa';
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}

      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            width: '450px',
            maxWidth: '90%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#1f2937',
            }}>
              Add New Staff
            </h2>
            {formError && (
              <p style={{
                color: '#dc3545',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                {formError}
              </p>
            )}
            <form onSubmit={handleCreateStaff}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Username (Email)
                </label>
                <input
                  type="email"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={newStaff.dob}
                  onChange={(e) => setNewStaff({ ...newStaff, dob: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Code
                </label>
                <input
                  type="text"
                  value={newStaff.code}
                  onChange={(e) => setNewStaff({ ...newStaff, code: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormError('');
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#5a6268')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#6c757d')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isUpdateModalOpen && updateStaff && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            width: '450px',
            maxWidth: '90%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#1f2937',
            }}>
              Update Staff
            </h2>
            {formError && (
              <p style={{
                color: '#dc3545',
                fontSize: '0.875rem',
                fontWeight: '500',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                {formError}
              </p>
            )}
            <form onSubmit={handleUpdateStaff}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Username (Email)
                </label>
                <input
                  type="email"
                  value={updateStaff.username}
                  onChange={(e) => setUpdateStaff({ ...updateStaff, username: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Password (Leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  value={updateStaff.password}
                  onChange={(e) => setUpdateStaff({ ...updateStaff, password: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={updateStaff.fullName}
                  onChange={(e) => setUpdateStaff({ ...updateStaff, fullName: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={updateStaff.email}
                  onChange={(e) => setUpdateStaff({ ...updateStaff, email: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={updateStaff.dob}
                  onChange={(e) => setUpdateStaff({ ...updateStaff, dob: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                  Code
                </label>
                <input
                  type="text"
                  value={updateStaff.code}
                  onChange={(e) => setUpdateStaff({ ...updateStaff, code: e.target.value })}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setFormError('');
                    setUpdateStaff(null);
                  }}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#5a6268')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#6c757d')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default LibrarianManagement;