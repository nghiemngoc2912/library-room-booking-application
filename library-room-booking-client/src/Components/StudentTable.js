import React from 'react';

const StudentTable = ({ students }) => (
  <table border="1" style={{ width: '100%', textAlign: 'center' }}>
    <thead>
      <tr>
        <th>Student Name</th>
        <th>Code</th>
        <th>Email</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {students.length === 0 ? (
        <tr>
          <td colSpan="5">No students found.</td>
        </tr>
      ) : (
        students.map((student, idx) => (
          <tr key={idx}>
            <td>{student.fullName}</td>
            <td>{student.code || '-'}</td>
            <td>{student.email || '-'}</td>
            <td>{student.status}</td>
            <td>
              <button onClick={() => alert(`Viewing history for ${student.fullName}`)}>
                View History
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default StudentTable;
