import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement } from 'chart.js';
import DatePicker from '../../Components/date/BookingDatePickerAdmin';
import { Select } from 'antd';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement);

const { Option } = Select;

export default function AdminDashboard() {
  const [bookingData, setBookingData] = useState({ labels: [], datasets: [] });
  const [ratingData, setRatingData] = useState({ labels: [], datasets: [] });
  const [usageData, setUsageData] = useState({ labels: [], datasets: [] });
  const [filter, setFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStatistics = useCallback(async () => {
    const params = new URLSearchParams({ period: filter, startDate, endDate }).toString();
    const [bookingRes, ratingRes, usageRes] = await Promise.all([
      fetch(`/api/admin/statistics/bookings?${params}`).then(res => res.json()),
      fetch(`/api/admin/statistics/ratings?${params}`).then(res => res.json()),
      fetch(`/api/admin/statistics/usage?${params}`).then(res => res.json()),
    ]);

    setBookingData({
      labels: bookingRes.dates,
      datasets: [{ label: 'Số lượng đặt phòng', data: bookingRes.counts, backgroundColor: 'rgba(75,192,192,0.4)' }],
    });

    setRatingData({
      labels: ['1', '2', '3', '4', '5'],
      datasets: [{ data: ratingRes.ratings, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }],
    });

    setUsageData({
      labels: usageRes.dates,
      datasets: [{ label: 'Thời gian sử dụng (giờ)', data: usageRes.durations, fill: false, borderColor: 'rgb(75,192,192)', tension: 0.1 }],
    });
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
        <DatePicker value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginRight: 10 }} />
        <DatePicker value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}><h3>Số lượng sinh viên đặt phòng</h3><Bar data={bookingData} /></div>
        <div style={{ flex: 1 }}><h3>Đánh giá chất lượng phòng</h3><Pie data={ratingData} /></div>
        <div style={{ flex: 1 }}><h3>Thời gian sử dụng phòng</h3><Line data={usageData} /></div>
      </div>
    </div>
  );
}