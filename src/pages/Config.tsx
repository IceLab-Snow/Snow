import React from 'react';

export const getConfigData = () => {
  return {};
};

const Config: React.FC = () => {
  const data = getConfigData();
  return (
    <div>
      <h1>Config</h1>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};

export default Config;
