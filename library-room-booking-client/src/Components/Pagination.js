import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [...Array(totalPages).keys()].map(n => n + 1);

  return (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        &lt;&lt; Prev
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{ fontWeight: currentPage === page ? 'bold' : 'normal', margin: '0 5px' }}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;
