import React from 'react';

export const getAdminBasicData = () => [];

const AdminBasic: React.FC = () => {
  const data = getAdminBasicData();
  return (
    <div>
      <h1>Admin Basic</h1>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};

export default AdminBasic;
