import React from 'react';

const SearchBar = ({ searchTerm, onSearch }) => (
  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
    <input
      type="text"
      placeholder="Search by code, name, email"
      value={searchTerm}
      onChange={e => onSearch(e.target.value)}
      style={{ width: '300px', padding: '8px' }}
    />
  </div>
);

export default SearchBar;
