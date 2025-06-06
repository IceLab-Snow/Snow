import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, RefreshCw, Settings, Bell } from 'lucide-react';

// Configuration API
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com',
  endpoints: {
    dashboard: {
      stats: '/dashboard/stats',
      bots: '/dashboard/bots',
      servers: '/dashboard/servers',
      chartData: '/dashboard/charts',
      notifications: '/dashboard/notifications'
    },
    bots: {
      list: '/bots',
      status: '/bots/status',
      start: '/bots/{id}/start',
      stop: '/bots/{id}/stop',
      restart: '/bots/{id}/restart'
    }
  }
};

// Interfaces TypeScript
interface User {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

interface Stats {
  kamasTotal: number;
  kamasLast24h: number;
  kamasChange: number;
  rosesTotal: number;
  rosesLast24h: number;
  rosesChange: number;
  boursesTotal: number;
  boursesLast24h: number;
  boursesChange: number;
  combatsTotal: number;
  combatsLast24h: number;
  combatsChange: number;
  botsActive: number;
  botsTotal: number;
  botsOffline: number;
  inventoryValue: number;
  inventoryValueChange: number;
  totalPatrimony: number;
  totalPatrimonyChange: number;
}

interface ServerData {
  id: string;
  name: string;
  type: 'Pionnier' | 'Historique';
  status: 'online' | 'maintenance' | 'offline';
  stats: {
    kamas: string;
    roses: string;
    bourses: string;
    activeBots: number;
  };
}

interface BotData {
  id: string;
  name: string;
  serverId: string;
  serverName: string;
  level: number;
  kamas: string;
  roses: string;
  bourses: string;
  sessionTime: string;
  status: 'fighting' | 'farming' | 'idle' | 'offline';
  lastUpdate: Date;
}

interface ChartPoint {
  time: string;
  value: number;
}

interface DualChartPoint {
  time: string;
  roses: number;
  kolizokens: number;
}

const Dashboard: React.FC = () => {
  // Utilisateur de test pour la démo
  const [user, setUser] = useState<User | null>({
    id: '1',
    username: 'admin',
    role: 'administrator',
    permissions: ['view_all', 'manage_bots', 'view_analytics', 'view_own']
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [servers, setServers] = useState<ServerData[]>([]);
  const [bots, setBots] = useState<BotData[]>([]);
  const [kamasChartData, setKamasChartData] = useState<ChartPoint[]>([]);
  const [rosesKoliChartData, setRosesKoliChartData] = useState<DualChartPoint[]>([]);
  
  const [activeTimeFilter, setActiveTimeFilter] = useState('24h');
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatModal, setSelectedStatModal] = useState<string | null>(null);

  // Timeline des événements
  const timelineEvents = [
    { time: '14:32', type: 'success', icon: '💰', text: 'CraBot-01 a gagné 125,000 kamas' },
    { time: '14:28', type: 'warning', icon: '📦', text: 'EniBot-02 - Inventaire à 95%' },
    { time: '14:15', type: 'info', icon: '⚔️', text: 'SacriBot-03 a commencé un combat' },
    { time: '14:10', type: 'error', icon: '🔴', text: 'PandaBot-04 déconnecté' },
    { time: '14:05', type: 'success', icon: '🌹', text: '1000 roses récoltées au total!' },
    { time: '13:55', type: 'info', icon: '🎯', text: 'Archimonstre détecté sur [2,-3]' },
    { time: '13:45', type: 'success', icon: '🎉', text: 'Nouveau record: 50M kamas!' }
  ];

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchServers(),
        fetchBots(),
        fetchChartData()
      ]);
    } catch (error) {
      console.error('Erreur chargement initial:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setLastUpdateTime(new Date());
    
    try {
      await Promise.all([
        fetchStats(),
        fetchBots(),
        fetchChartData()
      ]);
    } catch (error) {
      console.error('Erreur refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchStats = async (): Promise<void> => {
    // TODO: Remplacer par l'appel API réel
    const fakeStats: Stats = {
      kamasTotal: 43169535,
      kamasLast24h: 2345678,
      kamasChange: 5.7,
      rosesTotal: 2672290,
      rosesLast24h: 145320,
      rosesChange: 5.8,
      boursesTotal: 85432,
      boursesLast24h: 12450,
      boursesChange: 17.1,
      combatsTotal: 175270,
      combatsLast24h: 3450,
      combatsChange: 2.0,
      botsActive: 52,
      botsTotal: 350,
      botsOffline: 2,
      inventoryValue: 28456789,
      inventoryValueChange: 8.3,
      totalPatrimony: 71626324,
      totalPatrimonyChange: 6.8
    };
    
    setStats(fakeStats);
  };

  const fetchServers = async (): Promise<void> => {
    const fakeServers: ServerData[] = [
      { 
        id: '1',
        name: 'Brial', 
        type: 'Pionnier', 
        status: 'online', 
        stats: { kamas: '12.5M', roses: '856K', bourses: '28.5K', activeBots: 18 }
      },
      { 
        id: '2',
        name: 'Hell Mina', 
        type: 'Historique', 
        status: 'online', 
        stats: { kamas: '18.3M', roses: '1.1M', bourses: '38.5K', activeBots: 25 }
      },
      { 
        id: '3',
        name: 'Draconiros', 
        type: 'Historique', 
        status: 'online', 
        stats: { kamas: '14.2M', roses: '834K', bourses: '31.7K', activeBots: 17 }
      },
      { 
        id: '4',
        name: 'Salar', 
        type: 'Pionnier', 
        status: 'online', 
        stats: { kamas: '15.8M', roses: '923K', bourses: '32.2K', activeBots: 22 }
      },
      { 
        id: '5',
        name: 'Orukam', 
        type: 'Historique', 
        status: 'maintenance', 
        stats: { kamas: '9.6M', roses: '567K', bourses: '23.5K', activeBots: 0 }
      }
    ];
    
    setServers(fakeServers);
  };

  const fetchBots = async (): Promise<void> => {
    const fakeBots: BotData[] = [
      {
        id: '1',
        name: 'CraBot-01',
        serverId: '1',
        serverName: 'Brial',
        level: 200,
        kamas: '1.2M',
        roses: '45.2K',
        bourses: '3.2K',
        sessionTime: '4h 32m',
        status: 'fighting',
        lastUpdate: new Date()
      },
      {
        id: '2',
        name: 'EniBot-02',
        serverId: '2',
        serverName: 'Hell Mina',
        level: 200,
        kamas: '2.5M',
        roses: '67.8K',
        bourses: '5.1K',
        sessionTime: '8h 15m',
        status: 'farming',
        lastUpdate: new Date()
      },
      {
        id: '3',
        name: 'SacriBot-03',
        serverId: '3',
        serverName: 'Draconiros',
        level: 195,
        kamas: '890K',
        roses: '32.1K',
        bourses: '1.8K',
        sessionTime: '2h 45m',
        status: 'offline',
        lastUpdate: new Date()
      }
    ];
    
    setBots(fakeBots);
  };

  const fetchChartData = async (): Promise<void> => {
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    const fakeKamasData = hours.map((hour, i) => ({
      time: hour,
      value: 35000000 + (i * 350000) + Math.random() * 200000
    }));
    
    const fakeRosesKoliData = hours.map((hour, i) => ({
      time: hour,
      roses: 2100000 + (i * 25000) + Math.random() * 10000,
      kolizokens: 65000 + (i * 850) + Math.random() * 500
    }));
    
    setKamasChartData(fakeKamasData);
    setRosesKoliChartData(fakeRosesKoliData);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    console.log('Déconnexion...');
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  
  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `il y a ${hours}h`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: '#4CAF50',
      fighting: '#ff6b35',
      farming: '#FFC107',
      idle: '#2196F3',
      offline: '#666',
      maintenance: '#FF9800'
    };
    return colors[status] || '#666';
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    };
    return colors[type] || '#666';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      fighting: 'En combat',
      farming: 'En récolte',
      idle: 'En pause',
      offline: 'Hors ligne',
      online: 'En ligne',
      maintenance: 'Maintenance'
    };
    return texts[status] || status;
  };

  const statsCards = [
    { id: 'kamas', icon: '💰', label: 'Kamas (24h)', value: '43.2M', change: '+5.7%', positive: true, color: '#ff6b35' },
    { id: 'roses', icon: '🌹', label: 'Roses (24h)', value: '2.67M', change: '+5.8%', positive: true, color: '#ff1744' },
    { id: 'bourses', icon: '🏆', label: 'Bourses (24h)', value: '85.4K', change: '+17.1%', positive: true, color: '#ff6b35' },
    { id: 'inventory', icon: '📦', label: 'Inventaire', value: '28.5M', change: '+8.3%', positive: true, color: '#9C27B0' },
    { id: 'patrimony', icon: '💎', label: 'Patrimoine', value: '71.6M', change: '+6.8%', positive: true, color: '#00BCD4' },
    { id: 'combats', icon: '⚔️', label: 'Combats (24h)', value: '175K', change: '+2.0%', positive: true, color: '#4CAF50' },
    { id: 'bots', icon: '🤖', label: 'Bots', value: '52/350', change: '2 offline', positive: false, color: '#2196F3' }
  ];

  // Données détaillées par serveur pour les modales
  const getDetailedStatsData = (statId: string) => {
    const serverStats = {
      kamas: [
        { server: 'Brial', value: 12500000, topBot: 'CraBot-01', topValue: 2456789, change: '+15%' },
        { server: 'Hell Mina', value: 18300000, topBot: 'EniBot-02', topValue: 5678901, change: '+22%' },
        { server: 'Draconiros', value: 8900000, topBot: 'SacriBot-03', topValue: 890123, change: '-5%' },
        { server: 'Salar', value: 6800000, topBot: 'PandaBot-04', topValue: 1234567, change: '+8%' },
        { server: 'Orukam', value: 4200000, topBot: 'RoublBot-05', topValue: 567890, change: '+3%' }
      ],
      roses: [
        { server: 'Brial', value: 856000, topBot: 'CraBot-01', topValue: 45234, change: '+12%' },
        { server: 'Hell Mina', value: 1100000, topBot: 'EniBot-02', topValue: 67890, change: '+18%' },
        { server: 'Draconiros', value: 567000, topBot: 'SacriBot-03', topValue: 12345, change: '+5%' },
        { server: 'Salar', value: 789000, topBot: 'PandaBot-04', topValue: 34567, change: '+10%' },
        { server: 'Orukam', value: 345000, topBot: 'RoublBot-05', topValue: 23456, change: '-2%' }
      ],
      bourses: [
        { server: 'Brial', value: 28500, topBot: 'CraBot-01', topValue: 3234, change: '+25%' },
        { server: 'Hell Mina', value: 38500, topBot: 'EniBot-02', topValue: 5678, change: '+30%' },
        { server: 'Draconiros', value: 15000, topBot: 'SacriBot-03', topValue: 1234, change: '+8%' },
        { server: 'Salar', value: 22000, topBot: 'PandaBot-04', topValue: 2345, change: '+15%' },
        { server: 'Orukam', value: 12000, topBot: 'RoublBot-05', topValue: 1890, change: '+5%' }
      ],
      combats: [
        { server: 'Brial', value: 45000, topBot: 'CraBot-01', topValue: 450, change: '+10%' },
        { server: 'Hell Mina', value: 52000, topBot: 'EniBot-02', topValue: 520, change: '+15%' },
        { server: 'Draconiros', value: 38000, topBot: 'SacriBot-03', topValue: 380, change: '-3%' },
        { server: 'Salar', value: 48000, topBot: 'PandaBot-04', topValue: 480, change: '+12%' },
        { server: 'Orukam', value: 35000, topBot: 'RoublBot-05', topValue: 350, change: '+5%' }
      ],
      bots: [
        { server: 'Brial', active: 18, total: 75, offline: 2, efficiency: '92%' },
        { server: 'Hell Mina', active: 25, total: 80, offline: 0, efficiency: '95%' },
        { server: 'Draconiros', active: 12, total: 60, offline: 3, efficiency: '78%' },
        { server: 'Salar', active: 22, total: 70, offline: 1, efficiency: '88%' },
        { server: 'Orukam', active: 8, total: 65, offline: 5, efficiency: '72%' }
      ],
      inventory: [
        { server: 'Brial', value: 5800000, items: 12450, avgPrice: 465, topItem: 'Dofus Turquoise' },
        { server: 'Hell Mina', value: 8200000, items: 18900, avgPrice: 433, topItem: 'Dofus Pourpre' },
        { server: 'Draconiros', value: 4500000, items: 9800, avgPrice: 459, topItem: 'Cape du Roi' },
        { server: 'Salar', value: 6200000, items: 14500, avgPrice: 427, topItem: 'Anneau Royal' },
        { server: 'Orukam', value: 3800000, items: 8200, avgPrice: 463, topItem: 'Bottes du Chaos' }
      ],
      patrimony: [
        { server: 'Brial', kamas: 12500000, inventory: 5800000, total: 18300000, growth: '+12%' },
        { server: 'Hell Mina', kamas: 18300000, inventory: 8200000, total: 26500000, growth: '+18%' },
        { server: 'Draconiros', kamas: 8900000, inventory: 4500000, total: 13400000, growth: '+5%' },
        { server: 'Salar', kamas: 6800000, inventory: 6200000, total: 13000000, growth: '+10%' },
        { server: 'Orukam', kamas: 4200000, inventory: 3800000, total: 8000000, growth: '+3%' }
      ]
    };

    return serverStats[statId] || [];
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #333',
            borderTop: '3px solid #ff6b35',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#888' }}>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      lineHeight: 1.6,
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 107, 53, 0.05) 0%, transparent 50%)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header avec actions utilisateur */}
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
                Dernière mise à jour: {formatTimeSince(lastUpdateTime)}
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
              onClick={() => refreshData()}
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
              onClick={handleLogout}
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
                  background: tab.name === 'Vue d\'ensemble' ? '#ff6b35' : '#1a1a1a',
                  border: tab.name === 'Vue d\'ensemble' ? '2px solid #ff6b35' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  color: tab.name === 'Vue d\'ensemble' ? '#000' : '#fff',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                title={tab.name === 'Administration' ? 'Réservé aux administrateurs' : ''}
                onMouseEnter={(e) => {
                  if (tab.name !== 'Vue d\'ensemble') {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#ff6b35';
                    e.currentTarget.style.color = '#ff6b35';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab.name !== 'Vue d\'ensemble') {
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

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #F44336',
            color: '#F44336',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2em' }}>⚠️</span>
            {error}
          </div>
        )}

        {/* Stats Grid - Version optimisée sur une ligne */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '30px',
          marginTop: '20px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          paddingBottom: '5px',
          paddingTop: '10px'
        }}>
          {statsCards.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid #333',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                minWidth: '160px',
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={() => setSelectedStatModal(stat.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 107, 53, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                width: '100%',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.5em' }}>{stat.icon}</span>
                <div style={{
                  color: '#888',
                  fontSize: '0.75em',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
              <div style={{
                fontSize: '1.5em',
                fontWeight: 'bold',
                color: stat.color,
                textAlign: 'center'
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.7em',
                padding: '3px 8px',
                borderRadius: '12px',
                display: 'inline-block',
                background: stat.positive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                color: stat.positive ? '#4CAF50' : '#f44336'
              }}>
                {stat.positive ? '↑' : '↓'} {stat.change}
              </div>
            </div>
          ))}
        </div>

        {/* Server Distribution */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {servers.map(server => (
            <div
              key={server.id}
              style={{
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '15px',
                padding: '20px',
                transition: 'all 0.3s ease',
                opacity: server.status === 'maintenance' ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff6b35';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(255, 107, 53, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#ff6b35',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    background: getStatusColor(server.status),
                    boxShadow: server.status === 'online' ? `0 0 10px ${getStatusColor(server.status)}` : 'none'
                  }} />
                  {server.name}
                </div>
                <span style={{
                  fontSize: '0.8em',
                  color: '#888',
                  fontWeight: 'normal'
                }}>
                  {server.type}
                </span>
              </div>
              
              {server.status === 'maintenance' && (
                <div style={{
                  background: 'rgba(255, 152, 0, 0.1)',
                  border: '1px solid #FF9800',
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '15px',
                  fontSize: '0.85em',
                  color: '#FF9800',
                  textAlign: 'center'
                }}>
                  🔧 Serveur en maintenance
                </div>
              )}
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}>
                <div style={{
                  background: '#0a0a0a',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>Kamas</div>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff6b35' }}>
                    {server.stats.kamas}
                  </div>
                </div>
                <div style={{
                  background: '#0a0a0a',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>Roses</div>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff1744' }}>
                    {server.stats.roses}
                  </div>
                </div>
                <div style={{
                  background: '#0a0a0a',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>Bourses</div>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff6b35' }}>
                    {server.stats.bourses}
                  </div>
                </div>
                <div style={{
                  background: '#0a0a0a',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.8em', color: '#888' }}>Bots</div>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#fff' }}>
                    {server.stats.activeBots}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline des événements */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          border: '1px solid #333',
          marginBottom: '30px',
          position: 'relative'
        }}>
          <h3 style={{ 
            fontSize: '1.3em', 
            fontWeight: '600', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '20px',
            position: 'sticky',
            top: 0,
            background: '#1a1a1a',
            paddingBottom: '10px',
            zIndex: 1
          }}>
            <span style={{ fontSize: '1.5em' }}>⏰</span>
            Événements récents
          </h3>
          <div style={{
            maxHeight: '350px',
            overflowY: 'auto',
            paddingRight: '10px',
            scrollBehavior: 'smooth'
          }} className="events-timeline">
            {timelineEvents.map((event, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'start',
                gap: '20px',
                padding: '15px',
                borderLeft: `3px solid ${getEventColor(event.type)}`,
                marginLeft: '20px',
                position: 'relative'
              }}>
                <div style={{
                  content: '',
                  width: '12px',
                  height: '12px',
                  background: getEventColor(event.type),
                  borderRadius: '50%',
                  position: 'absolute',
                  left: '-7.5px',
                  top: '20px'
                }}></div>
                <div style={{ minWidth: '80px', color: '#888', fontSize: '0.9em' }}>
                  {event.time}
                </div>
                <div style={{
                  flex: 1,
                  background: '#252525',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.2em', marginRight: '10px' }}>
                    {event.icon}
                  </span>
                  {event.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kamas Chart */}
        <div style={{
          background: '#1a1a1a',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '30px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '1.3em', fontWeight: '600' }}>
              📈 Évolution des Kamas sur 24h
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['24h', '7j', '30j', 'Tout'].map(filter => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveTimeFilter(filter);
                    fetchChartData();
                  }}
                  style={{
                    padding: '8px 16px',
                    background: activeTimeFilter === filter ? '#ff6b35' : '#333',
                    border: activeTimeFilter === filter ? '1px solid #ff6b35' : '1px solid #555',
                    borderRadius: '8px',
                    color: activeTimeFilter === filter ? '#000' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9em'
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kamasChartData}>
                <defs>
                  <linearGradient id="kamasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#999" />
                <YAxis 
                  stroke="#999" 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#999' }}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} K`, 'Kamas']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ff6b35"
                  fillOpacity={1}
                  fill="url(#kamasGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roses and Kolizokens Chart */}
        <div style={{
          background: '#1a1a1a',
          padding: '25px',
          borderRadius: '15px',
          marginBottom: '30px',
          border: '1px solid #333'
        }}>
          <h3 style={{ fontSize: '1.3em', fontWeight: '600', marginBottom: '20px' }}>
            🌹🏆 Roses et Bourses récoltées sur 24h
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rosesKoliChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#999" />
                <YAxis 
                  yAxisId="left" 
                  stroke="#ff1744"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#ff6b35"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#999' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="roses" 
                  stroke="#ff1744" 
                  strokeWidth={3}
                  name="Roses récoltées"
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="kolizokens" 
                  stroke="#ff6b35" 
                  strokeWidth={3}
                  name="Bourses gagnées"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '30px 0',
          color: '#666',
          borderTop: '1px solid #333',
          marginTop: '50px'
        }}>
          <p>SnowLab v1.0 | API Status: <span style={{ color: '#4CAF50' }}>● Connected</span></p>
          <p>Made with ❤️ for Dofus Unity botters</p>
        </div>
      </div>

      {/* Modal pour les statistiques détaillées */}
      {selectedStatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setSelectedStatModal(null)}
        >
          <div 
            style={{
              background: '#1a1a1a',
              borderRadius: '15px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
              border: '1px solid #333'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header de la modale */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#252525'
            }}>
              <h3 style={{
                fontSize: '1.3em',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {statsCards.find(s => s.id === selectedStatModal)?.icon} Détails - {statsCards.find(s => s.id === selectedStatModal)?.label}
              </h3>
              <button
                onClick={() => setSelectedStatModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>

            {/* Contenu de la modale */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px'
            }}>
              {/* Statistiques par serveur */}
              {selectedStatModal === 'kamas' && (
                <div>
                  <h4 style={{ color: '#ff6b35', marginBottom: '20px' }}>Répartition par serveur</h4>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {getDetailedStatsData('kamas').map((data: any, idx: number) => (
                      <div key={idx} style={{
                        background: '#0a0a0a',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #333',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 1fr',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#ff6b35' }}>{data.server}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Total serveur</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatNumber(data.value)} K</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Meilleur bot: {data.topBot} ({formatNumber(data.topValue)} K)</div>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#333',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(data.value / 20000000) * 100}%`,
                            height: '100%',
                            background: '#ff6b35'
                          }} />
                        </div>
                        <div style={{
                          color: data.change.includes('+') ? '#4CAF50' : '#F44336',
                          fontWeight: 'bold',
                          textAlign: 'right'
                        }}>
                          {data.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStatModal === 'roses' && (
                <div>
                  <h4 style={{ color: '#ff1744', marginBottom: '20px' }}>Répartition par serveur</h4>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {getDetailedStatsData('roses').map((data: any, idx: number) => (
                      <div key={idx} style={{
                        background: '#0a0a0a',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #333',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 1fr',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#ff1744' }}>{data.server}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Total serveur</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatNumber(data.value)}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Meilleur bot: {data.topBot} ({formatNumber(data.topValue)})</div>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#333',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(data.value / 1200000) * 100}%`,
                            height: '100%',
                            background: '#ff1744'
                          }} />
                        </div>
                        <div style={{
                          color: data.change.includes('+') ? '#4CAF50' : '#F44336',
                          fontWeight: 'bold',
                          textAlign: 'right'
                        }}>
                          {data.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStatModal === 'bourses' && (
                <div>
                  <h4 style={{ color: '#ff6b35', marginBottom: '20px' }}>Répartition par serveur</h4>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {getDetailedStatsData('bourses').map((data: any, idx: number) => (
                      <div key={idx} style={{
                        background: '#0a0a0a',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #333',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 1fr',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#ff6b35' }}>{data.server}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Total serveur</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatNumber(data.value)}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Meilleur bot: {data.topBot} ({formatNumber(data.topValue)})</div>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#333',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(data.value / 40000) * 100}%`,
                            height: '100%',
                            background: '#ff6b35'
                          }} />
                        </div>
                        <div style={{
                          color: data.change.includes('+') ? '#4CAF50' : '#F44336',
                          fontWeight: 'bold',
                          textAlign: 'right'
                        }}>
                          {data.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStatModal === 'combats' && (
                <div>
                  <h4 style={{ color: '#4CAF50', marginBottom: '20px' }}>Répartition par serveur</h4>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {getDetailedStatsData('combats').map((data: any, idx: number) => (
                      <div key={idx} style={{
                        background: '#0a0a0a',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #333',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr 1fr 1fr',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>{data.server}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Total serveur</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatNumber(data.value)}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>Meilleur bot: {data.topBot} ({data.topValue} combats/h)</div>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#333',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(data.value / 60000) * 100}%`,
                            height: '100%',
                            background: '#4CAF50'
                          }} />
                        </div>
                        <div style={{
                          color: data.change.includes('+') ? '#4CAF50' : '#F44336',
                          fontWeight: 'bold',
                          textAlign: 'right'
                        }}>
                          {data.change}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStatModal === 'bots' && (
                <div>
                  <h4 style={{ color: '#2196F3', marginBottom: '20px' }}>État des bots par serveur</h4>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {getDetailedStatsData('bots').map((data: any, idx: number) => (
                      <div key={idx} style={{
                        background: '#0a0a0a',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #333'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr 1fr',
                          gap: '15px',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#2196F3', fontSize: '1.1em' }}>
                              {data.server}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>
                              Efficacité: {data.efficiency}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#4CAF50', fontSize: '1.3em', fontWeight: 'bold' }}>
                              {data.active}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>Actifs</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#2196F3', fontSize: '1.3em', fontWeight: 'bold' }}>
                              {data.total}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>Total</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#F44336', fontSize: '1.3em', fontWeight: 'bold' }}>
                              {data.offline}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>Hors ligne</div>
                          </div>
                        </div>
                        <div style={{
                          marginTop: '10px',
                          height: '8px',
                          background: '#333',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(data.active / data.total) * 100}%`,
                            height: '100%',
                            background: '#4CAF50'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStatModal === 'inventory' && (
                <div>
                  <h4 style={{ color: '#9C27B0', marginBottom: '20px' }}>Valeur d'inventaire par serveur</h4>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {getDetailedStatsData('inventory').map((data: any, idx: number) => (
                      <div key={idx} style={{
                        background: '#0a0a0a',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #333'
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 2fr 1fr',
                          gap: '15px',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#9C27B0', fontSize: '1.1em' }}>
                              {data.server}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>
                              {formatNumber(data.items)} objets
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '1.3em', fontWeight: 'bold' }}>
                              {formatNumber(data.value)} K
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>
                              Prix moyen: {data.avgPrice} K | Top: {data.topItem}
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <div style={{
                              flex: 1,
                              height: '8px',
                              background: '#333',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${(data.value / 10000000) * 100}%`,
                                height: '100%',
                                background: '#9C27B0'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.9em', color: '#888' }}>
                              {Math.round((data.value / 28456789) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedStatModal === 'patrimony' && (
                <div>
                  <h4 style={{ color: '#00BCD4', marginBottom: '20px' }}>Patrimoine total par serveur</h4>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {getDetailedStatsData('patrimony').map((data: any, idx: number) => (
                      <div key={idx} style={{
                        background: '#0a0a0a',
                        padding: '20px',
                        borderRadius: '10px',
                        border: '1px solid #333'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '15px'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#00BCD4', fontSize: '1.2em' }}>
                              {data.server}
                            </div>
                            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
                              {formatNumber(data.total)} K
                            </div>
                          </div>
                          <div style={{
                            color: data.growth.includes('+') ? '#4CAF50' : '#F44336',
                            fontSize: '1.2em',
                            fontWeight: 'bold'
                          }}>
                            {data.growth}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{
                            background: '#1a1a1a',
                            padding: '10px',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>💰 Kamas</div>
                            <div style={{ fontWeight: 'bold', color: '#ff6b35' }}>
                              {formatNumber(data.kamas)} K
                            </div>
                          </div>
                          <div style={{
                            background: '#1a1a1a',
                            padding: '10px',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>📦 Inventaire</div>
                            <div style={{ fontWeight: 'bold', color: '#9C27B0' }}>
                              {formatNumber(data.inventory)} K
                            </div>
                          </div>
                        </div>
                        <div style={{
                          marginTop: '10px',
                          height: '20px',
                          background: '#333',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          display: 'flex'
                        }}>
                          <div style={{
                            width: `${(data.kamas / data.total) * 100}%`,
                            background: '#ff6b35'
                          }} />
                          <div style={{
                            width: `${(data.inventory / data.total) * 100}%`,
                            background: '#9C27B0'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
        
        /* Hover effects */
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        /* Custom scrollbar pour la timeline */
        .events-timeline::-webkit-scrollbar {
          width: 8px;
        }
        
        .events-timeline::-webkit-scrollbar-track {
          background: #0a0a0a;
          border-radius: 4px;
        }
        
        .events-timeline::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        .events-timeline::-webkit-scrollbar-thumb:hover {
          background: #ff6b35;
        }
        
        /* Firefox scrollbar */
        .events-timeline {
          scrollbar-width: thin;
          scrollbar-color: #333 #0a0a0a;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .header h1 {
            font-size: 1.5em;
          }
          
          .header h1 img {
            width: 35px;
            height: 35px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;