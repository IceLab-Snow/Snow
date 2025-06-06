import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { RefreshCw, Settings, Bell, LogOut } from 'lucide-react';

// Configuration API
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com',
  endpoints: {
    charts: {
      metrics: '/charts/metrics',
      serverDistribution: '/charts/servers',
      classPerformance: '/charts/classes',
      efficiency: '/charts/efficiency',
      trends: '/charts/trends',
      heatmap: '/charts/heatmap',
      timeline: '/charts/timeline'
    }
  }
};

// Interfaces
interface User {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

interface Metrics {
  kamasPerMinute: number;
  globalEfficiency: number;
  nextMaintenance: string;
  dailyROI: number;
}

const ChartsPage: React.FC = () => {
  // Utilisateur de test pour la démo
  const [user] = useState<User>({
    id: '1',
    username: 'admin',
    role: 'administrator',
    permissions: ['view_all', 'manage_bots', 'view_analytics', 'view_own']
  });

  const [metrics, setMetrics] = useState<Metrics>({
    kamasPerMinute: 42567,
    globalEfficiency: 87.3,
    nextMaintenance: '03:42',
    dailyROI: 18.5
  });

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState('24h');

  // Mise à jour des métriques toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      updateMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadChartData();
  }, [activeTimeFilter]);

  const updateMetrics = () => {
    // Simulation de mise à jour en temps réel
    setMetrics({
      kamasPerMinute: Math.floor(Math.random() * 50000 + 30000),
      globalEfficiency: Number((Math.random() * 20 + 80).toFixed(1)),
      nextMaintenance: '03:42',
      dailyROI: Number((Math.random() * 10 + 15).toFixed(1))
    });
  };

  const loadChartData = async () => {
    setIsLoading(true);
    try {
      // TODO: Remplacer par les appels API réels
      // const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.charts.metrics}?period=${activeTimeFilter}`, {
      //   headers: {
      //     'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      //   }
      // });
      // const data = await response.json();
      
      // Simulation du chargement
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Erreur chargement des graphiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadChartData();
    await updateMetrics();
    setRefreshing(false);
  };

  // Données pour le graphique en anneau - Répartition par serveur
  // NOTE: Ces noms de serveurs sont fictifs et seront remplacés par les vrais noms via l'API
  const serverDonutData = [
    { name: 'Brial', value: 12500000, color: '#ff6b35' },
    { name: 'Hell Mina', value: 15800000, color: '#4CAF50' },
    { name: 'Draconiros', value: 9300000, color: '#2196F3' },
    { name: 'Salar', value: 7200000, color: '#FF9800' },
    { name: 'Orukam', value: 5400000, color: '#FFC107' }
  ];

  // Données pour le graphique polaire - Performance par classe
  const classPerformanceData = [
    { class: 'Cra', efficiency: 85 },
    { class: 'Eniripsa', efficiency: 92 },
    { class: 'Sacrieur', efficiency: 78 },
    { class: 'Pandawa', efficiency: 88 },
    { class: 'Roublard', efficiency: 95 },
    { class: 'Xelor', efficiency: 72 }
  ];

  // Données pour le graphique de rentabilité par heure
  const profitabilityData = [
    { hour: '0h', kamas: 18000000, roses: 250000, bourses: 1200 },
    { hour: '4h', kamas: 22000000, roses: 310000, bourses: 1800 },
    { hour: '8h', kamas: 35000000, roses: 450000, bourses: 2500 },
    { hour: '12h', kamas: 42000000, roses: 520000, bourses: 3200 },
    { hour: '16h', kamas: 38000000, roses: 480000, bourses: 2900 },
    { hour: '20h', kamas: 29000000, roses: 360000, bourses: 2100 },
    { hour: '24h', kamas: 34000000, roses: 420000, bourses: 2600 }
  ];

  // Données pour le graphique mixte - Tendances
  const mixedTrendsData = [
    { time: '00h', kamas: 1200000, bots: 45, efficiency: 82 },
    { time: '04h', kamas: 1800000, bots: 42, efficiency: 85 },
    { time: '08h', kamas: 3200000, bots: 38, efficiency: 88 },
    { time: '12h', kamas: 4500000, bots: 52, efficiency: 92 },
    { time: '16h', kamas: 3800000, bots: 50, efficiency: 87 },
    { time: '20h', kamas: 2900000, bots: 48, efficiency: 84 }
  ];

  // Données pour le tableau de comparaison
  const comparisonData = [
    { name: 'CraBot-01', kamasH: 234567, rosesH: 3456, fightsH: 45, efficiency: 92, status: 'online' },
    { name: 'EniBot-02', kamasH: 345678, rosesH: 4567, fightsH: 52, efficiency: 95, status: 'fighting' },
    { name: 'SacriBot-03', kamasH: 189234, rosesH: 2345, fightsH: 38, efficiency: 78, status: 'offline' },
    { name: 'PandaBot-04', kamasH: 298456, rosesH: 3789, fightsH: 48, efficiency: 88, status: 'online' },
    { name: 'RoublBot-05', kamasH: 412345, rosesH: 5123, fightsH: 58, efficiency: 98, status: 'fighting' }
  ];

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  const formatKamas = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return '#4CAF50';
    if (efficiency >= 70) return '#FF9800';
    return '#F44336';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      online: 'En ligne',
      fighting: 'En combat',
      offline: 'Hors ligne'
    };
    return texts[status] || status;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      lineHeight: '1.6',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 107, 53, 0.05) 0%, transparent 50%)'
    }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px' }}>
        {/* Header avec navigation et actions utilisateur */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: '15px',
          padding: '20px 30px',
          marginBottom: '30px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src="https://i.imgur.com/CIA4ZyD.png" 
              alt="Snow Stats Lab Logo"
              style={{
                width: '50px',
                height: '50px',
                filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'
              }}
            />
            <div>
              <h1 style={{
                fontSize: '2em',
                margin: 0,
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                SnowLab Dashboard
              </h1>
              <p style={{ color: '#888', fontSize: '0.9em', margin: '5px 0 0 0' }}>
                Visualisations avancées et analytics
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user && (
              <div style={{
                background: '#252525',
                padding: '8px 15px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.2em',
                  color: '#000'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{user.username}</div>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>{user.role}</div>
                </div>
              </div>
            )}
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              style={{
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease'
              }}
              title="Rafraîchir les données"
            >
              <RefreshCw size={18} style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }} />
            </button>
            
            <button
              style={{
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff6b35',
                width: '8px',
                height: '8px',
                borderRadius: '50%'
              }} />
            </button>
            
            <button
              style={{
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '10px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease'
              }}
              title="Paramètres"
            >
              <Settings size={18} />
            </button>
            
            <button
              style={{
                background: 'linear-gradient(135deg, #F44336, #D32F2F)',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          {[
            { name: 'Vue d\'ensemble', icon: '📊', permission: 'view_analytics' },
            { name: 'Détails', icon: '📝', permission: 'view_analytics' },
            { name: 'Graphiques', icon: '📈', permission: 'view_analytics' },
            { name: 'Kolizéum', icon: '⚔️', permission: 'view_analytics' },
            { name: 'Map', icon: '🗺️', permission: 'view_analytics' },
            { name: 'Administration', icon: '🛡️', permission: 'manage_bots' }
          ]
            .filter(tab => user?.permissions?.includes(tab.permission))
            .map((tab, idx) => (
              <button
                key={idx}
                style={{
                  padding: '12px 24px',
                  background: tab.name === 'Graphiques' ? '#ff6b35' : '#1a1a1a',
                  border: tab.name === 'Graphiques' ? '2px solid #ff6b35' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  color: tab.name === 'Graphiques' ? '#000' : '#fff',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                title={tab.name === 'Administration' ? 'Réservé aux administrateurs' : ''}
                onMouseEnter={(e) => {
                  if (tab.name !== 'Graphiques') {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#ff6b35';
                    e.currentTarget.style.color = '#ff6b35';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab.name !== 'Graphiques') {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
        </div>

        {/* Métriques en temps réel */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ color: '#888', fontSize: '0.9em' }}>Kamas/Minute</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0', color: '#ff6b35' }}>
              <span>{formatNumber(metrics.kamasPerMinute)}</span>
            </div>
            <div style={{ color: '#888', fontSize: '0.9em' }}>En temps réel</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ color: '#888', fontSize: '0.9em' }}>Efficacité Globale</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0', color: '#4CAF50' }}>
              <span>{metrics.globalEfficiency}</span>%
            </div>
            <div style={{ color: '#888', fontSize: '0.9em' }}>Moyenne 24h</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ color: '#888', fontSize: '0.9em' }}>Prochaine Maintenance</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0', color: '#2196F3' }}>
              <span>{metrics.nextMaintenance}</span>
            </div>
            <div style={{ color: '#888', fontSize: '0.9em' }}>Temps restant</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ color: '#888', fontSize: '0.9em' }}>ROI Journalier</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', margin: '10px 0', color: '#ff6b35' }}>
              <span>{metrics.dailyROI}</span>%
            </div>
            <div style={{ color: '#888', fontSize: '0.9em' }}>Retour sur invest.</div>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Graphique en anneau - Répartition par serveur */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333',
            position: 'relative',
            height: '400px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              height: '40px'
            }}>
              <h3 style={{ fontSize: '1.3em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5em' }}>🍩</span>
                Répartition des Kamas par Serveur
              </h3>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', 
                            boxShadow: '0 0 6px #4CAF50', animation: 'pulse 2s infinite' }}></span>
            </div>
            <div style={{ position: 'relative', height: 'calc(100% - 60px)', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serverDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                  >
                    {serverDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatNumber(Number(value)) + ' kamas'} 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique polaire - Performance par classe */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333',
            position: 'relative',
            height: '400px'
          }}>
            <div style={{ marginBottom: '20px', height: '40px' }}>
              <h3 style={{ fontSize: '1.3em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5em' }}>🎯</span>
                Performance par Classe
              </h3>
            </div>
            <div style={{ position: 'relative', height: 'calc(100% - 60px)', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={classPerformanceData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="class" stroke="#999" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#999" />
                  <Radar name="Efficacité" dataKey="efficiency" stroke="#ff6b35" fill="#ff6b35" fillOpacity={0.7} />
                  <Tooltip 
                    formatter={(value) => value + '%'} 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique de rentabilité par heure */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333',
            position: 'relative',
            height: '400px'
          }}>
            <div style={{ marginBottom: '20px', height: '40px' }}>
              <h3 style={{ fontSize: '1.3em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5em' }}>💹</span>
                Rentabilité Moyenne par Heure
              </h3>
            </div>
            <div style={{ position: 'relative', height: 'calc(100% - 60px)', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitabilityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#999" />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#ff6b35"
                    tickFormatter={(value) => formatKamas(value)}
                    label={{ value: 'Kamas', angle: -90, position: 'insideLeft', style: { fill: '#ff6b35' } }}
                  />
                  <YAxis 
                    yAxisId="middle" 
                    orientation="right" 
                    stroke="#ff1744"
                    tickFormatter={(value) => formatKamas(value)}
                    label={{ value: 'Roses', angle: 90, position: 'insideRight', style: { fill: '#ff1744' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#FFC107"
                    tickFormatter={(value) => formatNumber(value)}
                    label={{ value: 'Bourses', angle: 90, position: 'outsideRight', style: { fill: '#FFC107' } }}
                    hide
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'kamas') return [formatNumber(value) + ' kamas', 'Kamas moyens'];
                      if (name === 'roses') return [formatNumber(value) + ' roses', 'Roses moyennes'];
                      if (name === 'bourses') return [formatNumber(value) + ' bourses', 'Bourses moyennes'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="kamas" 
                    stroke="#ff6b35" 
                    strokeWidth={3}
                    name="Kamas moyens"
                    dot={{ fill: '#ff6b35', r: 4 }}
                  />
                  <Line 
                    yAxisId="middle" 
                    type="monotone" 
                    dataKey="roses" 
                    stroke="#ff1744" 
                    strokeWidth={3}
                    name="Roses moyennes"
                    dot={{ fill: '#ff1744', r: 4 }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="bourses" 
                    stroke="#FFC107" 
                    strokeWidth={3}
                    name="Bourses moyennes"
                    strokeDasharray="5 5"
                    dot={{ fill: '#FFC107', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{
              marginTop: '10px',
              fontSize: '0.85em',
              color: '#888',
              textAlign: 'center'
            }}>
              💡 Échelles : Kamas (0-500M) • Roses (0-3M) • Bourses (0-5K)
            </div>
          </div>

          {/* Graphique mixte - Tendances */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333',
            position: 'relative',
            height: '400px'
          }}>
            <div style={{ marginBottom: '20px', height: '40px' }}>
              <h3 style={{ fontSize: '1.3em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5em' }}>📈</span>
                Tendances Multi-Métriques
              </h3>
            </div>
            <div style={{ position: 'relative', height: 'calc(100% - 60px)', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mixedTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#999" />
                  <YAxis yAxisId="left" stroke="#999" tickFormatter={(value) => formatKamas(value)} />
                  <YAxis yAxisId="right" orientation="right" stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="kamas" fill="#ff6b35" opacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="bots" stroke="#4CAF50" strokeWidth={3} dot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#2196F3" strokeWidth={3} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NOUVEAU - Graphique Inventaire */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333',
            position: 'relative',
            height: '400px'
          }}>
            <div style={{ marginBottom: '20px', height: '40px' }}>
              <h3 style={{ fontSize: '1.3em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5em' }}>📦</span>
                Valeur d'Inventaire par Serveur
              </h3>
            </div>
            <div style={{ position: 'relative', height: 'calc(100% - 60px)', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { server: 'Brial', value: 5800000, items: 12450 },
                  { server: 'Hell Mina', value: 8200000, items: 18900 },
                  { server: 'Draconiros', value: 4500000, items: 9800 },
                  { server: 'Salar', value: 6200000, items: 14500 },
                  { server: 'Orukam', value: 3800000, items: 8200 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="server" stroke="#999" />
                  <YAxis stroke="#999" tickFormatter={(value) => formatKamas(value)} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'value') return [formatNumber(value) + ' kamas', 'Valeur totale'];
                      if (name === 'items') return [formatNumber(value), 'Nombre d\'items'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="value" fill="#9C27B0">
                    {[0,1,2,3,4].map((index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#9C27B0' : '#7B1FA2'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{
              marginTop: '10px',
              fontSize: '0.85em',
              color: '#888',
              textAlign: 'center'
            }}>
              💡 Valeur totale des inventaires: {formatKamas(28500000)} kamas
            </div>
          </div>

          {/* NOUVEAU - Graphique Patrimoine */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333',
            position: 'relative',
            height: '400px'
          }}>
            <div style={{ marginBottom: '20px', height: '40px' }}>
              <h3 style={{ fontSize: '1.3em', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5em' }}>🏰</span>
                Patrimoine Total (Kamas + Inventaire)
              </h3>
            </div>
            <div style={{ position: 'relative', height: 'calc(100% - 60px)', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { server: 'Brial', kamas: 12500000, inventory: 5800000, total: 18300000 },
                  { server: 'Hell Mina', kamas: 15800000, inventory: 8200000, total: 24000000 },
                  { server: 'Draconiros', kamas: 9300000, inventory: 4500000, total: 13800000 },
                  { server: 'Salar', kamas: 7200000, inventory: 6200000, total: 13400000 },
                  { server: 'Orukam', kamas: 5400000, inventory: 3800000, total: 9200000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="server" stroke="#999" />
                  <YAxis stroke="#999" tickFormatter={(value) => formatKamas(value)} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'kamas') return [formatNumber(value) + ' kamas', 'Kamas liquides'];
                      if (name === 'inventory') return [formatNumber(value) + ' kamas', 'Valeur inventaire'];
                      if (name === 'total') return [formatNumber(value) + ' kamas', 'Patrimoine total'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="kamas" stackId="a" fill="#ff6b35" name="Kamas liquides" />
                  <Bar dataKey="inventory" stackId="a" fill="#9C27B0" name="Valeur inventaire" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{
              marginTop: '10px',
              fontSize: '0.85em',
              color: '#888',
              textAlign: 'center'
            }}>
              💎 Patrimoine global: {formatKamas(78700000)} kamas ({formatKamas(50200000)} liquide + {formatKamas(28500000)} inventaire)
            </div>
          </div>
        </div>

        {/* Tableau de comparaison */}
        <table style={{
          width: '100%',
          background: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
          marginTop: '20px'
        }}>
          <thead>
            <tr>
              <th style={{ background: '#252525', padding: '12px', textAlign: 'left', borderBottom: '1px solid #333', fontWeight: '600', color: '#ff6b35' }}>Personnage</th>
              <th style={{ background: '#252525', padding: '12px', textAlign: 'left', borderBottom: '1px solid #333', fontWeight: '600', color: '#ff6b35' }}>Kamas/h</th>
              <th style={{ background: '#252525', padding: '12px', textAlign: 'left', borderBottom: '1px solid #333', fontWeight: '600', color: '#ff6b35' }}>Roses/h</th>
              <th style={{ background: '#252525', padding: '12px', textAlign: 'left', borderBottom: '1px solid #333', fontWeight: '600', color: '#ff6b35' }}>Combats/h</th>
              <th style={{ background: '#252525', padding: '12px', textAlign: 'left', borderBottom: '1px solid #333', fontWeight: '600', color: '#ff6b35' }}>Efficacité</th>
              <th style={{ background: '#252525', padding: '12px', textAlign: 'left', borderBottom: '1px solid #333', fontWeight: '600', color: '#ff6b35' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((bot, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#ff6b35' }}>{bot.name}</td>
                <td style={{ padding: '12px' }}>{formatNumber(bot.kamasH)}</td>
                <td style={{ padding: '12px' }}>{formatNumber(bot.rosesH)}</td>
                <td style={{ padding: '12px' }}>{bot.fightsH}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: '#333', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${bot.efficiency}%`, height: '100%', background: getEfficiencyColor(bot.efficiency) }}></div>
                    </div>
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{bot.efficiency}%</span>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      background: bot.status === 'online' ? '#4CAF50' : bot.status === 'fighting' ? '#ff6b35' : '#666',
                      boxShadow: bot.status === 'online' ? '0 0 8px #4CAF50' : bot.status === 'fighting' ? '0 0 8px #ff6b35' : 'none',
                      animation: bot.status === 'fighting' ? 'pulse 2s infinite' : 'none'
                    }}></span>
                    {getStatusText(bot.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '30px 0',
          color: '#666',
          borderTop: '1px solid #333',
          marginTop: '50px'
        }}>
          <p>SnowLab v1.0 | Module Graphiques Avancés</p>
          <p>Made with ❤️ for Dofus Unity botters</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden;
        }
        
        /* Override des tooltips Recharts pour un style uniforme */
        .recharts-tooltip-wrapper {
          outline: none !important;
        }
      `}</style>
    </div>
  );
};

export default ChartsPage;