import React, { useState, useEffect, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Select, DatePicker, message } from 'antd';
import { useAuth } from '../../App';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

ChartJS.register(ArcElement, Tooltip);

const { Option } = Select;

export default function AdminDashboard() {
  const [ratingData, setRatingData] = useState(null);
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState(null); // dayjs
  const [endDate, setEndDate] = useState(null); // dayjs
  const [error, setError] = useState(null);
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  const fetchRatingStatistics = useCallback(async () => {
    if (!role || role !== 3) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filter) params.append('period', filter);
      if (startDate) params.append('startDate', startDate.toDate().toISOString());
      if (endDate) params.append('endDate', endDate.toDate().toISOString());

      const response = await fetch(`https://localhost:7238/api/admin/statistics/ratings?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in as an admin');
        }
        throw new Error(errorData.message || `Failed to fetch ratings: ${response.statusText}`);
      }

      const ratingRes = await response.json();
      console.log('Rating API Response:', ratingRes);

      setRatingData({
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [{
          data: ratingRes.ratings,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }],
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const dataset = context.dataset;
                  const total = dataset.data.reduce((sum, value) => sum + (value || 0), 0);
                  const value = dataset.data[context.dataIndex] || 0;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${context.label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching rating statistics:', error.message);
      setError(error.message);
    }
  }, [filter, startDate, endDate, role, navigate]);

  const handleQuickSelect = (rangeType) => {
    const today = dayjs();
    let start;

    switch (rangeType) {
      case 'week':
        start = today.subtract(7, 'day');
        break;
      case 'month':
        start = today.subtract(1, 'month');
        break;
      case 'year':
        start = today.subtract(1, 'year');
        break;
      default:
        return;
    }

    if (start.isAfter(today)) {
      message.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      return;
    }

    setStartDate(start);
    setEndDate(today);
  };

  const handleStartDateChange = (date) => {
    if (date && endDate && date.isAfter(endDate)) {
      message.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      return;
    }
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (date && startDate && date.isBefore(startDate)) {
      message.error('Ngày kết thúc phải lớn hơn ngày bắt đầu');
      return;
    }
    setEndDate(date);
  };

  useEffect(() => {
    if (!loading) {
      fetchRatingStatistics();
    }
  }, [fetchRatingStatistics, loading]);

  if (loading) {
    return <div style={{ fontSize: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ fontSize: '20px', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Thống kê Admin</h2>

      {/* Bộ lọc thời gian */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ marginBottom: 15 }}>
          <button
            onClick={() => handleQuickSelect('week')}
            style={{
              marginRight: 15,
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s',
              transform: 'scale(1)',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#40a9ff';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#1890ff';
              e.target.style.transform = 'scale(1)';
            }}
          >
            1 tuần gần đây
          </button>
          <button
            onClick={() => handleQuickSelect('month')}
            style={{
              marginRight: 15,
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s',
              transform: 'scale(1)',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#40a9ff';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#1890ff';
              e.target.style.transform = 'scale(1)';
            }}
          >
            1 tháng gần đây
          </button>
          <button
            onClick={() => handleQuickSelect('year')}
            style={{
              marginRight: 15,
              padding: '10px 20px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.3s',
              transform: 'scale(1)',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#40a9ff';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#1890ff';
              e.target.style.transform = 'scale(1)';
            }}
          >
            1 năm gần đây
          </button>
        </div>
        <DatePicker
          value={startDate}
          onChange={handleStartDateChange}
          placeholder="Từ ngày"
          style={{ marginRight: 15, width: 200, height: 40, fontSize: '16px' }}
        />
        <DatePicker
          value={endDate}
          onChange={handleEndDateChange}
          placeholder="Đến ngày"
          style={{ width: 200, height: 40, fontSize: '16px' }}
        />
      </div>

      {/* Biểu đồ */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ flex: 1, maxWidth: 500 }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Đánh giá chất lượng phòng</h3>
          {ratingData && <Pie data={ratingData} />}
          <div style={{ marginTop: 25 }}>
            <h4 style={{ fontSize: '20px', fontWeight: 'bold' }}>Chú thích đánh giá:</h4>
            <ul style={{ listStyleType: 'none', paddingLeft: 0, fontSize: '18px' }}>
              <li><span style={{ color: '#FF6384', fontWeight: 'bold' }}>1★</span> – Không hài lòng</li>
              <li><span style={{ color: '#36A2EB', fontWeight: 'bold' }}>2★</span> – Dưới trung bình</li>
              <li><span style={{ color: '#FFCE56', fontWeight: 'bold' }}>3★</span> – Trung bình</li>
              <li><span style={{ color: '#4BC0C0', fontWeight: 'bold' }}>4★</span> – Hài lòng</li>
              <li><span style={{ color: '#9966FF', fontWeight: 'bold' }}>5★</span> – Rất hài lòng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}