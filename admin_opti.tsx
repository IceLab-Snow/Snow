import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings, Bell, LogOut, Plus, Edit2, Trash2, Key, Download, Search, Filter } from 'lucide-react';

// Configuration API
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com',
  endpoints: {
    admin: {
      users: '/admin/users',
      createUser: '/admin/users',
      updateUser: '/admin/users/{id}',
      deleteUser: '/admin/users/{id}',
      accessLogs: '/admin/access-logs',
      stats: '/admin/stats',
      generateToken: '/admin/generate-token',
      farmingZones: '/admin/farming-zones',
      userPerformances: '/admin/performances',
      allBots: '/admin/all-bots'
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

interface AdminUser {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user' | 'viewer';
  apiToken?: string;
  maxBots: number;
  activeBots: number;
  assignedCharacters?: string[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

interface AccessLog {
  id: string;
  userId: string;
  username: string;
  action: 'login_success' | 'login_failed' | 'logout' | 'api_call' | 'permission_denied';
  details?: string;
  ipAddress?: string;
  timestamp: Date;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  todayLogins: number;
  totalBotsAssigned: number;
  apiCallsToday: number;
  avgBotsPerUser: number;
}

interface CreateUserForm {
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  maxBots: number;
  isActive: boolean;
  apiToken?: string;
}

interface BotInZone {
  botId: string;
  botName: string;
  userId: string;
  username: string;
  arrivalTime: Date;
  activity: 'fighting' | 'farming' | 'moving';
}

interface FarmingZone {
  id: string;
  name: string;
  coordinates: string;
  mapId: string;
  totalBots: number;
  activeNow: number;
  resources: string[];
  monsters: string[];
  avgLevel: number;
  stats: {
    totalVisits24h: number;
    avgTimeSpent: number;
    kamasGenerated: number;
    rosesCollected: number;
    deathRate: number;
  };
  popularity: number;
  efficiency: number;
  danger: number;
  botsByUser?: Record<string, {
    count: number;
    bots: BotInZone[];
  }>;
}

interface UserPerformance {
  userId: string;
  username: string;
  role: string;
  activeBots: number;
  dailyStats: {
    kamasGenerated: number;
    rosesCollected: number;
    boursesWon: number;
    fightsCompleted: number;
    averageEfficiency: number;
  };
  weeklyStats: {
    kamasGenerated: number;
    trend: number;
  };
  monthlyStats: {
    kamasGenerated: number;
    trend: number;
  };
  patrimony: {
    liquidKamas: number;
    inventoryValue: number;
    totalValue: number;
    growthRate: number;
  };
}

interface Bot {
  id: string;
  name: string;
  userId: string;
  username: string;
  x: number;
  y: number;
  serverId: string;
  serverName: string;
  status: 'fighting' | 'farming' | 'banking' | 'idle' | 'moving' | 'offline';
  class: string;
  level: number;
  lastUpdate: Date;
}

const AdminPage: React.FC = () => {
  // États
  const [user] = useState<User>({
    id: '1',
    username: 'admin',
    role: 'administrator',
    permissions: ['view_all', 'manage_bots', 'view_analytics', 'view_own', 'manage_users']
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    todayLogins: 0,
    totalBotsAssigned: 0,
    apiCallsToday: 0,
    avgBotsPerUser: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserForm>({
    username: '',
    password: '',
    email: '',
    role: 'user',
    maxBots: 5,
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateUserForm>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapFilterUser, setMapFilterUser] = useState<string>('all');
  const [allBots, setAllBots] = useState<Bot[]>([]);
  const [userPerformances, setUserPerformances] = useState<UserPerformance[]>([]);
  const [farmingZones, setFarmingZones] = useState<FarmingZone[]>([]);
  const [zoneFilterUser, setZoneFilterUser] = useState<string>('all');

  // Chargement initial
  useEffect(() => {
    checkAdminPermission();
    loadInitialData();
  }, []);

  // Auto-refresh des logs toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAccessLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkAdminPermission = () => {
    if (!user.permissions.includes('manage_users')) {
      // Redirection vers la page d'accueil
      window.location.href = '/';
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchAccessLogs(),
        fetchStats(),
        fetchUserPerformances(),
        fetchFarmingZones()
      ]);
    } catch (error) {
      console.error('Erreur chargement des données:', error);
      setErrorMessage('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.admin.users}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur fetchUsers:', error);
      setUsers([]);
    }
  };

  const fetchAccessLogs = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.admin.accessLogs}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des logs');
      
      const data = await response.json();
      setAccessLogs(data);
    } catch (error) {
      console.error('Erreur fetchAccessLogs:', error);
      setAccessLogs([]);
    }
  };

  const fetchAllBots = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.admin.allBots}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des bots');
      
      const data = await response.json();
      setAllBots(data);
    } catch (error) {
      console.error('Erreur fetchAllBots:', error);
      setAllBots([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.admin.stats}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur fetchStats:', error);
      // Calcul des stats à partir des données locales si l'API échoue
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive).length;
      const todayLogins = accessLogs.filter(log => 
        log.action === 'login_success' && 
        new Date(log.timestamp).toDateString() === new Date().toDateString()
      ).length;
      const totalBotsAssigned = users.reduce((sum, user) => sum + user.maxBots, 0);
      const apiCallsToday = accessLogs.filter(log => 
        log.action === 'api_call' && 
        new Date(log.timestamp).toDateString() === new Date().toDateString()
      ).length;
      const avgBotsPerUser = totalUsers > 0 ? Math.round(totalBotsAssigned / totalUsers) : 0;

      setStats({
        totalUsers,
        activeUsers,
        todayLogins,
        totalBotsAssigned,
        apiCallsToday,
        avgBotsPerUser
      });
    }
  };

  const fetchUserPerformances = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.admin.userPerformances}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des performances');
      
      const data = await response.json();
      setUserPerformances(data.sort((a: UserPerformance, b: UserPerformance) => 
        b.dailyStats.kamasGenerated - a.dailyStats.kamasGenerated
      ));
    } catch (error) {
      console.error('Erreur fetchUserPerformances:', error);
      setUserPerformances([]);
    }
  };

  const fetchFarmingZones = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.admin.farmingZones}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des zones');
      
      const data = await response.json();
      setFarmingZones(data.sort((a: FarmingZone, b: FarmingZone) => b.popularity - a.popularity));
    } catch (error) {
      console.error('Erreur fetchFarmingZones:', error);
      setFarmingZones([]);
    }
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

  const refreshData = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
    showSuccess('Données actualisées avec succès');
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      role: 'user',
      maxBots: 5,
      isActive: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Ne pas afficher le mot de passe
      email: user.email || '',
      role: user.role,
      maxBots: user.maxBots,
      isActive: user.isActive,
      apiToken: user.apiToken
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      role: 'user',
      maxBots: 5,
      isActive: true
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateUserForm> = {};

    if (!editingUser && !formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!editingUser && !formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email invalide';
    }

    if (formData.maxBots < 0 || formData.maxBots > 999) {
      errors.maxBots = 1; // Utiliser 1 comme indicateur d'erreur
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      fighting: '#ff6b35',
      farming: '#FFC107',
      banking: '#4CAF50',
      idle: '#2196F3',
      moving: '#9C27B0',
      offline: '#666'
    };
    return colors[status] || '#666';
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
      'Iop': '⚔️'
    };
    return icons[className] || '❓';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const endpoint = editingUser 
        ? API_CONFIG.endpoints.admin.updateUser.replace('{id}', editingUser.id)
        : API_CONFIG.endpoints.admin.createUser;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur lors de l\'enregistrement');
      
      showSuccess(editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
      closeModal();
      await fetchUsers();
    } catch (error) {
      console.error('Erreur handleSubmit:', error);
      showError('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.admin.deleteUser.replace('{id}', userId)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      showSuccess('Utilisateur supprimé avec succès');
      setShowDeleteConfirm(null);
      await fetchUsers();
    } catch (error) {
      console.error('Erreur handleDelete:', error);
      showError('Erreur lors de la suppression');
    }
  };

  const generateApiToken = () => {
    const token = 'snowbot_' + 
      Math.random().toString(36).substring(2, 10) + 
      Math.random().toString(36).substring(2, 10);
    setFormData({ ...formData, apiToken: token });
  };

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Username', 'Email', 'Role', 'API Token', 'Max Bots', 'Active Bots', 'Status', 'Created', 'Last Login'],
      ...filteredUsers.map(u => [
        u.id,
        u.username,
        u.email || '',
        u.role,
        u.apiToken || '',
        u.maxBots,
        u.activeBots,
        u.isActive ? 'Active' : 'Inactive',
        formatDate(u.createdAt),
        u.lastLogin ? formatDate(u.lastLogin) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snowlab_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `il y a ${days}j`;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ff6b35';
      case 'user': return '#2196F3';
      case 'viewer': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      case 'viewer': return 'Visualiseur';
      default: return role;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login_success': return '✅';
      case 'login_failed': return '❌';
      case 'logout': return '🚪';
      case 'api_call': return '📡';
      case 'permission_denied': return '🚫';
      default: return '📝';
    }
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'login_success': return 'Connexion réussie';
      case 'login_failed': return 'Échec connexion';
      case 'logout': return 'Déconnexion';
      case 'api_call': return 'Appel API';
      case 'permission_denied': return 'Permission refusée';
      default: return action;
    }
  };

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtrage des zones par utilisateur
  const getFilteredZones = () => {
    if (zoneFilterUser === 'all') {
      return farmingZones;
    }

    // Filtrer et recalculer les stats pour l'utilisateur sélectionné
    return farmingZones.map(zone => {
      const userBots = zone.botsByUser?.[zoneFilterUser];
      if (!userBots || userBots.count === 0) {
        return null;
      }

      // Recalculer les stats proportionnellement aux bots de l'utilisateur
      const userRatio = userBots.count / zone.totalBots;
      
      return {
        ...zone,
        totalBots: userBots.count,
        activeNow: userBots.count,
        stats: {
          ...zone.stats,
          kamasGenerated: Math.round(zone.stats.kamasGenerated * userRatio),
          rosesCollected: Math.round(zone.stats.rosesCollected * userRatio),
          totalVisits24h: Math.round(zone.stats.totalVisits24h * userRatio)
        }
      };
    }).filter(zone => zone !== null) as FarmingZone[];
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
          <p style={{ color: '#888' }}>Chargement du panel d'administration...</p>
        </div>
      </div>
    );
  }

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
                Panel d'administration des utilisateurs
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
            { name: 'Administration', icon: '🛡️', permission: 'manage_users' }
          ]
            .filter(tab => user?.permissions?.includes(tab.permission))
            .map((tab, idx) => (
              <button
                key={idx}
                style={{
                  padding: '12px 24px',
                  background: tab.name === 'Administration' ? '#ff6b35' : '#1a1a1a',
                  border: tab.name === 'Administration' ? '2px solid #ff6b35' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  color: tab.name === 'Administration' ? '#000' : '#fff',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (tab.name !== 'Administration') {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#ff6b35';
                    e.currentTarget.style.color = '#ff6b35';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab.name !== 'Administration') {
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

        {/* Messages */}
        {successMessage && (
          <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid #4CAF50',
            color: '#4CAF50',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.3s ease'
          }}>
            <span>✅</span>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid #F44336',
            color: '#F44336',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.3s ease'
          }}>
            <span>❌</span>
            {errorMessage}
          </div>
        )}

        {/* Statistiques */}
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
            <div style={{ color: '#888', fontSize: '0.9em' }}>Total Utilisateurs</div>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#ff6b35', margin: '10px 0' }}>
              {stats.totalUsers}
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
            <div style={{ color: '#888', fontSize: '0.9em' }}>Utilisateurs Actifs</div>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#4CAF50', margin: '10px 0' }}>
              {stats.activeUsers}
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
            <div style={{ color: '#888', fontSize: '0.9em' }}>Connexions Aujourd'hui</div>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#2196F3', margin: '10px 0' }}>
              {stats.todayLogins}
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
            <div style={{ color: '#888', fontSize: '0.9em' }}>Total Bots Assignés</div>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#FF9800', margin: '10px 0' }}>
              {stats.totalBotsAssigned}
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
            <div style={{ color: '#888', fontSize: '0.9em' }}>Appels API Aujourd'hui</div>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#9C27B0', margin: '10px 0' }}>
              {stats.apiCallsToday}
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
            <div style={{ color: '#888', fontSize: '0.9em' }}>Moyenne Bots/User</div>
            <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#00BCD4', margin: '10px 0' }}>
              {stats.avgBotsPerUser}
            </div>
          </div>
        </div>

        {/* Actions et filtres */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={openCreateModal}
              style={{
                padding: '12px 24px',
                background: '#ff6b35',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <Plus size={18} />
              Créer un utilisateur
            </button>

            <button
              onClick={exportUsers}
              style={{
                padding: '12px 24px',
                background: '#333',
                border: '1px solid #555',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <Download size={18} />
              Exporter CSV
            </button>

            <button
              onClick={() => {
                fetchAllBots();
                setShowMapModal(true);
              }}
              style={{
                padding: '12px 24px',
                background: '#9C27B0',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              🗺️ Carte en temps réel
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  padding: '10px 10px 10px 40px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em',
                  minWidth: '200px'
                }}
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: '10px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95em',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="viewer">Viewer</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '10px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95em',
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          overflow: 'hidden',
          marginBottom: '30px',
          border: '1px solid #333'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f0f0f' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  ID
                </th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  NOM D'UTILISATEUR
                </th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  EMAIL
                </th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  RÔLE
                </th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  TOKEN API
                </th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  BOTS
                </th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  DERNIÈRE CONNEXION
                </th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  STATUT
                </th>
                <th style={{ padding: '15px', textAlign: 'center', color: '#888', fontSize: '0.85em', fontWeight: '600', borderBottom: '2px solid #222' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #222', transition: 'background 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#252525'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '15px', fontSize: '0.95em' }}>{user.id}</td>
                  <td style={{ padding: '15px', fontSize: '0.95em', fontWeight: '600' }}>{user.username}</td>
                  <td style={{ padding: '15px', fontSize: '0.95em' }}>{user.email || '-'}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      fontWeight: '600',
                      background: `${getRoleColor(user.role)}20`,
                      color: getRoleColor(user.role)
                    }}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.9em', fontFamily: 'monospace' }}>
                    {user.apiToken ? user.apiToken.substring(0, 12) + '...' : '-'}
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.95em' }}>
                    {user.activeBots} / {user.maxBots}
                  </td>
                  <td style={{ padding: '15px', fontSize: '0.95em' }}>
                    {user.lastLogin ? formatTimeSince(user.lastLogin) : 'Jamais'}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: user.isActive ? '#4CAF50' : '#666',
                        boxShadow: user.isActive ? '0 0 6px #4CAF50' : 'none'
                      }} />
                      <span>{user.isActive ? 'Actif' : 'Inactif'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(user)}
                        style={{
                          padding: '8px',
                          background: '#333',
                          border: '1px solid #444',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        style={{
                          padding: '8px',
                          background: '#333',
                          border: '1px solid #444',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>Aucun utilisateur trouvé</p>
              <p style={{ fontSize: '0.9em' }}>Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>

        {/* Logs d'accès */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid #333',
          maxHeight: '400px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '1.3em',
            marginBottom: '15px',
            color: '#ff6b35',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 Logs d'accès récents
          </h3>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {accessLogs.map((log) => (
              <div key={log.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px',
                borderBottom: '1px solid #222',
                fontSize: '0.9em',
                transition: 'background 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#252525'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{getActionIcon(log.action)}</span>
                  <span style={{
                    fontWeight: '600',
                    color: log.action.includes('success') ? '#4CAF50' : 
                           log.action.includes('failed') ? '#F44336' : '#fff'
                  }}>
                    {getActionName(log.action)}
                  </span>
                  <span>- {log.username}</span>
                  {log.details && (
                    <span style={{ color: '#666' }}>({log.details})</span>
                  )}
                </div>
                <div style={{ color: '#666', fontSize: '0.85em' }}>
                  {formatTimeSince(log.timestamp)}
                  {log.ipAddress && ` • ${log.ipAddress}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classement des utilisateurs par performances */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid #333',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '1.3em',
            marginBottom: '20px',
            color: '#ff6b35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🏆 Classement des utilisateurs - Performance journalière
            </span>
            <span style={{ fontSize: '0.8em', color: '#888' }}>
              Mis à jour: {new Date().toLocaleTimeString('fr-FR')}
            </span>
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '0.85em' }}>
                    RANG
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '0.85em' }}>
                    UTILISATEUR
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '0.85em' }}>
                    BOTS ACTIFS
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '0.85em' }}>
                    KAMAS GÉNÉRÉS (24H)
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '0.85em' }}>
                    PATRIMOINE TOTAL
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '0.85em' }}>
                    CROISSANCE
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888', fontSize: '0.85em' }}>
                    EFFICACITÉ
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#888', fontSize: '0.85em' }}>
                    TENDANCE
                  </th>
                </tr>
              </thead>
              <tbody>
                {userPerformances.map((perf, index) => (
                  <tr key={perf.userId} style={{ 
                    borderBottom: '1px solid #222',
                    background: index === 0 ? 'rgba(255, 107, 53, 0.05)' : 'transparent'
                  }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.1em',
                        background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA000)' :
                                   index === 1 ? 'linear-gradient(135deg, #C0C0C0, #757575)' :
                                   index === 2 ? 'linear-gradient(135deg, #CD7F32, #8D6E63)' :
                                   '#333',
                        color: index < 3 ? '#000' : '#fff'
                      }}>
                        {index + 1}
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#000'
                        }}>
                          {perf.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{perf.username}</div>
                          <div style={{ fontSize: '0.85em', color: '#888' }}>{perf.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px', fontSize: '0.95em' }}>
                      {perf.activeBots}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#ff6b35', fontSize: '1.1em' }}>
                        {perf.dailyStats.kamasGenerated >= 1000000 
                          ? `${(perf.dailyStats.kamasGenerated / 1000000).toFixed(1)}M`
                          : formatNumber(perf.dailyStats.kamasGenerated)
                        }
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>
                        {formatNumber(Math.round(perf.dailyStats.kamasGenerated / perf.activeBots))}/bot
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#00BCD4' }}>
                        {perf.patrimony.totalValue >= 1000000 
                          ? `${(perf.patrimony.totalValue / 1000000).toFixed(1)}M`
                          : formatNumber(perf.patrimony.totalValue)
                        }
                      </div>
                      <div style={{ fontSize: '0.8em', color: '#666' }}>
                        💰 {(perf.patrimony.liquidKamas / 1000000).toFixed(1)}M + 
                        📦 {(perf.patrimony.inventoryValue / 1000000).toFixed(1)}M
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        color: perf.patrimony.growthRate > 0 ? '#4CAF50' : '#F44336'
                      }}>
                        {perf.patrimony.growthRate > 0 ? '↑' : '↓'}
                        <span style={{ fontWeight: '600' }}>
                          {Math.abs(perf.patrimony.growthRate)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '60px',
                          height: '8px',
                          background: '#333',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${perf.dailyStats.averageEfficiency}%`,
                            height: '100%',
                            background: perf.dailyStats.averageEfficiency > 80 ? '#4CAF50' : 
                                      perf.dailyStats.averageEfficiency > 60 ? '#FF9800' : '#F44336'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.9em' }}>
                          {perf.dailyStats.averageEfficiency}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        <span style={{
                          fontSize: '0.8em',
                          color: perf.weeklyStats.trend > 0 ? '#4CAF50' : '#F44336'
                        }}>
                          7j: {perf.weeklyStats.trend > 0 ? '+' : ''}{perf.weeklyStats.trend}%
                        </span>
                        <span style={{
                          fontSize: '0.8em',
                          color: perf.monthlyStats.trend > 0 ? '#4CAF50' : '#F44336'
                        }}>
                          30j: {perf.monthlyStats.trend > 0 ? '+' : ''}{perf.monthlyStats.trend}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Résumé des performances */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#0a0a0a',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div>
              <div style={{ color: '#888', fontSize: '0.85em' }}>Total kamas générés (24h)</div>
              <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#ff6b35' }}>
                {(() => {
                  const total = userPerformances.reduce((sum, p) => sum + p.dailyStats.kamasGenerated, 0);
                  return total >= 1000000 ? `${(total / 1000000).toFixed(1)}M` : formatNumber(total);
                })()}
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.85em' }}>Patrimoine total géré</div>
              <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#00BCD4' }}>
                {(() => {
                  const total = userPerformances.reduce((sum, p) => sum + p.patrimony.totalValue, 0);
                  return total >= 1000000 ? `${(total / 1000000).toFixed(1)}M` : formatNumber(total);
                })()}
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.85em' }}>Efficacité moyenne</div>
              <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#4CAF50' }}>
                {userPerformances.length > 0 
                  ? Math.round(
                      userPerformances.reduce((sum, p) => sum + p.dailyStats.averageEfficiency, 0) / 
                      userPerformances.length
                    ) + '%'
                  : '-'
                }
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '0.85em' }}>Meilleur ratio kamas/bot</div>
              <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#9C27B0' }}>
                {(() => {
                  if (userPerformances.length === 0) return '-';
                  const ratios = userPerformances.map(p => ({
                    username: p.username,
                    ratio: p.dailyStats.kamasGenerated / p.activeBots
                  }));
                  const best = ratios.sort((a, b) => b.ratio - a.ratio)[0];
                  return best ? `${formatNumber(Math.round(best.ratio))} (${best.username})` : '-';
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Zones de farm les plus populaires */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '20px',
          border: '1px solid #333',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '1.3em',
            marginBottom: '20px',
            color: '#ff6b35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              🗺️ Zones de farm les plus populaires
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <select
                value={zoneFilterUser}
                onChange={(e) => setZoneFilterUser(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85em',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tous les utilisateurs</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.activeBots} bots)
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.8em', color: '#888' }}>
                {(() => {
                  const filteredZones = getFilteredZones();
                  if (zoneFilterUser === 'all') {
                    return `${farmingZones.reduce((sum, zone) => sum + zone.activeNow, 0)} bots actifs au total`;
                  } else {
                    const totalUserBots = filteredZones.reduce((sum, zone) => sum + zone.totalBots, 0);
                    return `${totalUserBots} bots actifs pour cet utilisateur`;
                  }
                })()}
              </span>
            </div>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '15px' }}>
            {getFilteredZones().map((zone, index) => (
              <div key={zone.id} style={{
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '15px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#ff6b35';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                {/* Badge de rang */}
                {index < 3 && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA000)' :
                               index === 1 ? 'linear-gradient(135deg, #C0C0C0, #757575)' :
                               'linear-gradient(135deg, #CD7F32, #8D6E63)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9em',
                    color: '#000',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}>
                    {index + 1}
                  </div>
                )}

                {/* En-tête de la zone */}
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ 
                    fontSize: '1.1em', 
                    fontWeight: '600',
                    color: '#fff',
                    marginBottom: '5px'
                  }}>
                    {zone.name}
                  </h4>
                  <div style={{ 
                    fontSize: '0.85em', 
                    color: '#666',
                    display: 'flex',
                    gap: '10px'
                  }}>
                    <span>📍 {zone.coordinates}</span>
                    <span>⚔️ Niv. moy. {zone.avgLevel}</span>
                  </div>
                </div>

                {/* Statistiques principales */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: '#1a1a1a',
                    padding: '8px',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8em', color: '#888' }}>Bots actifs</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ff6b35' }}>
                      {zone.activeNow}/{zone.totalBots}
                    </div>
                  </div>
                  <div style={{
                    background: '#1a1a1a',
                    padding: '8px',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8em', color: '#888' }}>Visites 24h</div>
                    <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#2196F3' }}>
                      {zone.stats.totalVisits24h}
                    </div>
                  </div>
                </div>

                {/* Liste des bots par utilisateur si filtre actif */}
                {zoneFilterUser !== 'all' && zone.botsByUser?.[zoneFilterUser] && (
                  <div style={{
                    background: '#1a1a1a',
                    padding: '10px',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ fontSize: '0.85em', color: '#888', marginBottom: '8px' }}>
                      Vos bots dans cette zone:
                    </div>
                    {zone.botsByUser[zoneFilterUser].bots.map(bot => (
                      <div key={bot.botId} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 0',
                        fontSize: '0.8em',
                        borderBottom: '1px solid #333'
                      }}>
                        <span style={{ color: '#ff6b35' }}>{bot.botName}</span>
                        <div style={{ display: 'flex', gap: '10px', color: '#666' }}>
                          <span>{bot.activity === 'farming' ? '🌾' : bot.activity === 'fighting' ? '⚔️' : '🚶'}</span>
                          <span>{formatTimeSince(bot.arrivalTime)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Barres de progression */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.85em',
                      marginBottom: '3px'
                    }}>
                      <span style={{ color: '#888' }}>Popularité</span>
                      <span style={{ color: '#ff6b35' }}>{zone.popularity}%</span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: '#333',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${zone.popularity}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #ff6b35, #f7931e)'
                      }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.85em',
                      marginBottom: '3px'
                    }}>
                      <span style={{ color: '#888' }}>Efficacité</span>
                      <span style={{ color: '#4CAF50' }}>{zone.efficiency}%</span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: '#333',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${zone.efficiency}%`,
                        height: '100%',
                        background: '#4CAF50'
                      }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.85em',
                      marginBottom: '3px'
                    }}>
                      <span style={{ color: '#888' }}>Danger</span>
                      <span style={{ 
                        color: zone.danger < 30 ? '#4CAF50' : 
                               zone.danger < 60 ? '#FF9800' : '#F44336'
                      }}>
                        {zone.danger}%
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: '#333',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${zone.danger}%`,
                        height: '100%',
                        background: zone.danger < 30 ? '#4CAF50' : 
                                   zone.danger < 60 ? '#FF9800' : '#F44336'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Ressources et monstres */}
                <div style={{ marginBottom: '12px' }}>
                  {zone.resources.length > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.8em', color: '#888' }}>🌿 Ressources: </span>
                      <span style={{ fontSize: '0.85em' }}>{zone.resources.join(', ')}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.8em', color: '#888' }}>👾 Monstres: </span>
                    <span style={{ fontSize: '0.85em' }}>{zone.monsters.slice(0, 3).join(', ')}</span>
                  </div>
                </div>

                {/* Stats de performance */}
                <div style={{
                  borderTop: '1px solid #333',
                  paddingTop: '10px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '5px',
                  fontSize: '0.8em'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#888' }}>Kamas/24h</div>
                    <div style={{ fontWeight: 'bold', color: '#ff6b35' }}>
                      {zone.stats.kamasGenerated >= 1000000 
                        ? `${(zone.stats.kamasGenerated / 1000000).toFixed(1)}M`
                        : formatNumber(zone.stats.kamasGenerated)
                      }
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#888' }}>Temps moy.</div>
                    <div style={{ fontWeight: 'bold' }}>{zone.stats.avgTimeSpent}min</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#888' }}>Morts</div>
                    <div style={{ 
                      fontWeight: 'bold',
                      color: zone.stats.deathRate < 5 ? '#4CAF50' : 
                             zone.stats.deathRate < 10 ? '#FF9800' : '#F44336'
                    }}>
                      {zone.stats.deathRate}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {getFilteredZones().length === 0 && (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p style={{ fontSize: '1.2em', marginBottom: '10px' }}>
                Aucune zone de farm trouvée pour cet utilisateur
              </p>
              <p style={{ fontSize: '0.9em' }}>
                Cet utilisateur n'a pas de bots actifs dans les zones populaires
              </p>
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
          <p>SnowLab v1.0 | Module Administration</p>
          <p>Made with ❤️ for Dofus Unity botters</p>
        </div>
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
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
        onClick={closeModal}>
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: '15px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #333'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#252525'
            }}>
              <h2 style={{
                fontSize: '1.5em',
                margin: 0,
                color: '#ff6b35'
              }}>
                {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>

            {/* Contenu du modal */}
            <form onSubmit={handleSubmit} style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#ddd',
                  fontSize: '0.95em',
                  fontWeight: '500'
                }}>
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: editingUser ? '#222' : '#0a0a0a',
                    border: `2px solid ${formErrors.username ? '#F44336' : '#333'}`,
                    borderRadius: '8px',
                    color: editingUser ? '#666' : '#fff',
                    fontSize: '0.95em',
                    cursor: editingUser ? 'not-allowed' : 'text'
                  }}
                  required={!editingUser}
                />
                {formErrors.username && (
                  <span style={{ color: '#F44336', fontSize: '0.85em' }}>{formErrors.username}</span>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#ddd',
                  fontSize: '0.95em',
                  fontWeight: '500'
                }}>
                  Mot de passe {!editingUser && '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: '#0a0a0a',
                    border: `2px solid ${formErrors.password ? '#F44336' : '#333'}`,
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.95em'
                  }}
                  required={!editingUser}
                />
                {editingUser && (
                  <small style={{ color: '#666' }}>Laissez vide pour conserver le mot de passe actuel</small>
                )}
                {formErrors.password && (
                  <span style={{ color: '#F44336', fontSize: '0.85em' }}>{formErrors.password}</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#ddd',
                    fontSize: '0.95em',
                    fontWeight: '500'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: '#0a0a0a',
                      border: `2px solid ${formErrors.email ? '#F44336' : '#333'}`,
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95em'
                    }}
                  />
                  {formErrors.email && (
                    <span style={{ color: '#F44336', fontSize: '0.85em' }}>{formErrors.email}</span>
                  )}
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#ddd',
                    fontSize: '0.95em',
                    fontWeight: '500'
                  }}>
                    Rôle *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: '#0a0a0a',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95em',
                      cursor: 'pointer'
                    }}
                    required
                  >
                    <option value="user">Utilisateur</option>
                    <option value="viewer">Visualiseur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#ddd',
                    fontSize: '0.95em',
                    fontWeight: '500'
                  }}>
                    Nombre max de bots
                  </label>
                  <input
                    type="number"
                    value={formData.maxBots}
                    onChange={(e) => setFormData({ ...formData, maxBots: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="999"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: '#0a0a0a',
                      border: `2px solid ${formErrors.maxBots ? '#F44336' : '#333'}`,
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95em'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#ddd',
                    fontSize: '0.95em',
                    fontWeight: '500'
                  }}>
                    Statut
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      background: '#0a0a0a',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95em',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#ddd',
                  fontSize: '0.95em',
                  fontWeight: '500'
                }}>
                  Token d'API unique
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={formData.apiToken || ''}
                    readOnly
                    placeholder="Token généré automatiquement"
                    style={{
                      flex: 1,
                      padding: '12px 15px',
                      background: '#222',
                      border: '2px solid #333',
                      borderRadius: '8px',
                      color: '#888',
                      fontSize: '0.95em',
                      fontFamily: 'monospace',
                      cursor: 'not-allowed'
                    }}
                  />
                  <button
                    type="button"
                    onClick={generateApiToken}
                    style={{
                      padding: '12px 20px',
                      background: '#333',
                      border: '1px solid #555',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Key size={16} />
                    Générer
                  </button>
                </div>
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  Ce token sera utilisé dans les scripts SnowBot de l'utilisateur
                </small>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px solid #333'
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#ff6b35',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {editingUser ? '💾' : '➕'} {editingUser ? 'Sauvegarder' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '12px 24px',
                    background: '#333',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95em',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
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
        onClick={() => setShowDeleteConfirm(null)}>
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '400px',
              width: '100%',
              border: '1px solid #333',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '3em', marginBottom: '20px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.3em', marginBottom: '15px', color: '#F44336' }}>
              Confirmation de suppression
            </h3>
            <p style={{ marginBottom: '25px', color: '#ddd' }}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{users.find(u => u.id === showDeleteConfirm)?.username}" ?
            </p>
            <p style={{ marginBottom: '25px', color: '#888', fontSize: '0.9em' }}>
              Cette action est irréversible et supprimera toutes les données associées.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                style={{
                  padding: '10px 30px',
                  background: '#F44336',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '10px 30px',
                  background: '#333',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carte en temps réel */}
      {showMapModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px'
        }}
        onClick={() => setShowMapModal(false)}>
          <div
            style={{
              background: '#1a1a1a',
              borderRadius: '15px',
              width: '100%',
              maxWidth: '1400px',
              height: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #333'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#252525'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.5em',
                  margin: 0,
                  color: '#ff6b35',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  🗺️ Carte en temps réel - Tous les bots
                </h2>
                <p style={{ color: '#888', fontSize: '0.9em', marginTop: '5px' }}>
                  {allBots.length} bots actifs • {allBots.filter(b => b.status !== 'offline').length} en ligne
                </p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                ×
              </button>
            </div>

            {/* Contenu */}
            <div style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden'
            }}>
              {/* Sidebar avec filtre et liste */}
              <div style={{
                width: '300px',
                background: '#0a0a0a',
                borderRight: '1px solid #333',
                padding: '20px',
                overflowY: 'auto'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9em' }}>
                    Filtrer par utilisateur
                  </label>
                  <select
                    value={mapFilterUser}
                    onChange={(e) => setMapFilterUser(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.95em',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Tous les utilisateurs</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                  </select>
                </div>

                <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#ff6b35' }}>
                  Liste des bots
                </h3>

                {/* Grouper par utilisateur */}
                {(() => {
                  const filteredMapBots = mapFilterUser === 'all' 
                    ? allBots 
                    : allBots.filter(bot => bot.userId === mapFilterUser);
                  
                  const groupedBots = filteredMapBots.reduce((acc, bot) => {
                    if (!acc[bot.username]) acc[bot.username] = [];
                    acc[bot.username].push(bot);
                    return acc;
                  }, {} as Record<string, typeof allBots>);

                  return Object.entries(groupedBots).map(([username, userBots]) => (
                    <div key={username} style={{ marginBottom: '20px' }}>
                      <h4 style={{ 
                        fontSize: '0.95em', 
                        color: '#ff6b35', 
                        marginBottom: '10px',
                        padding: '5px 10px',
                        background: '#1a1a1a',
                        borderRadius: '5px'
                      }}>
                        {username} ({userBots.length} bots)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userBots.map(bot => (
                          <div
                            key={bot.id}
                            style={{
                              background: '#1a1a1a',
                              border: '1px solid #333',
                              borderRadius: '8px',
                              padding: '10px',
                              fontSize: '0.85em',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff6b35'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: getStatusColor(bot.status)
                                }} />
                                <span style={{ fontWeight: '600' }}>{bot.name}</span>
                              </div>
                              <span>{getClassIcon(bot.class)}</span>
                            </div>
                            <div style={{ color: '#888', marginTop: '5px' }}>
                              📍 [{bot.x}, {bot.y}] • {bot.serverName}
                            </div>
                            <div style={{ color: '#666', fontSize: '0.8em', marginTop: '3px' }}>
                              {bot.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Zone de la carte */}
              <div style={{
                flex: 1,
                position: 'relative',
                background: '#0a0a0a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Carte simulée basique */}
                <div style={{
                  width: '90%',
                  height: '90%',
                  background: '#0d1b2a',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #333'
                }}>
                  {/* Grille de base */}
                  <svg style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}>
                    {/* Lignes de grille */}
                    {[...Array(21)].map((_, i) => (
                      <line
                        key={`v-${i}`}
                        x1={`${i * 5}%`}
                        y1="0"
                        x2={`${i * 5}%`}
                        y2="100%"
                        stroke="#1a3a52"
                        strokeWidth="1"
                      />
                    ))}
                    {[...Array(21)].map((_, i) => (
                      <line
                        key={`h-${i}`}
                        x1="0"
                        y1={`${i * 5}%`}
                        x2="100%"
                        y2={`${i * 5}%`}
                        stroke="#1a3a52"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Axes principaux */}
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#2a5a7a" strokeWidth="2" />
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#2a5a7a" strokeWidth="2" />
                  </svg>

                  {/* Zones de la carte */}
                  <div style={{
                    position: 'absolute',
                    top: '40%',
                    left: '45%',
                    width: '10%',
                    height: '10%',
                    background: 'rgba(76, 175, 80, 0.2)',
                    border: '2px solid #4CAF50',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8em',
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    Astrub
                  </div>

                  {/* Affichage des bots */}
                  {(() => {
                    const filteredMapBots = mapFilterUser === 'all' 
                      ? allBots 
                      : allBots.filter(bot => bot.userId === mapFilterUser);
                    
                    return filteredMapBots.map(bot => {
                      // Convertir les coordonnées en pourcentage pour la carte
                      const xPercent = 50 + (bot.x * 2); // Ajuster l'échelle selon besoin
                      const yPercent = 50 - (bot.y * 2); // Y inversé
                      
                      return (
                        <div
                          key={bot.id}
                          style={{
                            position: 'absolute',
                            left: `${xPercent}%`,
                            top: `${yPercent}%`,
                            transform: 'translate(-50%, -50%)',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: getStatusColor(bot.status),
                            border: '2px solid #fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2em',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            zIndex: 10,
                            boxShadow: `0 0 10px ${getStatusColor(bot.status)}`
                          }}
                          title={`${bot.name} (${bot.username})\n[${bot.x}, ${bot.y}]\n${bot.status}`}
                        >
                          {getClassIcon(bot.class)}
                        </div>
                      );
                    });
                  })()}

                  {/* Coordonnées au centre */}
                  <div style={{
                    position: 'absolute',
                    top: '48%',
                    left: '48%',
                    color: '#ff6b35',
                    fontWeight: 'bold',
                    fontSize: '0.9em'
                  }}>
                    [0,0]
                  </div>

                  {/* Légende */}
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '0.85em'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#ff6b35' }}>Statuts</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff6b35' }} />
                        <span>En combat</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFC107' }} />
                        <span>En récolte</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4CAF50' }} />
                        <span>À la banque</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9C27B0' }} />
                        <span>En déplacement</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats en temps réel */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '0.9em'
                  }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div>
                        <span style={{ color: '#888' }}>Total bots:</span> <strong>{allBots.length}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>En ligne:</span> <strong style={{ color: '#4CAF50' }}>
                          {allBots.filter(b => b.status !== 'offline').length}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#888' }}>En combat:</span> <strong style={{ color: '#ff6b35' }}>
                          {allBots.filter(b => b.status === 'fighting').length}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
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
        
        /* Input focus styles */
        input:focus, select:focus {
          outline: none;
          border-color: #ff6b35 !important;
          box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
        }
        
        /* Button hover effects */
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        /* Responsive table */
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

export default AdminPage;