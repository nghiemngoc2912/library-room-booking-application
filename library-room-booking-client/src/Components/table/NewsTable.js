import React from 'react';
import {
  IconButton, Table, TableBody, TableCell,
  TableHead, TableRow
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const NewsTable = ({ data, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Created Date</TableCell>
          <TableCell>Title</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>By</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(news => (
          <TableRow key={news.id}>
            <TableCell>{new Date(news.createdDate).toLocaleString()}</TableCell>
            <TableCell>{news.title}</TableCell>
            <TableCell>{news.description}</TableCell>
            <TableCell>{news.createdByName}</TableCell>
            <TableCell>
              <IconButton onClick={() => onEdit(news)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => onDelete(news.id)}>
                <Delete />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default NewsTable;
