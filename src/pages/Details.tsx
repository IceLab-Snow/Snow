import React from 'react';

export const getDetailsData = () => {
  return {};
};

const Details: React.FC = () => {
  const data = getDetailsData();
  return (
    <div>
      <h1>Details</h1>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};

export default Details;
