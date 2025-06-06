import React from 'react';

export const getStats = () => {
  return {
    botsOnline: 0,
    servers: 0,
  };
};

const Dashboard: React.FC = () => {
  const stats = getStats();
  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(stats)}</pre>
    </div>
  );
};

export default Dashboard;
