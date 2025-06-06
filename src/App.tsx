import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Map from './pages/Map';
import Details from './pages/Details';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <Router>
      <nav>
        <Link to="/">Dashboard</Link> | <Link to="/charts">Charts</Link> |
        <Link to="/map">Map</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/map" element={<Map />} />
        <Route path="/details" element={<Details />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
