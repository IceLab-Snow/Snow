import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Play, Square, RotateCw, Settings, Trash2, Eye, EyeOff, Bell, LogOut, Edit2, Check, X } from 'lucide-react';

// Configuration API
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com',
  endpoints: {
    bots: {
      list: '/bots',
      details: '/bots/{id}',
      start: '/bots/{id}/start',
      stop: '/bots/{id}/stop',
      restart: '/bots/{id}/restart',
      delete: '/bots/{id}/delete',
      logs: '/bots/{id}/logs',
      stats: '/bots/{id}/stats'
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

interface BotDetails {
  id: string;
  name: string;
  class: string;
  level: number;
  serverId: string;
  serverName: string;
  status: 'online' | 'offline' | 'fighting' | 'farming' | 'banking' | 'error';
  position: string;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  kamas: number;
  roses: number;
  bourses: number;
  inventory: {
    used: number;
    total: number;
  };
  stats: {
    kamasPerHour: number;
    rosesPerHour: number;
    boursesPerHour: number;
    fightsPerHour: number;
    deathsToday: number;
    uptime: string;
    lastUpdate: Date;
  };
  config: {
    autoReconnect: boolean;
    farmingStrategy: string;
    bankThreshold: number;
  };
  credentials: {
    accountName: string;
    password: string;
  };
}

interface FilterOptions {
  server: string;
  status: string;
  class: string;
  search: string;
}

const DetailsPage: React.FC = () => {
  // Utilisateur de test pour la démo
  const [user] = useState<User>({
    id: '1',
    username: 'admin',
    role: 'administrator',
    permissions: ['view_all', 'manage_bots', 'view_analytics', 'view_own']
  });

  const [bots, setBots] = useState<BotDetails[]>([]);
  const [filteredBots, setFilteredBots] = useState<BotDetails[]>([]);
  const [selectedBots, setSelectedBots] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterOptions>({
    server: 'all',
    status: 'all',
    class: 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'kamas' | 'level' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // États pour les modales
  const [selectedBot, setSelectedBot] = useState<BotDetails | null>(null);
  const [modalType, setModalType] = useState<'details' | 'logs' | 'stats' | 'compare' | 'charts' | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [editingBotName, setEditingBotName] = useState('');

  // Charger les données au montage
  useEffect(() => {
    loadBots();
  }, []);

  // Appliquer les filtres
  useEffect(() => {
    applyFilters();
  }, [bots, filters, sortBy, sortOrder]);

  const loadBots = async () => {
    setIsLoading(true);
    try {
      // TODO: Remplacer par l'appel API réel
      // const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.bots.list}`, {
      //   headers: {
      //     'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      //   }
      // });
      // const data = await response.json();
      // setBots(data);

      // Données de test
      const fakeBots: BotDetails[] = [
        {
          id: '1',
          name: 'CraBot-01',
          class: 'Cra',
          level: 200,
          serverId: '1',
          serverName: 'Brial',
          status: 'fighting',
          position: '[3, -12]',
          health: 3800,
          maxHealth: 4200,
          energy: 9500,
          maxEnergy: 10000,
          kamas: 2456789,
          roses: 45234,
          bourses: 3234,
          inventory: { used: 85, total: 100 },
          stats: {
            kamasPerHour: 234567,
            rosesPerHour: 3456,
            boursesPerHour: 234,
            fightsPerHour: 45,
            deathsToday: 2,
            uptime: '8h 34m',
            lastUpdate: new Date()
          },
          config: {
            autoReconnect: true,
            farmingStrategy: 'Optimisée',
            bankThreshold: 1000000
          },
          credentials: {
            accountName: 'crabot01_snow',
            password: 'Xk9#mP2$vL8n'
          }
        },
        {
          id: '2',
          name: 'EniBot-02',
          class: 'Eniripsa',
          level: 200,
          serverId: '2',
          serverName: 'Hell Mina',
          status: 'farming',
          position: '[-2, 7]',
          health: 3200,
          maxHealth: 3200,
          energy: 8900,
          maxEnergy: 10000,
          kamas: 5678901,
          roses: 67890,
          bourses: 5678,
          inventory: { used: 45, total: 100 },
          stats: {
            kamasPerHour: 345678,
            rosesPerHour: 4567,
            boursesPerHour: 345,
            fightsPerHour: 52,
            deathsToday: 0,
            uptime: '12h 15m',
            lastUpdate: new Date()
          },
          config: {
            autoReconnect: true,
            farmingStrategy: 'Roses',
            bankThreshold: 2000000
          },
          credentials: {
            accountName: 'enibot02_snow',
            password: 'Qr7&jN4@tY6w'
          }
        },
        {
          id: '3',
          name: 'SacriBot-03',
          class: 'Sacrieur',
          level: 195,
          serverId: '3',
          serverName: 'Draconiros',
          status: 'offline',
          position: '[0, 0]',
          health: 0,
          maxHealth: 5200,
          energy: 0,
          maxEnergy: 10000,
          kamas: 890123,
          roses: 12345,
          bourses: 1234,
          inventory: { used: 0, total: 100 },
          stats: {
            kamasPerHour: 0,
            rosesPerHour: 0,
            boursesPerHour: 0,
            fightsPerHour: 0,
            deathsToday: 5,
            uptime: '0h 0m',
            lastUpdate: new Date(Date.now() - 3600000)
          },
          config: {
            autoReconnect: false,
            farmingStrategy: 'Combat',
            bankThreshold: 500000
          },
          credentials: {
            accountName: 'sacribot03_snow',
            password: 'Hs5!bK9#xM2p'
          }
        },
        {
          id: '4',
          name: 'PandaBot-04',
          class: 'Pandawa',
          level: 200,
          serverId: '1',
          serverName: 'Brial',
          status: 'banking',
          position: '[1, 0]',
          health: 4500,
          maxHealth: 4500,
          energy: 7800,
          maxEnergy: 10000,
          kamas: 3456789,
          roses: 34567,
          bourses: 2345,
          inventory: { used: 95, total: 100 },
          stats: {
            kamasPerHour: 298456,
            rosesPerHour: 3789,
            boursesPerHour: 298,
            fightsPerHour: 48,
            deathsToday: 1,
            uptime: '6h 42m',
            lastUpdate: new Date()
          },
          config: {
            autoReconnect: true,
            farmingStrategy: 'Mixte',
            bankThreshold: 1500000
          },
          credentials: {
            accountName: 'pandabot04_snow',
            password: 'Np3@wZ8$kL6x'
          }
        },
        {
          id: '5',
          name: 'RoublBot-05',
          class: 'Roublard',
          level: 200,
          serverId: '2',
          serverName: 'Hell Mina',
          status: 'online',
          position: '[5, -8]',
          health: 3600,
          maxHealth: 3600,
          energy: 9200,
          maxEnergy: 10000,
          kamas: 4567890,
          roses: 56789,
          bourses: 4567,
          inventory: { used: 72, total: 100 },
          stats: {
            kamasPerHour: 412345,
            rosesPerHour: 5123,
            boursesPerHour: 412,
            fightsPerHour: 58,
            deathsToday: 3,
            uptime: '10h 18m',
            lastUpdate: new Date()
          },
          config: {
            autoReconnect: true,
            farmingStrategy: 'Optimisée',
            bankThreshold: 2500000
          },
          credentials: {
            accountName: 'roublbot05_snow',
            password: 'Vt6%hG3@nQ9z'
          }
        }
      ];

      // Appliquer les noms personnalisés sauvegardés (pour la démo)
      const customNames = JSON.parse(sessionStorage.getItem('botCustomNames') || '{}');
      const botsWithCustomNames = fakeBots.map(bot => ({
        ...bot,
        name: customNames[bot.id] || bot.name
      }));

      setBots(botsWithCustomNames);
    } catch (error) {
      console.error('Erreur chargement des bots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bots];

    // Filtre par serveur
    if (filters.server !== 'all') {
      filtered = filtered.filter(bot => bot.serverId === filters.server);
    }

    // Filtre par statut
    if (filters.status !== 'all') {
      filtered = filtered.filter(bot => bot.status === filters.status);
    }

    // Filtre par classe
    if (filters.class !== 'all') {
      filtered = filtered.filter(bot => bot.class === filters.class);
    }

    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(bot => 
        bot.name.toLowerCase().includes(search) ||
        bot.serverName.toLowerCase().includes(search)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortBy) {
        case 'name':
          compareResult = a.name.localeCompare(b.name);
          break;
        case 'kamas':
          compareResult = a.kamas - b.kamas;
          break;
        case 'level':
          compareResult = a.level - b.level;
          break;
        case 'status':
          compareResult = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    setFilteredBots(filtered);
  };

  const handleBotAction = async (botId: string, action: 'start' | 'stop' | 'restart' | 'delete') => {
    try {
      // TODO: Appel API réel
      console.log(`Action ${action} sur bot ${botId}`);
      
      if (action === 'delete') {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce bot ?')) {
          return;
        }
      }

      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rafraîchir les données
      await loadBots();
    } catch (error) {
      console.error(`Erreur action bot:`, error);
    }
  };

  const handleBulkAction = async (action: 'start' | 'stop' | 'restart' | 'delete') => {
    if (selectedBots.size === 0) {
      alert('Veuillez sélectionner au moins un bot');
      return;
    }

    if (action === 'delete') {
      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedBots.size} bot(s) ?`)) {
        return;
      }
    }

    try {
      // TODO: Appel API pour actions groupées
      console.log(`Action groupée ${action} sur ${selectedBots.size} bots`);
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réinitialiser la sélection et rafraîchir
      setSelectedBots(new Set());
      await loadBots();
    } catch (error) {
      console.error('Erreur action groupée:', error);
    }
  };

  const toggleBotSelection = (botId: string) => {
    const newSelection = new Set(selectedBots);
    if (newSelection.has(botId)) {
      newSelection.delete(botId);
    } else {
      newSelection.add(botId);
    }
    setSelectedBots(newSelection);
  };

  const selectAllBots = () => {
    if (selectedBots.size === filteredBots.length) {
      setSelectedBots(new Set());
    } else {
      setSelectedBots(new Set(filteredBots.map(bot => bot.id)));
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadBots();
    setRefreshing(false);
  };

  const exportData = () => {
    // TODO: Implémenter l'export CSV/JSON
    console.log('Export des données...');
    alert('Fonctionnalité d\'export à venir');
  };

  const openModal = (bot: BotDetails, type: 'details' | 'logs' | 'stats') => {
    setSelectedBot(bot);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedBot(null);
    setModalType(null);
    setShowCredentials(false);
  };

  const openModalForSelection = (type: 'compare' | 'charts') => {
    if (selectedBots.size === 0) {
      alert('Veuillez sélectionner au moins un bot');
      return;
    }
    setModalType(type);
  };

  const startEditingBot = (botId: string, currentName: string) => {
    setEditingBotId(botId);
    setEditingBotName(currentName);
  };

  const cancelEditingBot = () => {
    setEditingBotId(null);
    setEditingBotName('');
  };

  const saveEditedBotName = async (botId: string) => {
    if (!editingBotName.trim()) {
      alert('Le nom ne peut pas être vide');
      return;
    }

    try {
      // TODO: Appel API pour sauvegarder le nouveau nom
      console.log(`Renommage du bot ${botId} en ${editingBotName}`);
      
      // Mise à jour locale temporaire
      setBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, name: editingBotName.trim() } : bot
        )
      );
      
      // Sauvegarde locale pour la démo
      const customNames = JSON.parse(sessionStorage.getItem('botCustomNames') || '{}');
      customNames[botId] = editingBotName.trim();
      sessionStorage.setItem('botCustomNames', JSON.stringify(customNames));
      
      setEditingBotId(null);
      setEditingBotName('');
      
      console.log('Nom sauvegardé avec succès');
    } catch (error) {
      console.error('Erreur lors du renommage:', error);
      alert('Erreur lors du renommage du bot');
    }
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: '#4CAF50',
      fighting: '#ff6b35',
      farming: '#FFC107',
      banking: '#2196F3',
      offline: '#666',
      error: '#F44336'
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      online: 'En ligne',
      fighting: 'En combat',
      farming: 'En récolte',
      banking: 'À la banque',
      offline: 'Hors ligne',
      error: 'Erreur'
    };
    return texts[status] || status;
  };

  const getClassIcon = (className: string) => {
    const icons: Record<string, string> = {
      'Cra': '🏹',
      'Eniripsa': '🧚',
      'Sacrieur': '💀',
      'Pandawa': '🐼',
      'Roublard': '🗡️',
      'Xelor': '⏰',
      'Ecaflip': '🎰',
      'Iop': '⚔️',
      'Feca': '🛡️',
      'Osamodas': '🐲',
      'Enutrof': '💰',
      'Sram': '🎭'
    };
    return icons[className] || '❓';
  };

  // Obtenir les valeurs uniques pour les filtres
  const servers = Array.from(new Set(bots.map(bot => ({ id: bot.serverId, name: bot.serverName }))))
    .filter((server, index, self) => self.findIndex(s => s.id === server.id) === index);
  const classes = Array.from(new Set(bots.map(bot => bot.class)));
  const statuses = ['online', 'offline', 'fighting', 'farming', 'banking', 'error'];

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
          <p style={{ color: '#888' }}>Chargement des détails...</p>
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
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '20px',
        position: 'relative',
        zIndex: 1
      }}>
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
                Système de tracking pour SnowBot
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
                  background: tab.name === 'Détails' ? '#ff6b35' : '#1a1a1a',
                  border: tab.name === 'Détails' ? '2px solid #ff6b35' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  color: tab.name === 'Détails' ? '#000' : '#fff',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                title={tab.name === 'Administration' ? 'Réservé aux administrateurs' : ''}
                onMouseEnter={(e) => {
                  if (tab.name !== 'Détails') {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#ff6b35';
                    e.currentTarget.style.color = '#ff6b35';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab.name !== 'Détails') {
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

        {/* Statistiques globales */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              💰 Kamas moyen/bot
            </div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff6b35' }}>
              {formatNumber(Math.round(
                filteredBots.reduce((sum, bot) => sum + bot.kamas, 0) / (filteredBots.length || 1)
              ))}
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              {formatNumber(Math.round(
                filteredBots.reduce((sum, bot) => sum + bot.stats.kamasPerHour, 0) / (filteredBots.length || 1)
              ))}/h
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              🌹 Roses moyennes/bot
            </div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff1744' }}>
              {formatNumber(Math.round(
                filteredBots.reduce((sum, bot) => sum + bot.roses, 0) / (filteredBots.length || 1)
              ))}
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              {formatNumber(Math.round(
                filteredBots.reduce((sum, bot) => sum + bot.stats.rosesPerHour, 0) / (filteredBots.length || 1)
              ))}/h
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              ⏱️ Session moyenne
            </div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#2196F3' }}>
              {(() => {
                const totalMinutes = filteredBots.reduce((sum, bot) => {
                  const [hours, minutes] = bot.stats.uptime.match(/\d+/g)?.map(Number) || [0, 0];
                  return sum + hours * 60 + minutes;
                }, 0);
                const avgMinutes = Math.round(totalMinutes / (filteredBots.length || 1));
                const hours = Math.floor(avgMinutes / 60);
                const minutes = avgMinutes % 60;
                return `${hours}h ${minutes}m`;
              })()}
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              {filteredBots.filter(bot => bot.status !== 'offline').length} actifs
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              📊 Efficacité globale
            </div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#4CAF50' }}>
              {(() => {
                const avgKamasPerHour = filteredBots.reduce((sum, bot) => sum + bot.stats.kamasPerHour, 0) / (filteredBots.length || 1);
                const maxPossible = 500000;
                const efficiency = Math.min(100, Math.round((avgKamasPerHour / maxPossible) * 100));
                return `${efficiency}%`;
              })()}
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              ⚔️ {Math.round(
                filteredBots.reduce((sum, bot) => sum + bot.stats.fightsPerHour, 0) / (filteredBots.length || 1)
              )} combats/h
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              💀 Morts aujourd'hui
            </div>
            <div style={{ 
              fontSize: '1.8em', 
              fontWeight: 'bold', 
              color: (() => {
                const totalDeaths = filteredBots.reduce((sum, bot) => sum + bot.stats.deathsToday, 0);
                if (totalDeaths === 0) return '#4CAF50';
                if (totalDeaths < 10) return '#FF9800';
                return '#F44336';
              })()
            }}>
              {filteredBots.reduce((sum, bot) => sum + bot.stats.deathsToday, 0)}
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              {Math.round(
                filteredBots.reduce((sum, bot) => sum + bot.stats.deathsToday, 0) / (filteredBots.length || 1) * 10
              ) / 10} moy/bot
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              📦 Inventaire moyen
            </div>
            <div style={{ 
              fontSize: '1.8em', 
              fontWeight: 'bold', 
              color: (() => {
                const avgUsage = filteredBots.reduce((sum, bot) => 
                  sum + (bot.inventory.used / bot.inventory.total * 100), 0
                ) / (filteredBots.length || 1);
                if (avgUsage < 70) return '#4CAF50';
                if (avgUsage < 90) return '#FF9800';
                return '#F44336';
              })()
            }}>
              {Math.round(
                filteredBots.reduce((sum, bot) => 
                  sum + (bot.inventory.used / bot.inventory.total * 100), 0
                ) / (filteredBots.length || 1)
              )}%
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              {filteredBots.filter(bot => bot.inventory.used / bot.inventory.total > 0.9).length} pleins
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              💎 Valeur inventaire
            </div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#9C27B0' }}>
              {(() => {
                // Estimation de la valeur d'inventaire (fictive pour la démo)
                const totalInventoryValue = filteredBots.reduce((sum, bot) => {
                  // Calcul basé sur le taux de remplissage et une valeur moyenne par slot
                  const avgValuePerSlot = 150000; // 150k kamas par slot en moyenne
                  return sum + (bot.inventory.used * avgValuePerSlot);
                }, 0);
                
                if (totalInventoryValue >= 1000000) {
                  return (totalInventoryValue / 1000000).toFixed(1) + 'M';
                }
                return formatNumber(totalInventoryValue);
              })()}
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              {(() => {
                const avgValuePerSlot = 150000;
                const avgInventoryValue = filteredBots.reduce((sum, bot) => 
                  sum + (bot.inventory.used * avgValuePerSlot), 0
                ) / (filteredBots.length || 1);
                
                if (avgInventoryValue >= 1000000) {
                  return (avgInventoryValue / 1000000).toFixed(1) + 'M/bot';
                }
                return formatNumber(Math.round(avgInventoryValue)) + '/bot';
              })()}
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
            <div style={{ color: '#888', fontSize: '0.9em', marginBottom: '5px' }}>
              🏰 Patrimoine total
            </div>
            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#00BCD4' }}>
              {(() => {
                // Patrimoine = Kamas + Valeur inventaire estimée
                const totalKamas = filteredBots.reduce((sum, bot) => sum + bot.kamas, 0);
                const avgValuePerSlot = 150000;
                const totalInventoryValue = filteredBots.reduce((sum, bot) => 
                  sum + (bot.inventory.used * avgValuePerSlot), 0
                );
                const totalPatrimony = totalKamas + totalInventoryValue;
                
                if (totalPatrimony >= 1000000) {
                  return (totalPatrimony / 1000000).toFixed(1) + 'M';
                }
                return formatNumber(totalPatrimony);
              })()}
            </div>
            <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
              {(() => {
                const totalBots = filteredBots.length || 1;
                const totalKamas = filteredBots.reduce((sum, bot) => sum + bot.kamas, 0);
                const avgValuePerSlot = 150000;
                const totalInventoryValue = filteredBots.reduce((sum, bot) => 
                  sum + (bot.inventory.used * avgValuePerSlot), 0
                );
                const avgPatrimony = (totalKamas + totalInventoryValue) / totalBots;
                
                if (avgPatrimony >= 1000000) {
                  return (avgPatrimony / 1000000).toFixed(1) + 'M/bot';
                }
                return formatNumber(Math.round(avgPatrimony)) + '/bot';
              })()}
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                Rechercher
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Nom du bot..."
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 40px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95em'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                Serveur
              </label>
              <select
                value={filters.server}
                onChange={(e) => setFilters({ ...filters, server: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              >
                <option value="all">Tous les serveurs</option>
                {servers.map(server => (
                  <option key={server.id} value={server.id}>{server.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              >
                <option value="all">Tous les statuts</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{getStatusText(status)}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                Classe
              </label>
              <select
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              >
                <option value="all">Toutes les classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              >
                <option value="name">Nom</option>
                <option value="kamas">Kamas</option>
                <option value="level">Niveau</option>
                <option value="status">Statut</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '10px',
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={sortOrder === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Actions groupées */}
        {selectedBots.size > 0 && (
          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid #ff6b35',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div style={{ color: '#ff6b35' }}>
              {selectedBots.size} bot{selectedBots.size > 1 ? 's' : ''} sélectionné{selectedBots.size > 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => openModalForSelection('compare')}
                style={{
                  padding: '8px 16px',
                  background: '#2196F3',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📊 Comparer
              </button>
              <button
                onClick={() => openModalForSelection('charts')}
                style={{
                  padding: '8px 16px',
                  background: '#9C27B0',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📈 Graphiques
              </button>
            </div>
          </div>
        )}

        {/* Liste des bots */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #333'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#252525' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>
                  <input
                    type="checkbox"
                    checked={selectedBots.size === filteredBots.length && filteredBots.length > 0}
                    onChange={selectAllBots}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Bot
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Serveur
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Statut
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Position
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Vitalité
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Ressources
                </th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Stats/h
                </th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #333', color: '#ff6b35' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBots.map((bot, index) => (
                <tr 
                  key={bot.id}
                  style={{
                    borderBottom: '1px solid #333',
                    background: selectedBots.has(bot.id) ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                    transition: 'background 0.3s ease'
                  }}
                >
                  <td style={{ padding: '15px' }}>
                    <input
                      type="checkbox"
                      checked={selectedBots.has(bot.id)}
                      onChange={() => toggleBotSelection(bot.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${getStatusColor(bot.status)}, ${getStatusColor(bot.status)}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5em'
                      }}>
                        {getClassIcon(bot.class)}
                      </div>
                      <div>
                        {editingBotId === bot.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                              type="text"
                              value={editingBotName}
                              onChange={(e) => setEditingBotName(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  saveEditedBotName(bot.id);
                                } else if (e.key === 'Escape') {
                                  cancelEditingBot();
                                }
                              }}
                              style={{
                                background: '#0a0a0a',
                                border: '1px solid #ff6b35',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: '#fff',
                                fontSize: '1em',
                                width: '150px'
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditedBotName(bot.id)}
                              style={{
                                background: '#4CAF50',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px',
                                cursor: 'pointer',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Valider"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEditingBot}
                              style={{
                                background: '#F44336',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '4px',
                                cursor: 'pointer',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Annuler"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: '#ff6b35' }}>{bot.name}</span>
                            <button
                              onClick={() => startEditingBot(bot.id, bot.name)}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '2px',
                                cursor: 'pointer',
                                color: '#666',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#ff6b35'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                              title="Renommer"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        )}
                        <div style={{ fontSize: '0.85em', color: '#888' }}>
                          {bot.class} • Niveau {bot.level}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    {bot.serverName}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      background: `${getStatusColor(bot.status)}20`,
                      color: getStatusColor(bot.status),
                      fontSize: '0.85em',
                      fontWeight: 'bold'
                    }}>
                      {getStatusText(bot.status)}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '0.9em' }}>
                      {bot.position}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ marginBottom: '5px' }}>
                      <div style={{ fontSize: '0.8em', color: '#888' }}>PV</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: '#333',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(bot.health / bot.maxHealth) * 100}%`,
                            height: '100%',
                            background: bot.health / bot.maxHealth > 0.5 ? '#4CAF50' : '#F44336'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.85em' }}>
                          {Math.round((bot.health / bot.maxHealth) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8em', color: '#888' }}>Énergie</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          flex: 1,
                          height: '6px',
                          background: '#333',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(bot.energy / bot.maxEnergy) * 100}%`,
                            height: '100%',
                            background: '#2196F3'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.85em' }}>
                          {Math.round((bot.energy / bot.maxEnergy) * 100)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '0.9em' }}>
                      <div>💰 {formatNumber(bot.kamas)}</div>
                      <div>🌹 {formatNumber(bot.roses)}</div>
                      <div>🏆 {formatNumber(bot.bourses)}</div>
                      <div style={{ marginTop: '5px', color: '#888' }}>
                        Inventaire: {bot.inventory.used}/{bot.inventory.total}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '0.85em' }}>
                      <div>💰 {formatNumber(bot.stats.kamasPerHour)}/h</div>
                      <div>🌹 {formatNumber(bot.stats.rosesPerHour)}/h</div>
                      <div>⚔️ {bot.stats.fightsPerHour} combats/h</div>
                      <div style={{ marginTop: '5px', color: '#888' }}>
                        Uptime: {bot.stats.uptime}
                      </div>
                      {bot.stats.deathsToday > 0 && (
                        <div style={{ color: '#F44336' }}>
                          💀 {bot.stats.deathsToday} mort{bot.stats.deathsToday > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openModal(bot, 'details')}
                        style={{
                          padding: '6px',
                          background: '#2196F3',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#fff'
                        }}
                        title="Voir les détails"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModal(bot, 'logs')}
                        style={{
                          padding: '6px',
                          background: '#9C27B0',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#fff'
                        }}
                        title="Logs"
                      >
                        📜
                      </button>
                      <button
                        onClick={() => openModal(bot, 'stats')}
                        style={{
                          padding: '6px',
                          background: '#FF9800',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#000'
                        }}
                        title="Statistiques"
                      >
                        📊
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBots.length === 0 && (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>Aucun bot trouvé</p>
              <p style={{ fontSize: '0.9em' }}>Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '30px 0',
          color: '#666',
          borderTop: '1px solid #333',
          marginTop: '50px'
        }}>
          <p>SnowLab v1.0 | Module Détails</p>
          <p>Made with ❤️ for Dofus Unity botters</p>
        </div>
      </div>

      {/* Modales */}
      {modalType && (selectedBot || modalType === 'compare' || modalType === 'charts') && (
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
        onClick={closeModal}
        >
          <div 
            style={{
              background: '#1a1a1a',
              borderRadius: '15px',
              width: '100%',
              maxWidth: modalType === 'stats' ? '900px' : '700px',
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
                {modalType === 'details' && selectedBot && '👁️ Détails de ' + selectedBot.name}
                {modalType === 'logs' && selectedBot && '📜 Logs de ' + selectedBot.name}
                {modalType === 'stats' && selectedBot && '📊 Statistiques de ' + selectedBot.name}
                {modalType === 'compare' && '📊 Comparaison des bots sélectionnés'}
                {modalType === 'charts' && '📈 Graphiques des bots sélectionnés'}
              </h3>
              <button
                onClick={closeModal}
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
              {modalType === 'details' && selectedBot && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                  }}>
                    {/* Informations générales */}
                    <div style={{
                      background: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>Informations générales</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Classe:</span>
                          <span>{selectedBot.class} {getClassIcon(selectedBot.class)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Niveau:</span>
                          <span>{selectedBot.level}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Serveur:</span>
                          <span>{selectedBot.serverName}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Position:</span>
                          <span>{selectedBot.position}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Dernière MAJ:</span>
                          <span>{new Date(selectedBot.stats.lastUpdate).toLocaleString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Informations de connexion */}
                    <div style={{
                      background: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ 
                        color: '#ff6b35', 
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>🔐 Informations de connexion</span>
                        <button
                          onClick={() => setShowCredentials(!showCredentials)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.9em'
                          }}
                        >
                          {showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
                          {showCredentials ? 'Masquer' : 'Afficher'}
                        </button>
                      </h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#888' }}>Nom du compte:</span>
                          <span style={{ 
                            fontFamily: 'monospace',
                            background: '#1a1a1a',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            fontSize: '0.9em'
                          }}>
                            {showCredentials ? selectedBot.credentials.accountName : '••••••••••••••'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#888' }}>Mot de passe:</span>
                          <span style={{ 
                            fontFamily: 'monospace',
                            background: '#1a1a1a',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            fontSize: '0.9em'
                          }}>
                            {showCredentials ? selectedBot.credentials.password : '••••••••••••'}
                          </span>
                        </div>
                        {showCredentials && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: 'rgba(255, 152, 0, 0.1)',
                            border: '1px solid #FF9800',
                            borderRadius: '5px',
                            fontSize: '0.85em',
                            color: '#FF9800'
                          }}>
                            ⚠️ Ces informations sont sensibles. Ne les partagez jamais.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Configuration */}
                    <div style={{
                      background: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>Configuration</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Auto-reconnexion:</span>
                          <span style={{ color: selectedBot.config.autoReconnect ? '#4CAF50' : '#F44336' }}>
                            {selectedBot.config.autoReconnect ? 'Activée' : 'Désactivée'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Stratégie:</span>
                          <span>{selectedBot.config.farmingStrategy}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Seuil banque:</span>
                          <span>{formatNumber(selectedBot.config.bankThreshold)} kamas</span>
                        </div>
                      </div>
                    </div>

                    {/* Statistiques détaillées */}
                    <div style={{
                      background: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid #333'
                    }}>
                      <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>Performance</h4>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Uptime:</span>
                          <span>{selectedBot.stats.uptime}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Morts aujourd'hui:</span>
                          <span style={{ color: selectedBot.stats.deathsToday > 0 ? '#F44336' : '#4CAF50' }}>
                            {selectedBot.stats.deathsToday}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#888' }}>Efficacité:</span>
                          <span style={{ color: '#ff6b35' }}>
                            {Math.round((selectedBot.stats.kamasPerHour / 500000) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'logs' && selectedBot && (
                <div>
                  <div style={{
                    background: '#0a0a0a',
                    padding: '15px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                    maxHeight: '500px',
                    overflow: 'auto'
                  }}>
                    {/* Logs simulés */}
                    <div style={{ marginBottom: '10px', color: '#4CAF50' }}>
                      [2024-01-20 14:32:45] Bot démarré avec succès
                    </div>
                    <div style={{ marginBottom: '10px', color: '#2196F3' }}>
                      [2024-01-20 14:33:12] Connexion au serveur {selectedBot.serverName}
                    </div>
                    <div style={{ marginBottom: '10px', color: '#FFC107' }}>
                      [2024-01-20 14:35:23] Combat démarré contre Bouftou
                    </div>
                    <div style={{ marginBottom: '10px', color: '#4CAF50' }}>
                      [2024-01-20 14:36:45] Combat gagné: +1234 kamas, +23 roses
                    </div>
                    <div style={{ marginBottom: '10px', color: '#9C27B0' }}>
                      [2024-01-20 14:40:12] Déplacement vers [3, -12]
                    </div>
                    <div style={{ marginBottom: '10px', color: '#FFC107' }}>
                      [2024-01-20 14:42:34] Récolte de ressources en cours...
                    </div>
                    <div style={{ marginBottom: '10px', color: '#4CAF50' }}>
                      [2024-01-20 14:43:56] Récolte terminée: +156 blé
                    </div>
                    <div style={{ marginBottom: '10px', color: '#F44336' }}>
                      [2024-01-20 14:45:23] Inventaire plein (95/100)
                    </div>
                    <div style={{ marginBottom: '10px', color: '#2196F3' }}>
                      [2024-01-20 14:46:12] Retour à la banque en cours...
                    </div>
                    <div style={{ marginBottom: '10px', color: '#4CAF50' }}>
                      [2024-01-20 14:48:34] Dépôt en banque effectué
                    </div>
                    <div style={{ marginBottom: '10px', color: '#FF9800' }}>
                      [2024-01-20 14:50:12] Maintenance du bot prévue dans 10 minutes
                    </div>
                    <div style={{ marginBottom: '10px', color: '#9C27B0' }}>
                      [2024-01-20 14:52:45] Archimonstre détecté à proximité
                    </div>
                    <div style={{ marginBottom: '10px', color: '#4CAF50' }}>
                      [2024-01-20 14:55:23] Niveau supérieur atteint! Niveau {selectedBot.level}
                    </div>
                  </div>
                  <div style={{
                    marginTop: '15px',
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center'
                  }}>
                    <button style={{
                      padding: '10px 20px',
                      background: '#252525',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}>
                      <Download size={16} style={{ marginRight: '8px', display: 'inline' }} />
                      Télécharger les logs
                    </button>
                    <button style={{
                      padding: '10px 20px',
                      background: '#252525',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}>
                      <RefreshCw size={16} style={{ marginRight: '8px', display: 'inline' }} />
                      Actualiser
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'stats' && selectedBot && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: '#0a0a0a',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #333',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#888', fontSize: '0.9em' }}>Total Kamas</div>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ff6b35' }}>
                        {formatNumber(selectedBot.kamas)}
                      </div>
                    </div>
                    <div style={{
                      background: '#0a0a0a',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #333',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#888', fontSize: '0.9em' }}>Total Roses</div>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ff1744' }}>
                        {formatNumber(selectedBot.roses)}
                      </div>
                    </div>
                    <div style={{
                      background: '#0a0a0a',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #333',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#888', fontSize: '0.9em' }}>Total Bourses</div>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ff6b35' }}>
                        {formatNumber(selectedBot.bourses)}
                      </div>
                    </div>
                    <div style={{
                      background: '#0a0a0a',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #333',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#888', fontSize: '0.9em' }}>Combats/h</div>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#4CAF50' }}>
                        {selectedBot.stats.fightsPerHour}
                      </div>
                    </div>
                  </div>

                  {/* Graphique simulé */}
                  <div style={{
                    background: '#0a0a0a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>
                      Evolution sur 24h
                    </h4>
                    {/* Graphique en ligne simple */}
                    <div style={{ height: '200px', position: 'relative' }}>
                      {/* Axes */}
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '40px',
                        right: '20px',
                        top: '20px',
                        borderLeft: '2px solid #333',
                        borderBottom: '2px solid #333'
                      }}>
                        {/* Ligne de tendance */}
                        <svg style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%'
                        }}>
                          <polyline
                            points="0,120 50,100 100,90 150,70 200,60 250,40 300,35 350,20 400,15"
                            fill="none"
                            stroke="#ff6b35"
                            strokeWidth="3"
                          />
                          <polyline
                            points="0,120 50,100 100,90 150,70 200,60 250,40 300,35 350,20 400,15"
                            fill="url(#gradient)"
                            fillOpacity="0.3"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* Labels Y */}
                        <div style={{
                          position: 'absolute',
                          left: '-35px',
                          top: '0',
                          fontSize: '0.8em',
                          color: '#888'
                        }}>
                          {formatNumber(selectedBot.stats.kamasPerHour * 1.2)}
                        </div>
                        <div style={{
                          position: 'absolute',
                          left: '-35px',
                          bottom: '0',
                          fontSize: '0.8em',
                          color: '#888'
                        }}>
                          0
                        </div>
                        
                        {/* Labels X */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-20px',
                          left: '0',
                          fontSize: '0.8em',
                          color: '#888'
                        }}>
                          00h
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '-20px',
                          right: '0',
                          fontSize: '0.8em',
                          color: '#888'
                        }}>
                          24h
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graphique en barres - Répartition des gains */}
                  <div style={{
                    background: '#0a0a0a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>
                      Répartition des gains (dernières 6h)
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '150px' }}>
                      {[65, 78, 82, 71, 88, 92].map((value, index) => (
                        <div key={index} style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <div style={{
                            width: '100%',
                            height: `${value}%`,
                            background: 'linear-gradient(to top, #ff6b35, #f7931e)',
                            borderRadius: '5px 5px 0 0',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: '-20px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.7em',
                              whiteSpace: 'nowrap'
                            }}>
                              {formatNumber(Math.floor(selectedBot.stats.kamasPerHour * value / 100))}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.7em', color: '#888' }}>
                            {19 + index}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Graphique circulaire - Répartition des activités */}
                  <div style={{
                    background: '#0a0a0a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333'
                  }}>
                    <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>
                      Répartition du temps
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                      {/* Donut chart simple */}
                      <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                        <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="75" cy="75" r="60" fill="none" stroke="#333" strokeWidth="20" />
                          <circle 
                            cx="75" 
                            cy="75" 
                            r="60" 
                            fill="none" 
                            stroke="#ff6b35" 
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 60 * 0.45} ${2 * Math.PI * 60}`}
                          />
                          <circle 
                            cx="75" 
                            cy="75" 
                            r="60" 
                            fill="none" 
                            stroke="#4CAF50" 
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 60 * 0.35} ${2 * Math.PI * 60}`}
                            strokeDashoffset={`-${2 * Math.PI * 60 * 0.45}`}
                          />
                          <circle 
                            cx="75" 
                            cy="75" 
                            r="60" 
                            fill="none" 
                            stroke="#2196F3" 
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 60 * 0.20} ${2 * Math.PI * 60}`}
                            strokeDashoffset={`-${2 * Math.PI * 60 * 0.80}`}
                          />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>100%</div>
                          <div style={{ fontSize: '0.8em', color: '#888' }}>Actif</div>
                        </div>
                      </div>
                      
                      {/* Légende */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '15px', height: '15px', background: '#ff6b35', borderRadius: '3px' }} />
                          <span>Combat (45%)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '15px', height: '15px', background: '#4CAF50', borderRadius: '3px' }} />
                          <span>Récolte (35%)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '15px', height: '15px', background: '#2196F3', borderRadius: '3px' }} />
                          <span>Déplacement (20%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: '20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}>
                    <select style={{
                      padding: '10px',
                      background: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <option>Dernières 24h</option>
                      <option>Derniers 7 jours</option>
                      <option>Dernier mois</option>
                    </select>
                    <button style={{
                      padding: '10px 20px',
                      background: '#ff6b35',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}>
                      Exporter les statistiques
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'compare' && (
                <div>
                  <h3 style={{ 
                    marginBottom: '20px', 
                    color: '#ff6b35',
                    textAlign: 'center' 
                  }}>
                    Comparaison de {selectedBots.size} bots
                  </h3>
                  
                  {/* Tableau de comparaison */}
                  <div style={{
                    background: '#0a0a0a',
                    borderRadius: '10px',
                    padding: '15px',
                    position: 'relative'
                  }}>
                    <div style={{
                      overflowX: 'auto',
                      overflowY: 'visible'
                    }}>
                      <table style={{
                        borderCollapse: 'collapse',
                        minWidth: '800px',
                        width: '100%'
                      }}>
                        <thead>
                          <tr>
                            <th style={{
                              padding: '10px',
                              textAlign: 'left',
                              borderBottom: '2px solid #333',
                              color: '#ff6b35',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 2,
                              minWidth: '150px'
                            }}>
                              Métrique
                            </th>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <th key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '2px solid #333',
                                  color: '#fff',
                                  minWidth: '120px'
                                }}>
                                  <div>{bot.name}</div>
                                  <div style={{ fontSize: '0.8em', color: '#888' }}>
                                    {bot.serverName}
                                  </div>
                                </th>
                              ) : null;
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              borderBottom: '1px solid #333', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Niveau
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #333'
                                }}>
                                  {bot.level}
                                </td>
                              ) : null;
                            })}
                          </tr>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              borderBottom: '1px solid #333', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Kamas totaux
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #333',
                                  color: '#ff6b35'
                                }}>
                                  {formatNumber(bot.kamas)}
                                </td>
                              ) : null;
                            })}
                          </tr>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              borderBottom: '1px solid #333', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Kamas/h
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #333'
                                }}>
                                  {formatNumber(bot.stats.kamasPerHour)}
                                </td>
                              ) : null;
                            })}
                          </tr>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              borderBottom: '1px solid #333', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Roses totales
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #333',
                                  color: '#ff1744'
                                }}>
                                  {formatNumber(bot.roses)}
                                </td>
                              ) : null;
                            })}
                          </tr>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              borderBottom: '1px solid #333', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Combats/h
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #333'
                                }}>
                                  {bot.stats.fightsPerHour}
                                </td>
                              ) : null;
                            })}
                          </tr>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              borderBottom: '1px solid #333', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Morts aujourd'hui
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #333',
                                  color: bot.stats.deathsToday > 0 ? '#F44336' : '#4CAF50'
                                }}>
                                  {bot.stats.deathsToday}
                                </td>
                              ) : null;
                            })}
                          </tr>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              borderBottom: '1px solid #333', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Uptime
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center',
                                  borderBottom: '1px solid #333'
                                }}>
                                  {bot.stats.uptime}
                                </td>
                              ) : null;
                            })}
                          </tr>
                          <tr>
                            <td style={{ 
                              padding: '10px', 
                              color: '#888',
                              position: 'sticky',
                              left: 0,
                              background: '#0a0a0a',
                              zIndex: 1
                            }}>
                              Efficacité
                            </td>
                            {Array.from(selectedBots).map(botId => {
                              const bot = bots.find(b => b.id === botId);
                              const efficiency = bot ? Math.round((bot.stats.kamasPerHour / 500000) * 100) : 0;
                              return bot ? (
                                <td key={botId} style={{
                                  padding: '10px',
                                  textAlign: 'center'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                  }}>
                                    <div style={{
                                      width: '100px',
                                      height: '8px',
                                      background: '#333',
                                      borderRadius: '4px',
                                      overflow: 'hidden'
                                    }}>
                                      <div style={{
                                        width: `${efficiency}%`,
                                        height: '100%',
                                        background: efficiency > 70 ? '#4CAF50' : efficiency > 40 ? '#FF9800' : '#F44336'
                                      }} />
                                    </div>
                                    <span>{efficiency}%</span>
                                  </div>
                                </td>
                              ) : null;
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Meilleur bot */}
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid #4CAF50',
                    borderRadius: '10px'
                  }}>
                    <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>
                      🏆 Meilleur performeur
                    </h4>
                    {(() => {
                      const selectedBotsList = Array.from(selectedBots)
                        .map(id => bots.find(b => b.id === id))
                        .filter(Boolean) as BotDetails[];
                      
                      const bestBot = selectedBotsList.reduce((best, bot) => 
                        bot.stats.kamasPerHour > best.stats.kamasPerHour ? bot : best
                      , selectedBotsList[0]);
                      
                      return (
                        <div>
                          <strong>{bestBot.name}</strong> avec {formatNumber(bestBot.stats.kamasPerHour)} kamas/h
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {modalType === 'charts' && (
                <div>
                  <h3 style={{ 
                    marginBottom: '20px', 
                    color: '#ff6b35',
                    textAlign: 'center' 
                  }}>
                    Graphiques pour {selectedBots.size} bots sélectionnés
                  </h3>

                  {/* Statistiques agrégées */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    {(() => {
                      const selectedBotsList = Array.from(selectedBots)
                        .map(id => bots.find(b => b.id === id))
                        .filter(Boolean) as BotDetails[];
                      
                      const totalKamas = selectedBotsList.reduce((sum, bot) => sum + bot.kamas, 0);
                      const totalRoses = selectedBotsList.reduce((sum, bot) => sum + bot.roses, 0);
                      const totalBourses = selectedBotsList.reduce((sum, bot) => sum + bot.bourses, 0);
                      const totalKamasPerHour = selectedBotsList.reduce((sum, bot) => sum + bot.stats.kamasPerHour, 0);
                      
                      return (
                        <>
                          <div style={{
                            background: '#0a0a0a',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid #333',
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#888', fontSize: '0.9em' }}>Total Kamas</div>
                            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff6b35' }}>
                              {formatNumber(totalKamas)}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#888' }}>
                              {formatNumber(totalKamasPerHour)}/h combiné
                            </div>
                          </div>
                          <div style={{
                            background: '#0a0a0a',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid #333',
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#888', fontSize: '0.9em' }}>Total Roses</div>
                            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff1744' }}>
                              {formatNumber(totalRoses)}
                            </div>
                          </div>
                          <div style={{
                            background: '#0a0a0a',
                            padding: '20px',
                            borderRadius: '10px',
                            border: '1px solid #333',
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#888', fontSize: '0.9em' }}>Total Bourses</div>
                            <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#ff6b35' }}>
                              {formatNumber(totalBourses)}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Graphique en barres - Performance par bot */}
                  <div style={{
                    background: '#0a0a0a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>
                      Performance Kamas/h par bot
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '200px' }}>
                      {Array.from(selectedBots).map(botId => {
                        const bot = bots.find(b => b.id === botId);
                        if (!bot) return null;
                        
                        const maxKamasPerHour = Math.max(...Array.from(selectedBots)
                          .map(id => bots.find(b => b.id === id)?.stats.kamasPerHour || 0));
                        const heightPercent = (bot.stats.kamasPerHour / maxKamasPerHour) * 100;
                        
                        return (
                          <div key={botId} style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px'
                          }}>
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'flex-end'
                            }}>
                              <div style={{
                                width: '100%',
                                height: `${heightPercent}%`,
                                background: 'linear-gradient(to top, #ff6b35, #f7931e)',
                                borderRadius: '5px 5px 0 0',
                                position: 'relative',
                                minHeight: '20px'
                              }}>
                                <div style={{
                                  position: 'absolute',
                                  top: '-25px',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: '0.8em',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {formatNumber(bot.stats.kamasPerHour)}
                                </div>
                              </div>
                            </div>
                            <div style={{
                              fontSize: '0.85em',
                              textAlign: 'center',
                              color: '#888'
                            }}>
                              {bot.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Répartition par statut */}
                  <div style={{
                    background: '#0a0a0a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333'
                  }}>
                    <h4 style={{ color: '#ff6b35', marginBottom: '15px' }}>
                      Répartition par statut
                    </h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {(() => {
                        const selectedBotsList = Array.from(selectedBots)
                          .map(id => bots.find(b => b.id === id))
                          .filter(Boolean) as BotDetails[];
                        
                        const statusCount = selectedBotsList.reduce((acc, bot) => {
                          acc[bot.status] = (acc[bot.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        
                        return Object.entries(statusCount).map(([status, count]) => (
                          <div key={status} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}>
                              <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: getStatusColor(status)
                              }} />
                              <span>{getStatusText(status)}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}>
                              <div style={{
                                width: '100px',
                                height: '8px',
                                background: '#333',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${(count / selectedBotsList.length) * 100}%`,
                                  height: '100%',
                                  background: getStatusColor(status)
                                }} />
                              </div>
                              <span>{count}</span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
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
        
        /* Styles pour les inputs et selects */
        input[type="text"], select {
          outline: none;
        }
        
        input[type="text"]:focus, select:focus {
          border-color: #ff6b35 !important;
          box-shadow: 0 0 10px rgba(255, 107, 53, 0.2);
        }
        
        /* Hover sur les boutons */
        button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        /* Hover sur les lignes du tableau */
        tbody tr:hover {
          background: rgba(255, 107, 53, 0.05) !important;
        }
        
        /* Checkbox custom */
        input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #ff6b35;
        }
        
        /* Scrollbar custom */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
          table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailsPage;