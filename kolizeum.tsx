import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { RefreshCw, Settings, Bell, LogOut, TrendingUp, TrendingDown } from 'lucide-react';

// Configuration API
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com',
  endpoints: {
    kolizeum: {
      stats: '/kolizeum/stats',
      matches: '/kolizeum/matches',
      winrates: '/kolizeum/winrates',
      performers: '/kolizeum/top-performers',
      hourlyPerformance: '/kolizeum/hourly',
      evolution: '/kolizeum/evolution'
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

interface KoliStats {
  totalBourses: number;
  todayBourses: number;
  globalWinRate: number;
  totalFights: number;
  todayFights: number;
  totalVictories: number;
  todayVictories: number;
  activeKoliBots: number;
  totalBots: number;
}

interface WinRateByMode {
  mode: string;
  icon: string;
  winRate: number;
  victories: number;
  totalFights: number;
  todayWinRate: number;
  todayChange: number;
}

interface RecentMatch {
  id: string;
  mode: string;
  team: string[];
  result: 'victory' | 'defeat';
  bourses: number;
  timestamp: Date;
}

interface TopPerformer {
  rank: number;
  name: string;
  server: string;
  class: string;
  level: number;
  bourses: number;
  winRate: number;
  totalFights: number;
}

const KolizeumPage: React.FC = () => {
  // Utilisateur de test pour la démo
  const [user] = useState<User>({
    id: '1',
    username: 'admin',
    role: 'administrator',
    permissions: ['view_all', 'manage_bots', 'view_analytics', 'view_own']
  });

  const [koliStats, setKoliStats] = useState<KoliStats>({
    totalBourses: 22065721,
    todayBourses: 165432,
    globalWinRate: 63.8,
    totalFights: 15352,
    todayFights: 432,
    totalVictories: 9792,
    todayVictories: 276,
    activeKoliBots: 24,
    totalBots: 52
  });

  // Stats par serveur
  const serverStats: Record<string, KoliStats> = {
    'all': {
      totalBourses: 22065721,
      todayBourses: 165432,
      globalWinRate: 63.8,
      totalFights: 15352,
      todayFights: 432,
      totalVictories: 9792,
      todayVictories: 276,
      activeKoliBots: 24,
      totalBots: 52
    },
    '1': { // Brial
      totalBourses: 6234567,
      todayBourses: 45678,
      globalWinRate: 71.2,
      totalFights: 3852,
      todayFights: 125,
      totalVictories: 2742,
      todayVictories: 89,
      activeKoliBots: 8,
      totalBots: 15
    },
    '2': { // Hell Mina
      totalBourses: 7890123,
      todayBourses: 56789,
      globalWinRate: 58.4,
      totalFights: 4567,
      todayFights: 134,
      totalVictories: 2667,
      todayVictories: 78,
      activeKoliBots: 6,
      totalBots: 12
    },
    '3': { // Draconiros
      totalBourses: 4567890,
      todayBourses: 34567,
      globalWinRate: 65.9,
      totalFights: 2890,
      todayFights: 89,
      totalVictories: 1905,
      todayVictories: 59,
      activeKoliBots: 5,
      totalBots: 10
    },
    '4': { // Salar
      totalBourses: 2345678,
      todayBourses: 23456,
      globalWinRate: 62.3,
      totalFights: 2123,
      todayFights: 56,
      totalVictories: 1323,
      todayVictories: 35,
      activeKoliBots: 3,
      totalBots: 8
    },
    '5': { // Orukam
      totalBourses: 1028363,
      todayBourses: 5142,
      globalWinRate: 55.7,
      totalFights: 1920,
      todayFights: 28,
      totalVictories: 1155,
      todayVictories: 15,
      activeKoliBots: 2,
      totalBots: 7
    }
  };

  const [winRatesByMode, setWinRatesByMode] = useState<WinRateByMode[]>([
    {
      mode: '1V1',
      icon: '👤',
      winRate: 76.0,
      victories: 5246,
      totalFights: 6865,
      todayWinRate: 82.5,
      todayChange: 6.5
    },
    {
      mode: '2V2',
      icon: '👥',
      winRate: 45.7,
      victories: 2646,
      totalFights: 5796,
      todayWinRate: 42.3,
      todayChange: -3.4
    },
    {
      mode: '3V3',
      icon: '👥👤',
      winRate: 71.5,
      victories: 1850,
      totalFights: 2587,
      todayWinRate: 75.8,
      todayChange: 4.3
    }
  ]);

  // Win rates par mode et par serveur
  const serverWinRates: Record<string, WinRateByMode[]> = {
    'all': [
      { mode: '1V1', icon: '👤', winRate: 76.0, victories: 5246, totalFights: 6865, todayWinRate: 82.5, todayChange: 6.5 },
      { mode: '2V2', icon: '👥', winRate: 45.7, victories: 2646, totalFights: 5796, todayWinRate: 42.3, todayChange: -3.4 },
      { mode: '3V3', icon: '👥👤', winRate: 71.5, victories: 1850, totalFights: 2587, todayWinRate: 75.8, todayChange: 4.3 }
    ],
    '1': [ // Brial
      { mode: '1V1', icon: '👤', winRate: 82.3, victories: 1456, totalFights: 1769, todayWinRate: 85.2, todayChange: 2.9 },
      { mode: '2V2', icon: '👥', winRate: 68.9, victories: 856, totalFights: 1242, todayWinRate: 71.2, todayChange: 2.3 },
      { mode: '3V3', icon: '👥👤', winRate: 72.1, victories: 430, totalFights: 596, todayWinRate: 73.5, todayChange: 1.4 }
    ],
    '2': [ // Hell Mina
      { mode: '1V1', icon: '👤', winRate: 65.2, victories: 1234, totalFights: 1893, todayWinRate: 68.5, todayChange: 3.3 },
      { mode: '2V2', icon: '👥', winRate: 52.3, victories: 789, totalFights: 1509, todayWinRate: 49.8, todayChange: -2.5 },
      { mode: '3V3', icon: '👥👤', winRate: 58.9, victories: 644, totalFights: 1093, todayWinRate: 61.2, todayChange: 2.3 }
    ],
    '3': [ // Draconiros
      { mode: '1V1', icon: '👤', winRate: 78.5, victories: 1123, totalFights: 1431, todayWinRate: 80.1, todayChange: 1.6 },
      { mode: '2V2', icon: '👥', winRate: 61.2, victories: 567, totalFights: 926, todayWinRate: 58.9, todayChange: -2.3 },
      { mode: '3V3', icon: '👥👤', winRate: 69.8, victories: 371, totalFights: 531, todayWinRate: 72.4, todayChange: 2.6 }
    ],
    '4': [ // Salar
      { mode: '1V1', icon: '👤', winRate: 74.2, victories: 789, totalFights: 1063, todayWinRate: 76.8, todayChange: 2.6 },
      { mode: '2V2', icon: '👥', winRate: 48.6, victories: 345, totalFights: 710, todayWinRate: 45.2, todayChange: -3.4 },
      { mode: '3V3', icon: '👥👤', winRate: 65.3, victories: 234, totalFights: 358, todayWinRate: 68.1, todayChange: 2.8 }
    ],
    '5': [ // Orukam
      { mode: '1V1', icon: '👤', winRate: 69.8, victories: 644, totalFights: 922, todayWinRate: 71.2, todayChange: 1.4 },
      { mode: '2V2', icon: '👥', winRate: 41.2, victories: 289, totalFights: 702, todayWinRate: 38.5, todayChange: -2.7 },
      { mode: '3V3', icon: '👥👤', winRate: 58.7, victories: 171, totalFights: 291, todayWinRate: 60.2, todayChange: 1.5 }
    ]
  };

  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([
    {
      id: '1',
      mode: '3V3',
      team: ['RoublardBot-06', 'SacrieurBot-03', 'CraBot-13'],
      result: 'victory',
      bourses: 1234,
      timestamp: new Date(Date.now() - 5 * 60000)
    },
    {
      id: '2',
      mode: '1V1',
      team: ['RoublardBot-06'],
      result: 'victory',
      bourses: 856,
      timestamp: new Date(Date.now() - 12 * 60000)
    },
    {
      id: '3',
      mode: '2V2',
      team: ['SacrieurBot-03', 'EniBot-02'],
      result: 'defeat',
      bourses: 234,
      timestamp: new Date(Date.now() - 18 * 60000)
    },
    {
      id: '4',
      mode: '1V1',
      team: ['CraBot-13'],
      result: 'victory',
      bourses: 923,
      timestamp: new Date(Date.now() - 25 * 60000)
    }
  ]);

  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([
    {
      rank: 1,
      name: 'RoublardBot-06',
      server: 'Brial',
      class: 'Roublard',
      level: 196,
      bourses: 2000000,
      winRate: 81,
      totalFights: 815
    },
    {
      rank: 2,
      name: 'SacrieurBot-03',
      server: 'Hell Mina',
      class: 'Sacrieur',
      level: 197,
      bourses: 1900000,
      winRate: 65,
      totalFights: 821
    },
    {
      rank: 3,
      name: 'CraBot-13',
      server: 'Draconiros',
      class: 'Cra',
      level: 197,
      bourses: 1800000,
      winRate: 70,
      totalFights: 525
    },
    {
      rank: 4,
      name: 'PandaBot-08',
      server: 'Brial',
      class: 'Pandawa',
      level: 195,
      bourses: 1750000,
      winRate: 68,
      totalFights: 612
    },
    {
      rank: 5,
      name: 'XelorBot-11',
      server: 'Hell Mina',
      class: 'Xelor',
      level: 198,
      bourses: 1650000,
      winRate: 72,
      totalFights: 445
    },
    {
      rank: 6,
      name: 'EniBot-02',
      server: 'Salar',
      class: 'Eniripsa',
      level: 200,
      bourses: 1600000,
      winRate: 58,
      totalFights: 890
    }
  ]);

  const [selectedServer, setSelectedServer] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Initialisation des données des graphiques
  const initialEvolutionData = [
    { day: 'Lun', bourses: 145000, moyenne: 150000 },
    { day: 'Mar', bourses: 168000, moyenne: 155000 },
    { day: 'Mer', bourses: 152000, moyenne: 158000 },
    { day: 'Jeu', bourses: 189000, moyenne: 163000 },
    { day: 'Ven', bourses: 165000, moyenne: 167000 },
    { day: 'Sam', bourses: 172000, moyenne: 169000 },
    { day: 'Dim', bourses: 165432, moyenne: 165000 }
  ];

  const initialHourlyData = [
    { hour: '00h', winRate: 65, fights: 45 },
    { hour: '04h', winRate: 72, fights: 23 },
    { hour: '08h', winRate: 68, fights: 67 },
    { hour: '12h', winRate: 75, fights: 89 },
    { hour: '14h', winRate: 85, fights: 112 },
    { hour: '16h', winRate: 78, fights: 98 },
    { hour: '20h', winRate: 70, fights: 76 }
  ];

  const [currentEvolutionData, setCurrentEvolutionData] = useState(initialEvolutionData);
  const [currentHourlyData, setCurrentHourlyData] = useState(initialHourlyData);

  // Liste des serveurs disponibles
  const servers = [
    { id: 'all', name: 'Tous les serveurs' },
    { id: '1', name: 'Brial' },
    { id: '2', name: 'Hell Mina' },
    { id: '3', name: 'Draconiros' },
    { id: '4', name: 'Salar' },
    { id: '5', name: 'Orukam' }
  ];

  // Données des graphiques par serveur
  const serverEvolutionData: Record<string, typeof initialEvolutionData> = {
    'all': [
      { day: 'Lun', bourses: 145000, moyenne: 150000 },
      { day: 'Mar', bourses: 168000, moyenne: 155000 },
      { day: 'Mer', bourses: 152000, moyenne: 158000 },
      { day: 'Jeu', bourses: 189000, moyenne: 163000 },
      { day: 'Ven', bourses: 165000, moyenne: 167000 },
      { day: 'Sam', bourses: 172000, moyenne: 169000 },
      { day: 'Dim', bourses: 165432, moyenne: 165000 }
    ],
    '1': [ // Brial
      { day: 'Lun', bourses: 42000, moyenne: 40000 },
      { day: 'Mar', bourses: 48000, moyenne: 43000 },
      { day: 'Mer', bourses: 45000, moyenne: 44000 },
      { day: 'Jeu', bourses: 52000, moyenne: 46000 },
      { day: 'Ven', bourses: 49000, moyenne: 47000 },
      { day: 'Sam', bourses: 51000, moyenne: 48000 },
      { day: 'Dim', bourses: 45678, moyenne: 48500 }
    ],
    '2': [ // Hell Mina
      { day: 'Lun', bourses: 51000, moyenne: 48000 },
      { day: 'Mar', bourses: 55000, moyenne: 50000 },
      { day: 'Mer', bourses: 53000, moyenne: 51000 },
      { day: 'Jeu', bourses: 58000, moyenne: 53000 },
      { day: 'Ven', bourses: 54000, moyenne: 54000 },
      { day: 'Sam', bourses: 57000, moyenne: 55000 },
      { day: 'Dim', bourses: 56789, moyenne: 55500 }
    ],
    '3': [ // Draconiros
      { day: 'Lun', bourses: 32000, moyenne: 30000 },
      { day: 'Mar', bourses: 35000, moyenne: 31000 },
      { day: 'Mer', bourses: 33000, moyenne: 32000 },
      { day: 'Jeu', bourses: 38000, moyenne: 33500 },
      { day: 'Ven', bourses: 36000, moyenne: 34000 },
      { day: 'Sam', bourses: 37000, moyenne: 35000 },
      { day: 'Dim', bourses: 34567, moyenne: 35500 }
    ],
    '4': [ // Salar
      { day: 'Lun', bourses: 18000, moyenne: 17000 },
      { day: 'Mar', bourses: 22000, moyenne: 19000 },
      { day: 'Mer', bourses: 20000, moyenne: 20000 },
      { day: 'Jeu', bourses: 25000, moyenne: 21000 },
      { day: 'Ven', bourses: 23000, moyenne: 22000 },
      { day: 'Sam', bourses: 24000, moyenne: 23000 },
      { day: 'Dim', bourses: 23456, moyenne: 23200 }
    ],
    '5': [ // Orukam
      { day: 'Lun', bourses: 2000, moyenne: 2500 },
      { day: 'Mar', bourses: 3000, moyenne: 2600 },
      { day: 'Mer', bourses: 2500, moyenne: 2700 },
      { day: 'Jeu', bourses: 4000, moyenne: 3000 },
      { day: 'Ven', bourses: 3500, moyenne: 3200 },
      { day: 'Sam', bourses: 3800, moyenne: 3400 },
      { day: 'Dim', bourses: 5142, moyenne: 3600 }
    ]
  };

  const serverHourlyData: Record<string, typeof initialHourlyData> = {
    'all': [
      { hour: '00h', winRate: 65, fights: 45 },
      { hour: '04h', winRate: 72, fights: 23 },
      { hour: '08h', winRate: 68, fights: 67 },
      { hour: '12h', winRate: 75, fights: 89 },
      { hour: '14h', winRate: 85, fights: 112 },
      { hour: '16h', winRate: 78, fights: 98 },
      { hour: '20h', winRate: 70, fights: 76 }
    ],
    '1': [ // Brial
      { hour: '00h', winRate: 72, fights: 12 },
      { hour: '04h', winRate: 78, fights: 8 },
      { hour: '08h', winRate: 75, fights: 18 },
      { hour: '12h', winRate: 82, fights: 25 },
      { hour: '14h', winRate: 88, fights: 32 },
      { hour: '16h', winRate: 85, fights: 28 },
      { hour: '20h', winRate: 76, fights: 22 }
    ],
    '2': [ // Hell Mina
      { hour: '00h', winRate: 58, fights: 15 },
      { hour: '04h', winRate: 62, fights: 9 },
      { hour: '08h', winRate: 60, fights: 22 },
      { hour: '12h', winRate: 65, fights: 28 },
      { hour: '14h', winRate: 72, fights: 35 },
      { hour: '16h', winRate: 68, fights: 30 },
      { hour: '20h', winRate: 64, fights: 25 }
    ],
    '3': [ // Draconiros
      { hour: '00h', winRate: 68, fights: 10 },
      { hour: '04h', winRate: 75, fights: 5 },
      { hour: '08h', winRate: 70, fights: 15 },
      { hour: '12h', winRate: 78, fights: 20 },
      { hour: '14h', winRate: 85, fights: 25 },
      { hour: '16h', winRate: 80, fights: 22 },
      { hour: '20h', winRate: 72, fights: 18 }
    ],
    '4': [ // Salar
      { hour: '00h', winRate: 62, fights: 8 },
      { hour: '04h', winRate: 68, fights: 4 },
      { hour: '08h', winRate: 65, fights: 10 },
      { hour: '12h', winRate: 70, fights: 12 },
      { hour: '14h', winRate: 78, fights: 15 },
      { hour: '16h', winRate: 75, fights: 13 },
      { hour: '20h', winRate: 68, fights: 11 }
    ],
    '5': [ // Orukam
      { hour: '00h', winRate: 55, fights: 3 },
      { hour: '04h', winRate: 60, fights: 2 },
      { hour: '08h', winRate: 58, fights: 5 },
      { hour: '12h', winRate: 62, fights: 6 },
      { hour: '14h', winRate: 70, fights: 8 },
      { hour: '16h', winRate: 65, fights: 7 },
      { hour: '20h', winRate: 60, fights: 5 }
    ]
  };

  const classPerformanceData = [
    { class: 'Cra', winRate: 72, popularity: 85 },
    { class: 'Eniripsa', winRate: 58, popularity: 45 },
    { class: 'Sacrieur', winRate: 65, popularity: 70 },
    { class: 'Pandawa', winRate: 61, popularity: 55 },
    { class: 'Roublard', winRate: 81, popularity: 90 },
    { class: 'Xelor', winRate: 55, popularity: 40 }
  ];

  // Charger les données au montage
  useEffect(() => {
    loadKoliData();
  }, []);

  // Mise à jour automatique toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      updateLiveStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Mettre à jour les données quand le serveur change
  useEffect(() => {
    const currentStats = serverStats[selectedServer] || serverStats['all'];
    setKoliStats(currentStats);

    const currentWinRates = serverWinRates[selectedServer] || serverWinRates['all'];
    setWinRatesByMode(currentWinRates);

    const currentEvolution = serverEvolutionData[selectedServer] || serverEvolutionData['all'];
    setCurrentEvolutionData(currentEvolution);

    const currentHourly = serverHourlyData[selectedServer] || serverHourlyData['all'];
    setCurrentHourlyData(currentHourly);
  }, [selectedServer]);

  const loadKoliData = async () => {
    setIsLoading(true);
    try {
      // TODO: Remplacer par les appels API réels
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Erreur chargement des données Kolizéum:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadKoliData();
    setRefreshing(false);
  };

  const updateLiveStats = () => {
    // Simulation de mise à jour en temps réel
    setKoliStats(prev => ({
      ...prev,
      todayBourses: prev.todayBourses + Math.floor(Math.random() * 1000) + 500,
      activeKoliBots: Math.floor(Math.random() * 10) + 20
    }));
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  
  const formatTimeSince = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    return `il y a ${minutes} min`;
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return '#4CAF50';
    if (winRate >= 50) return '#FF9800';
    return '#F44336';
  };

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { background: 'linear-gradient(135deg, #FFD700, #FFA000)', color: '#000' };
      case 2:
        return { background: 'linear-gradient(135deg, #C0C0C0, #757575)', color: '#000' };
      case 3:
        return { background: 'linear-gradient(135deg, #CD7F32, #8D6E63)', color: '#fff' };
      default:
        return { background: '#333', color: '#fff' };
    }
  };

  // Filtrer les top performers par serveur
  const filteredTopPerformers = selectedServer === 'all' 
    ? topPerformers 
    : topPerformers.filter(p => {
        const serverId = servers.find(s => s.name === p.server)?.id;
        return serverId === selectedServer;
      });

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
                Statistiques et suivi des performances en Kolizéum
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
                  background: tab.name === 'Kolizéum' ? '#ff6b35' : '#1a1a1a',
                  border: tab.name === 'Kolizéum' ? '2px solid #ff6b35' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  color: tab.name === 'Kolizéum' ? '#000' : '#fff',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                title={tab.name === 'Administration' ? 'Réservé aux administrateurs' : ''}
                onMouseEnter={(e) => {
                  if (tab.name !== 'Kolizéum') {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#ff6b35';
                    e.currentTarget.style.color = '#ff6b35';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab.name !== 'Kolizéum') {
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

        {/* SECTION 1: Statistiques principales - Version réduite */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2em' }}>💰</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#888', fontSize: '0.85em' }}>BOURSES TOTALES</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff6b35' }}>
                  {formatNumber(koliStats.totalBourses)}
                </div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  +{formatNumber(koliStats.todayBourses)} aujourd'hui
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2em' }}>🏆</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#888', fontSize: '0.85em' }}>WIN RATE GLOBAL</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#4CAF50' }}>
                  {koliStats.globalWinRate}%
                </div>
                <div style={{
                  width: '120px',
                  height: '4px',
                  background: '#333',
                  borderRadius: '2px',
                  marginTop: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${koliStats.globalWinRate}%`,
                    background: '#4CAF50'
                  }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2em' }}>⚔️</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#888', fontSize: '0.85em' }}>COMBATS AUJOURD'HUI</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#2196F3' }}>
                  {koliStats.todayFights}
                </div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  {koliStats.todayVictories} victoires ({koliStats.todayFights > 0 ? Math.round((koliStats.todayVictories / koliStats.todayFights) * 100) : 0}%)
                </div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #333',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div style={{ fontSize: '2em' }}>🤖</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: '#888', fontSize: '0.85em' }}>BOTS KOLI ACTIFS</div>
                <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#FF9800' }}>
                  {koliStats.activeKoliBots} / {koliStats.totalBots}
                </div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  {Math.round((koliStats.activeKoliBots / koliStats.totalBots) * 100)}% en Kolizéum
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtre par serveur */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '15px 20px',
          marginBottom: '20px',
          border: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <span style={{ color: '#888', fontSize: '0.9em' }}>🌐 Filtrer par serveur:</span>
          <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
            {servers.map(server => (
              <button
                key={server.id}
                onClick={() => setSelectedServer(server.id)}
                style={{
                  padding: '8px 16px',
                  background: selectedServer === server.id ? '#ff6b35' : '#252525',
                  border: selectedServer === server.id ? '1px solid #ff6b35' : '1px solid #333',
                  borderRadius: '8px',
                  color: selectedServer === server.id ? '#000' : '#fff',
                  fontSize: '0.9em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: selectedServer === server.id ? '600' : '400'
                }}
              >
                {server.name}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2: Win Rate par Mode - Version réduite */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{
            fontSize: '1.2em',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📊 Win Rate par Mode de Jeu
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px'
          }}>
            {winRatesByMode.map((mode, index) => (
              <div key={index} style={{
                background: '#0a0a0a',
                borderRadius: '10px',
                padding: '15px',
                border: '1px solid #222',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5em' }}>{mode.icon}</span>
                    <span style={{ fontSize: '1.1em', fontWeight: '600' }}>{mode.mode}</span>
                  </div>
                  <div style={{
                    fontSize: '1.8em',
                    fontWeight: 'bold',
                    color: getWinRateColor(mode.winRate)
                  }}>
                    {mode.winRate}%
                  </div>
                </div>
                <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '8px' }}>
                  {formatNumber(mode.victories)} / {formatNumber(mode.totalFights)}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.8em',
                  color: mode.todayChange > 0 ? '#4CAF50' : '#F44336'
                }}>
                  {mode.todayChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{mode.todayChange > 0 ? '+' : ''}{mode.todayChange}% vs hier</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#333',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${mode.winRate}%`,
                    background: getWinRateColor(mode.winRate),
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: Alertes et Insights - Placée JUSTE APRÈS Win Rate par Mode */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          border: '1px solid #333'
        }}>
          <h3 style={{
            fontSize: '1.2em',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>💡</span>
            <span>Insights & Alertes</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px',
              background: '#0a0a0a',
              borderRadius: '8px',
              border: '1px solid #222'
            }}>
              <div style={{ fontSize: '1.3em' }}>🔥</div>
              <div style={{ flex: 1, fontSize: '0.9em' }}>
                <strong>Série en cours!</strong> RoublardBot-06 est sur une série de 12 victoires consécutives
              </div>
              <div style={{ fontSize: '0.75em', color: '#666' }}>
                il y a 5 min
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px',
              background: '#0a0a0a',
              borderRadius: '8px',
              border: '1px solid #222'
            }}>
              <div style={{ fontSize: '1.3em' }}>📈</div>
              <div style={{ flex: 1, fontSize: '0.9em' }}>
                <strong>Performance optimale</strong> Le créneau 14h-16h affiche un win rate de 85% aujourd'hui
              </div>
              <div style={{ fontSize: '0.75em', color: '#666' }}>
                il y a 1h
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px',
              background: '#0a0a0a',
              borderRadius: '8px',
              border: '1px solid #222'
            }}>
              <div style={{ fontSize: '1.3em' }}>⚠️</div>
              <div style={{ flex: 1, fontSize: '0.9em' }}>
                <strong>Attention</strong> Le mode 2v2 présente des difficultés aujourd'hui (42.3% WR)
              </div>
              <div style={{ fontSize: '0.75em', color: '#666' }}>
                il y a 2h
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Graphiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Évolution des bourses */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '1.3em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>💰</span>
                <span>Évolution des Bourses Koli (7 jours) {selectedServer !== 'all' && `- ${servers.find(s => s.id === selectedServer)?.name}`}</span>
              </h3>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#999" />
                  <YAxis stroke="#999" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(value: number) => formatNumber(value) + ' bourses'}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="bourses" 
                    stroke="#ff6b35" 
                    strokeWidth={3}
                    name="Bourses gagnées"
                    dot={{ fill: '#ff6b35' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moyenne" 
                    stroke="#f7931e" 
                    strokeWidth={2}
                    name="Moyenne mobile"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance par heure */}
          <div style={{
            background: '#1a1a1a',
            borderRadius: '15px',
            padding: '25px',
            border: '1px solid #333'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '1.3em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>⏰</span>
                <span>Performance par Heure {selectedServer !== 'all' && `- ${servers.find(s => s.id === selectedServer)?.name}`}</span>
              </h3>
            </div>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentHourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#999" />
                  <YAxis yAxisId="left" stroke="#999" />
                  <YAxis yAxisId="right" orientation="right" stroke="#999" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="winRate" fill="#4CAF50" name="Win Rate %">
                    {currentHourlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getWinRateColor(entry.winRate)} />
                    ))}
                  </Bar>
                  <Bar yAxisId="right" dataKey="fights" fill="#2196F3" name="Nombre de combats" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Matchs Récents */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          border: '1px solid #333'
        }}>
          <h3 style={{
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>🎮</span>
            <span>Matchs Récents {selectedServer !== 'all' && `- ${servers.find(s => s.id === selectedServer)?.name}`}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentMatches.map((match) => (
              <div key={match.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#0a0a0a',
                borderRadius: '10px',
                border: '1px solid #222',
                borderLeft: `4px solid ${match.result === 'victory' ? '#4CAF50' : '#F44336'}`,
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontWeight: '600', color: '#2196F3' }}>
                    {match.mode}
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#888' }}>
                    {match.team.join(', ')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    fontWeight: '600',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '0.9em',
                    background: match.result === 'victory' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                    color: match.result === 'victory' ? '#4CAF50' : '#F44336'
                  }}>
                    {match.result === 'victory' ? 'VICTOIRE' : 'DÉFAITE'}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ff6b35', fontWeight: '600' }}>
                      +{formatNumber(match.bourses)} bourses
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {formatTimeSince(match.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <h3 style={{
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🏆</span>
          <span>Top Performers Kolizéum {selectedServer !== 'all' && `- ${servers.find(s => s.id === selectedServer)?.name}`}</span>
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {filteredTopPerformers.length > 0 ? (
            filteredTopPerformers.map((performer, index) => (
              <div key={performer.rank} style={{
                background: '#1a1a1a',
                borderRadius: '15px',
                padding: '20px',
                border: '1px solid #333',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    ...getRankBadgeStyle(index + 1)
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.2em', fontWeight: '600' }}>
                      {performer.name}
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#888' }}>
                      {performer.server} - {performer.class} {performer.level}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginTop: '15px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '10px',
                    background: '#0a0a0a',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>
                      Bourses
                    </div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff6b35' }}>
                      {performer.bourses >= 1000000 
                        ? `${(performer.bourses / 1000000).toFixed(1)}M`
                        : formatNumber(performer.bourses)
                      }
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '10px',
                    background: '#0a0a0a',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>
                      Win Rate
                    </div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff6b35' }}>
                      {performer.winRate}%
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    padding: '10px',
                    background: '#0a0a0a',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>
                      Combats
                    </div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff6b35' }}>
                      {performer.totalFights}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              color: '#666'
            }}>
              Aucun performer trouvé pour ce serveur
            </div>
          )}
        </div>

        {/* Performance par Classe */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '1.3em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>⚔️</span>
              <span>Performance par Classe</span>
            </h3>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={classPerformanceData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="class" stroke="#999" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#999" />
                <Radar 
                  name="Win Rate %" 
                  dataKey="winRate" 
                  stroke="#ff6b35" 
                  fill="#ff6b35" 
                  fillOpacity={0.6} 
                />
                <Radar 
                  name="Popularité %" 
                  dataKey="popularity" 
                  stroke="#f7931e" 
                  fill="#f7931e" 
                  fillOpacity={0.3} 
                />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
              </RadarChart>
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
          <p>SnowLab v1.0 | Module Kolizéum</p>
          <p>Made with ❤️ for Dofus Unity PvP enthusiasts</p>
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
      `}</style>
    </div>
  );
};

export default KolizeumPage;