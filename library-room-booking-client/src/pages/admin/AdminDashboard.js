import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement } from 'chart.js';
import DatePicker from '../../Components/date/BookingDatePickerAdmin';
import { Select } from 'antd';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement);

const { Option } = Select;

export default function AdminDashboard() {
  const [bookingData, setBookingData] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fetchStatistics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.append('period', filter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [bookingRes, ratingRes, usageRes] = await Promise.all([
        fetch(`/api/admin/statistics/bookings?${params}`).then(res => res.json()),
        fetch(`/api/admin/statistics/ratings?${params}`).then(res => res.json()),
        fetch(`/api/admin/statistics/usage?${params}`).then(res => res.json()),
      ]);

      setBookingData({
        labels: bookingRes.dates,
        datasets: [{
          label: 'Số lượt đặt phòng',
          data: bookingRes.counts,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        }]
      });

      setRatingData({
        labels: ['1★', '2★', '3★', '4★', '5★'],
        datasets: [{
          data: ratingRes.ratings,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      });

      setUsageData({
        labels: usageRes.dates,
        datasets: [{
          label: 'Thời gian sử dụng (giờ)',
          data: usageRes.durations,
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.3
        }]
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [filter, startDate, endDate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Thống kê Admin</h2>
      <div style={{ marginBottom: 20 }}>
        <Select value={filter} onChange={setFilter} style={{ width: 120, marginRight: 10 }}>
          <Option value="week">Tuần</Option>
          <Option value="month">Tháng</Option>
          <Option value="year">Năm</Option>
        </Select>
        <DatePicker value={startDate} onChange={setStartDate} placeholder="Từ ngày" style={{ marginRight: 10 }} />
        <DatePicker value={endDate} onChange={setEndDate} placeholder="Đến ngày" />
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h3>Số lượng đặt phòng</h3>
          {bookingData && <Bar data={bookingData} />}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Đánh giá chất lượng phòng</h3>
          {ratingData && <Pie data={ratingData} />}
        </div>

        <div style={{ flex: 1 }}>
          <h3>Thời gian sử dụng phòng</h3>
          {usageData && <Line data={usageData} />}
        </div>
      </div>
    </div>
  );
}
