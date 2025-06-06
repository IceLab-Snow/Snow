import React from 'react';

export const getKolizeumData = () => [];

const Kolizeum: React.FC = () => {
  const data = getKolizeumData();
  return (
    <div>
      <h1>Kolizeum</h1>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};

export default Kolizeum;
