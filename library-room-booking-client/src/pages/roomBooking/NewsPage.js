import React, { useEffect, useState } from 'react';
import NewsTable from '../../Components/table/NewsTable';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Snackbar, Alert, TablePagination, TextField, Typography
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  getNewsList, createNews, updateNews, deleteNews
} from '../../api/NewsAPI';

const defaultForm = { id: 0, title: '', description: '', createdBy: 1 };

const NewsPage = () => {
  const [newsList, setNewsList] = useState([]);
  const [filter, setFilter] = useState({ keyword: '', pageIndex: 1, pageSize: 5 });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadNews = async () => {
    const res = await getNewsList({
      ...filter,
      fromDate: fromDate ? fromDate.toISOString() : null,
      toDate: toDate ? toDate.toISOString() : null
    });
    setNewsList(res.data);
    setTotal(res.totalRecords);
  };

  useEffect(() => { loadNews(); }, [filter, fromDate, toDate]);

  const handleSubmit = async () => {
    if (!form.title) return alert('Title is required!');
    if (form.id === 0) {
      await createNews(form);
      setSnackbar({ open: true, message: 'News created!', severity: 'success' });
    } else {
      await updateNews(form);
      setSnackbar({ open: true, message: 'News updated!', severity: 'info' });
    }
    setOpen(false);
    setForm(defaultForm);
    loadNews();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this news?')) {
      await deleteNews(id);
      setSnackbar({ open: true, message: 'News deleted!', severity: 'warning' });
      loadNews();
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>News Management</Typography>

      <Box mb={2} display="flex" gap={2} alignItems="center">
        <TextField
          label="Search"
          value={filter.keyword}
          onChange={e => setFilter({ ...filter, keyword: e.target.value, pageIndex: 1 })}
          fullWidth
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={setFromDate}
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={setToDate}
          />
        </LocalizationProvider>
        <Button variant="contained" onClick={loadNews}>Search</Button>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)} startIcon={<Add />}>
          Create News
        </Button>
      </Box>

      <NewsTable
        data={newsList}
        onEdit={(news) => { setForm(news); setOpen(true); }}
        onDelete={handleDelete}
      />

      <TablePagination
        component="div"
        count={total}
        page={filter.pageIndex - 1}
        rowsPerPage={filter.pageSize}
        onPageChange={(e, newPage) => setFilter({ ...filter, pageIndex: newPage + 1 })}
        onRowsPerPageChange={e =>
          setFilter({ ...filter, pageSize: parseInt(e.target.value), pageIndex: 1 })
        }
      />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{form.id === 0 ? 'Create News' : 'Update News'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            minRows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewsPage;
