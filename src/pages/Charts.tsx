import React from 'react';

export const getServerDonutData = () => [
  { name: 'Brial', value: 12500000, color: '#ff6b35' },
  { name: 'Hell Mina', value: 15800000, color: '#4CAF50' },
  { name: 'Draconiros', value: 9300000, color: '#2196F3' },
  { name: 'Salar', value: 7200000, color: '#FF9800' },
  { name: 'Orukam', value: 5400000, color: '#FFC107' }
];

export const getClassPerformanceData = () => [
  { class: 'Cra', efficiency: 85 },
  { class: 'Eniripsa', efficiency: 92 },
  { class: 'Sacrieur', efficiency: 78 },
  { class: 'Pandawa', efficiency: 88 },
  { class: 'Roublard', efficiency: 95 },
  { class: 'Xelor', efficiency: 72 }
];

const Charts: React.FC = () => {
  const serverData = getServerDonutData();
  const classData = getClassPerformanceData();

  return (
    <div>
      <h1>Charts</h1>
      <h2>Server distribution</h2>
      <pre>{JSON.stringify(serverData)}</pre>
      <h2>Class performance</h2>
      <pre>{JSON.stringify(classData)}</pre>
    </div>
  );
};

export default Charts;
