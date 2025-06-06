import React from 'react';

export const getMapData = () => {
  return [];
};

const Map: React.FC = () => {
  const data = getMapData();
  return (
    <div>
      <h1>Map</h1>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  );
};

export default Map;
