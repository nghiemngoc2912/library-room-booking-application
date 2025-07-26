import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, Pagination
} from '@mui/material';

const StudentNewsPage = () => {
  const [news, setNews] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(5);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchNews();
  }, [pageIndex, keyword, fromDate, toDate]);

  const fetchNews = async () => {
    const params = new URLSearchParams({
      pageIndex,
      pageSize,
      keyword,
      fromDate,
      toDate,
    });

    const res = await fetch(`https://localhost:7238/api/news/filter?${params.toString()}`, {
      credentials: 'include',
    });
    const data = await res.json();
    setNews(data.data);
    setTotalRecords(data.totalRecords);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        📰 News for Students
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search keyword"
          value={keyword}
          onChange={(e) => {
            setPageIndex(1);
            setKeyword(e.target.value);
          }}
        />
        <TextField
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => {
            setPageIndex(1);
            setFromDate(e.target.value);
          }}
        />
        <TextField
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => {
            setPageIndex(1);
            setToDate(e.target.value);
          }}
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Title</b></TableCell>
            <TableCell><b>Description</b></TableCell>
            <TableCell><b>Created Date</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {news.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.title}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.createdDate?.split('T')[0]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(totalRecords / pageSize)}
          page={pageIndex}
          onChange={(_, value) => setPageIndex(value)}
        />
      </Box>
    </Box>
  );
};

export default StudentNewsPage;
