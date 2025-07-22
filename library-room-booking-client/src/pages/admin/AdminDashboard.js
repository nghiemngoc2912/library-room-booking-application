import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { Select, DatePicker, message } from 'antd';
import { useAuth } from '../../App';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip);

const { Option } = Select;

export default function AdminDashboard() {
  const [ratingData, setRatingData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState(null); // dayjs
  const [endDate, setEndDate] = useState(null); // dayjs
  const [error, setError] = useState(null);
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  // Aggregate booking data into weekly or monthly intervals
  const aggregateBookingData = (dates, counts, filterType, start, end) => {
    const aggregated = {};
    const rangeDays = end && start ? end.diff(start, 'day') : 30;

    // Choose aggregation type: weekly for short ranges (<= 60 days), monthly for longer
    const isMonthly = filterType === 'year' || rangeDays > 60;

    dates.forEach((date, index) => {
      const day = dayjs(date);
      let key;

      if (isMonthly) {
        // Aggregate by month (YYYY-MM)
        key = day.format('YYYY-MM');
      } else {
        // Aggregate by week (starting Monday)
        const weekStart = day.startOf('week');
        key = weekStart.format('YYYY-MM-DD');
      }

      aggregated[key] = (aggregated[key] || 0) + (counts[index] || 0);
    });

    const newLabels = Object.keys(aggregated).sort();
    const newCounts = newLabels.map((key) => aggregated[key]);

    return {
      labels: newLabels.map((key) => (isMonthly ? key : `Tuần ${dayjs(key).week()}`)),
      counts: newCounts,
    };
  };

  const fetchStatistics = useCallback(async () => {
    if (!role || role !== 3) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const params = new URLSearchParams();
      if (filter) params.append('period', filter);
      if (startDate) params.append('startDate', startDate.toDate().toISOString());
      if (endDate) params.append('endDate', endDate.toDate().toISOString());

      // Fetch rating statistics
      const ratingResponse = await fetch(`https://localhost:7238/api/admin/statistics/ratings?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!ratingResponse.ok) {
        const errorData = await ratingResponse.json().catch(() => ({}));
        if (ratingResponse.status === 401) {
          throw new Error('Unauthorized: Please log in as an admin');
        }
        throw new Error(errorData.message || `Failed to fetch ratings: ${ratingResponse.statusText}`);
      }

      const ratingRes = await ratingResponse.json();
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

      // Fetch booking statistics
      const bookingResponse = await fetch(`https://localhost:7238/api/admin/statistics/bookings?${params}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        if (bookingResponse.status === 401) {
          throw new Error('Unauthorized: Please log in as an admin');
        }
        throw new Error(errorData.message || `Failed to fetch bookings: ${bookingResponse.statusText}`);
      }

      const bookingRes = await bookingResponse.json();
      console.log('Booking API Response:', bookingRes);

      const { labels, counts } = aggregateBookingData(bookingRes.dates, bookingRes.counts, filter, startDate, endDate);

      setBookingData({
        labels,
        datasets: [{
          label: 'Số lượng đặt phòng',
          data: counts,
          backgroundColor: '#1890ff',
          borderColor: '#40a9ff',
          borderWidth: 1,
        }],
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Số lượng',
                font: { size: 16 },
              },
            },
            x: {
              title: {
                display: true,
                text: filter === 'year' ? 'Tháng' : 'Tuần/Ngày',
                font: { size: 16 },
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.raw}`;
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching statistics:', error.message);
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
    setFilter(rangeType);
  };

  const handleStartDateChange = (date) => {
    if (date && endDate && date.isAfter(endDate)) {
      message.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
      return;
    }
    setStartDate(date);
    setFilter(null); // Clear filter for custom date range
  };

  const handleEndDateChange = (date) => {
    if (date && startDate && date.isBefore(startDate)) {
      message.error('Ngày kết thúc phải lớn hơn ngày bắt đầu');
      return;
    }
    setEndDate(date);
    setFilter(null); // Clear filter for custom date range
  };

  useEffect(() => {
    if (!loading) {
      fetchStatistics();
    }
  }, [fetchStatistics, loading]);

  if (loading) {
    return <div style={{ fontSize: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ fontSize: '20px', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: 30 }}>
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Thống kê Admin</h2>

      {/* Bộ lọc thời gian */}
      <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'center', gap: '15px' }}>
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
        <div style={{ display: 'flex', gap: '15px' }}>
          <DatePicker
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="Từ ngày"
            style={{ width: 200, height: 40, fontSize: '16px' }}
          />
          <DatePicker
            value={endDate}
            onChange={handleEndDateChange}
            placeholder="Đến ngày"
            style={{ width: 200, height: 40, fontSize: '16px' }}
          />
        </div>
      </div>

      {/* Biểu đồ */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        {/* Pie Chart */}
        <div style={{ flex: 1, minWidth: 300, maxWidth: 400 }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
            Đánh giá chất lượng phòng
          </h3>
          {ratingData && <Pie data={ratingData} />}
          <div style={{ marginTop: 25 }}>
            <h4 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>Chú thích đánh giá:</h4>
            <ul style={{ listStyleType: 'none', paddingLeft: 0, fontSize: '18px', textAlign: 'center' }}>
              <li><span style={{ color: '#FF6384', fontWeight: 'bold' }}>1★</span> – Không hài lòng</li>
              <li><span style={{ color: '#36A2EB', fontWeight: 'bold' }}>2★</span> – Dưới trung bình</li>
              <li><span style={{ color: '#FFCE56', fontWeight: 'bold' }}>3★</span> – Trung bình</li>
              <li><span style={{ color: '#4BC0C0', fontWeight: 'bold' }}>4★</span> – Hài lòng</li>
              <li><span style={{ color: '#9966FF', fontWeight: 'bold' }}>5★</span> – Rất hài lòng</li>
            </ul>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={{ flex: 1, minWidth: 400, maxWidth: 600 }}>
          <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
            Thống kê đặt phòng
          </h3>
          {bookingData && <Bar data={bookingData} />}
          <div style={{ marginTop: 25 }}>
            <h4 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>Chú thích:</h4>
            <ul style={{ listStyleType: 'none', paddingLeft: 0, fontSize: '18px', textAlign: 'center' }}>
              <li><span style={{ color: '#1890ff', fontWeight: 'bold' }}>Cột</span> – Số lượng đặt phòng theo {filter === 'year' ? 'tháng' : 'tuần'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}