import React from 'react';

export const getAdminOptiData = () => [];

const AdminOpti: React.FC = () => {
  const data = getAdminOptiData();
  return (
    <div>
      <h1>Admin Opti</h1>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};

export default AdminOpti;
