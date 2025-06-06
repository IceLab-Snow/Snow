import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings, Bell, LogOut, AlertCircle, Check, X, Trash2, Download, Upload, TestTube, Wifi, WifiOff } from 'lucide-react';

// Configuration API
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com',
  endpoints: {
    config: {
      get: '/config',
      save: '/config',
      reset: '/config/reset',
      clearData: '/data/clear',
      health: '/health',
      backup: '/backup',
      export: '/export'
    },
    webhooks: {
      testDiscord: '/webhooks/test/discord',
      testTelegram: '/webhooks/test/telegram'
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

interface Config {
  // Paramètres généraux
  refreshRate: number;
  historyDays: number;
  darkMode: boolean;
  
  // Alertes et notifications
  notificationsEnabled: boolean;
  alertInventory: number;
  alertEnergy: number;
  alertOffline: number;
  
  // Webhooks
  discordWebhook: string;
  telegramToken: string;
  telegramChatId: string;
  
  // Objectifs journaliers
  dailyKamas: number;
  dailyRoses: number;
  dailyCombats: number;
  dailyKolizokens: number;
  
  // Export de données
  exportFormat: 'csv' | 'json' | 'xlsx';
  exportPeriod: 'today' | 'week' | 'month' | 'all';
  
  // Configuration API
  apiUrl: string;
  wsUrl: string;
  
  // Sauvegardes automatiques
  autoBackup: boolean;
  backupInterval: 'hourly' | 'daily' | 'weekly';
  backupRetention: number;
}

interface StatusMessage {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  message: string;
}

const ConfigPage: React.FC = () => {
  // États
  const [user] = useState<User>({
    id: '1',
    username: 'admin',
    role: 'administrator',
    permissions: ['view_all', 'manage_bots', 'view_analytics', 'view_own']
  });

  const [config, setConfig] = useState<Config>({
    refreshRate: 30,
    historyDays: 30,
    darkMode: true,
    notificationsEnabled: true,
    alertInventory: 95,
    alertEnergy: 20,
    alertOffline: 10,
    discordWebhook: '',
    telegramToken: '',
    telegramChatId: '',
    dailyKamas: 5000000,
    dailyRoses: 200000,
    dailyCombats: 5000,
    dailyKolizokens: 500000,
    exportFormat: 'csv',
    exportPeriod: 'week',
    apiUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:8080',
    autoBackup: true,
    backupInterval: 'daily',
    backupRetention: 30
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

  // Charger la configuration au montage
  useEffect(() => {
    loadConfiguration();
    checkConnection();
    
    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Demander la permission pour les notifications
  useEffect(() => {
    if (config.notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [config.notificationsEnabled]);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // Charger depuis le localStorage d'abord
      const savedConfig = localStorage.getItem('snowlabConfig');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }

      // TODO: Charger depuis l'API
      // const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.config.get}`);
      // const data = await response.json();
      // setConfig(data);
    } catch (error) {
      showMessage('Erreur lors du chargement de la configuration', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Sauvegarder dans le localStorage
      localStorage.setItem('snowlabConfig', JSON.stringify(config));

      // TODO: Sauvegarder sur l'API
      // await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.config.save}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });

      showMessage('Configuration sauvegardée avec succès!', 'success');
      setIsModified(false);
    } catch (error) {
      showMessage('Erreur lors de la sauvegarde de la configuration', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfiguration = () => {
    console.log('Bouton réinitialiser cliqué'); // Debug log
    
    const userConfirmed = window.confirm('Êtes-vous sûr de vouloir réinitialiser la configuration?');
    console.log('Confirmation utilisateur:', userConfirmed); // Debug log
    
    if (userConfirmed) {
      const defaultConfig: Config = {
        refreshRate: 30,
        historyDays: 30,
        darkMode: true,
        notificationsEnabled: true,
        alertInventory: 95,
        alertEnergy: 20,
        alertOffline: 10,
        discordWebhook: '',
        telegramToken: '',
        telegramChatId: '',
        dailyKamas: 5000000,
        dailyRoses: 200000,
        dailyCombats: 5000,
        dailyKolizokens: 500000,
        exportFormat: 'csv',
        exportPeriod: 'week',
        apiUrl: 'http://localhost:3000',
        wsUrl: 'ws://localhost:8080',
        autoBackup: true,
        backupInterval: 'daily',
        backupRetention: 30
      };
      
      console.log('Application des valeurs par défaut...'); // Debug log
      
      // Mettre à jour l'état avec les valeurs par défaut
      setConfig(defaultConfig);
      
      // Supprimer du localStorage
      localStorage.removeItem('snowlabConfig');
      
      // Réinitialiser le statut de modification
      setIsModified(false);
      
      // Afficher le message de succès
      showMessage('Configuration réinitialisée avec succès', 'success');
      
      console.log('Réinitialisation terminée'); // Debug log
    }
  };

  const clearAllData = async () => {
    if (confirm('ATTENTION: Cette action supprimera toutes les données de tracking. Êtes-vous sûr?')) {
      if (confirm('Cette action est irréversible. Confirmez-vous la suppression?')) {
        try {
          // TODO: Appel API pour supprimer les données
          // await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.config.clearData}`, {
          //   method: 'DELETE'
          // });
          
          localStorage.clear();
          showMessage('Toutes les données ont été supprimées', 'success');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } catch (error) {
          showMessage('Erreur lors de la suppression des données', 'danger');
        }
      }
    }
  };

  const checkConnection = async () => {
    setConnectionStatus('checking');
    try {
      // TODO: Vérifier la connexion à l'API
      // const response = await fetch(`${config.apiUrl}${API_CONFIG.endpoints.config.health}`);
      // if (response.ok) {
      //   setConnectionStatus('connected');
      // } else {
      //   setConnectionStatus('disconnected');
      // }
      
      // Simulation
      setTimeout(() => {
        setConnectionStatus(Math.random() > 0.3 ? 'connected' : 'disconnected');
      }, 500);
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const testDiscordWebhook = async () => {
    if (!config.discordWebhook) {
      showMessage('Veuillez entrer une URL de webhook Discord', 'warning');
      return;
    }

    try {
      showMessage('Test du webhook Discord en cours...', 'info');
      
      // NOTE: Les webhooks Discord ne peuvent pas être testés directement depuis le navigateur
      // à cause des restrictions CORS. Le test doit passer par votre serveur backend.
      
      // TODO: Quand l'API sera prête, décommenter ce code :
      /*
      const response = await fetch(`${config.apiUrl}/api/webhooks/test/discord`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhookUrl: config.discordWebhook
        })
      });
      
      if (response.ok) {
        showMessage('Message de test envoyé sur Discord!', 'success');
      } else {
        showMessage('Erreur: URL du webhook invalide ou erreur Discord', 'danger');
      }
      */
      
      // Pour l'instant, on simule le test
      showMessage('⚠️ Le test Discord nécessite une connexion à l\'API backend. En mode démo, nous simulons un succès.', 'warning');
      setTimeout(() => {
        showMessage('✅ Webhook Discord configuré (simulation)', 'success');
      }, 1000);
      
    } catch (error) {
      showMessage('Erreur lors du test Discord: ' + (error as Error).message, 'danger');
    }
  };

  const testTelegramWebhook = async () => {
    if (!config.telegramToken || !config.telegramChatId) {
      showMessage('Veuillez entrer le token et le chat ID Telegram', 'warning');
      return;
    }

    try {
      showMessage('Test du webhook Telegram en cours...', 'info');
      
      // Test réel du webhook Telegram
      const url = `https://api.telegram.org/bot${config.telegramToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: '🔥 Test de notification SnowLab\n\nSi vous voyez ce message, votre configuration Telegram fonctionne correctement!',
          parse_mode: 'HTML'
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        showMessage('Message de test envoyé sur Telegram!', 'success');
      } else {
        showMessage('Erreur Telegram: ' + (data.description || 'Token ou Chat ID invalide'), 'danger');
      }
    } catch (error) {
      showMessage('Erreur lors du test Telegram: ' + (error as Error).message, 'danger');
    }
  };

  const exportData = () => {
    showMessage('Export en cours...', 'info');
    
    // TODO: Implémenter l'export réel
    setTimeout(() => {
      showMessage('Export terminé!', 'success');
    }, 2000);
  };

  const backupNow = async () => {
    try {
      showMessage('Sauvegarde en cours...', 'info');
      
      // TODO: Déclencher une sauvegarde
      // await fetch(`${config.apiUrl}${API_CONFIG.endpoints.config.backup}`, {
      //   method: 'POST'
      // });
      
      setTimeout(() => {
        showMessage('Sauvegarde réussie!', 'success');
      }, 1500);
    } catch (error) {
      showMessage('Erreur lors de la sauvegarde', 'danger');
    }
  };

  const updateConfig = <K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setIsModified(true);
  };

  const showMessage = (message: string, type: StatusMessage['type']) => {
    const id = Date.now().toString();
    setStatusMessages(prev => [...prev, { id, type, message }]);
    
    // Auto-remove après 5 secondes
    setTimeout(() => {
      setStatusMessages(prev => prev.filter(msg => msg.id !== id));
    }, 5000);
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('fr-FR').format(num);

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
          <p style={{ color: '#888' }}>Chargement de la configuration...</p>
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
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
                Configuration et paramètres
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
              onClick={checkConnection}
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
              title="Vérifier la connexion"
            >
              <RefreshCw size={18} />
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
            { name: 'Configuration', icon: '⚙️', permission: 'view_analytics' },
            { name: 'Administration', icon: '🛡️', permission: 'manage_bots' }
          ]
            .filter(tab => user?.permissions?.includes(tab.permission))
            .map((tab, idx) => (
              <button
                key={idx}
                style={{
                  padding: '12px 24px',
                  background: tab.name === 'Configuration' ? '#ff6b35' : '#1a1a1a',
                  border: tab.name === 'Configuration' ? '2px solid #ff6b35' : '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600',
                  color: tab.name === 'Configuration' ? '#000' : '#fff',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                title={tab.name === 'Administration' ? 'Réservé aux administrateurs' : ''}
                onMouseEnter={(e) => {
                  if (tab.name !== 'Configuration') {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#ff6b35';
                    e.currentTarget.style.color = '#ff6b35';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab.name !== 'Configuration') {
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

        {/* Message de configuration modifiée */}
        {isModified && (
          <div style={{
            background: 'rgba(255, 152, 0, 0.1)',
            border: '1px solid #FF9800',
            borderRadius: '10px',
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} color="#FF9800" />
            <span>Configuration modifiée - N'oubliez pas de sauvegarder</span>
          </div>
        )}

        {/* Sections de configuration */}
        {/* Paramètres généraux */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333',
          transition: 'all 0.3s ease'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            color: '#ff6b35',
            fontSize: '1.3em',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5em' }}>⚙️</span>
            <span>Paramètres généraux</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Fréquence de rafraîchissement (secondes)
              </label>
              <input
                type="number"
                value={config.refreshRate}
                onChange={(e) => updateConfig('refreshRate', Math.max(30, parseInt(e.target.value) || 30))}
                min="30"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
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
                fontSize: '0.95em'
              }}>
                Nombre de jours d'historique à conserver
              </label>
              <input
                type="number"
                value={config.historyDays}
                onChange={(e) => updateConfig('historyDays', parseInt(e.target.value) || 30)}
                min="1"
                max="365"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '60px',
                height: '30px'
              }}>
                <input
                  type="checkbox"
                  checked={config.darkMode}
                  onChange={(e) => updateConfig('darkMode', e.target.checked)}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <div style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: config.darkMode ? '#ff6b35' : '#444',
                  transition: '.4s',
                  borderRadius: '30px'
                }}>
                  <div style={{
                    position: 'absolute',
                    content: '',
                    height: '22px',
                    width: '22px',
                    left: config.darkMode ? '34px' : '4px',
                    bottom: '4px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%'
                  }} />
                </div>
              </div>
              <span>Mode sombre</span>
            </label>
          </div>
        </div>

        {/* Alertes et notifications */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            color: '#ff6b35',
            fontSize: '1.3em',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5em' }}>🔔</span>
            <span>Alertes et notifications</span>
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '60px',
                height: '30px'
              }}>
                <input
                  type="checkbox"
                  checked={config.notificationsEnabled}
                  onChange={(e) => updateConfig('notificationsEnabled', e.target.checked)}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <div style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: config.notificationsEnabled ? '#ff6b35' : '#444',
                  transition: '.4s',
                  borderRadius: '30px'
                }}>
                  <div style={{
                    position: 'absolute',
                    content: '',
                    height: '22px',
                    width: '22px',
                    left: config.notificationsEnabled ? '34px' : '4px',
                    bottom: '4px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%'
                  }} />
                </div>
              </div>
              <span>Activer les notifications</span>
            </label>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Seuil d'alerte pour inventaire plein (%)
              </label>
              <input
                type="number"
                value={config.alertInventory}
                onChange={(e) => updateConfig('alertInventory', parseInt(e.target.value) || 95)}
                min="50"
                max="100"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
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
                fontSize: '0.95em'
              }}>
                Seuil d'alerte pour énergie faible (%)
              </label>
              <input
                type="number"
                value={config.alertEnergy}
                onChange={(e) => updateConfig('alertEnergy', parseInt(e.target.value) || 20)}
                min="5"
                max="50"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
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
                fontSize: '0.95em'
              }}>
                Alerte si bot déconnecté depuis (minutes)
              </label>
              <input
                type="number"
                value={config.alertOffline}
                onChange={(e) => updateConfig('alertOffline', parseInt(e.target.value) || 10)}
                min="1"
                max="60"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              />
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            color: '#ff6b35',
            fontSize: '1.3em',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5em' }}>🌐</span>
            <span>Webhooks</span>
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#ddd',
              fontSize: '0.95em'
            }}>
              Discord Webhook URL
            </label>
            <input
              type="text"
              value={config.discordWebhook}
              onChange={(e) => updateConfig('discordWebhook', e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              style={{
                width: '100%',
                padding: '10px 15px',
                background: '#0a0a0a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95em'
              }}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Telegram Bot Token
              </label>
              <input
                type="text"
                value={config.telegramToken}
                onChange={(e) => updateConfig('telegramToken', e.target.value)}
                placeholder="123456789:ABCdefGHIjklmNOpqrsTUVwxyz..."
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
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
                fontSize: '0.95em'
              }}>
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={config.telegramChatId}
                onChange={(e) => updateConfig('telegramChatId', e.target.value)}
                placeholder="-1001234567890"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={testDiscordWebhook}
              style={{
                padding: '10px 20px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <TestTube size={16} />
              Tester Discord
            </button>
            <button
              onClick={testTelegramWebhook}
              style={{
                padding: '10px 20px',
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <TestTube size={16} />
              Tester Telegram
            </button>
          </div>
        </div>

        {/* Objectifs journaliers */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            color: '#ff6b35',
            fontSize: '1.3em',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5em' }}>🎯</span>
            <span>Objectifs journaliers</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Objectif Kamas/jour
              </label>
              <input
                type="number"
                value={config.dailyKamas}
                onChange={(e) => updateConfig('dailyKamas', parseInt(e.target.value) || 0)}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
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
                fontSize: '0.95em'
              }}>
                Objectif Roses/jour
              </label>
              <input
                type="number"
                value={config.dailyRoses}
                onChange={(e) => updateConfig('dailyRoses', parseInt(e.target.value) || 0)}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
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
                fontSize: '0.95em'
              }}>
                Objectif Combats/jour
              </label>
              <input
                type="number"
                value={config.dailyCombats}
                onChange={(e) => updateConfig('dailyCombats', parseInt(e.target.value) || 0)}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
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
                fontSize: '0.95em'
              }}>
                Objectif Bourses Koli/jour
              </label>
              <input
                type="number"
                value={config.dailyKolizokens}
                onChange={(e) => updateConfig('dailyKolizokens', parseInt(e.target.value) || 0)}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              />
            </div>
          </div>
        </div>

        {/* Export de données */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            color: '#ff6b35',
            fontSize: '1.3em',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5em' }}>📊</span>
            <span>Export de données</span>
          </h2>

          <div style={{
            background: '#252525',
            borderLeft: '4px solid #2196F3',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ color: '#2196F3' }}>ℹ️</span>
            <span>Exportez vos données de tracking pour analyse externe ou sauvegarde.</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Format d'export
              </label>
              <select
                value={config.exportFormat}
                onChange={(e) => updateConfig('exportFormat', e.target.value as Config['exportFormat'])}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em',
                  cursor: 'pointer'
                }}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xlsx">Excel (XLSX)</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Période d'export
              </label>
              <select
                value={config.exportPeriod}
                onChange={(e) => updateConfig('exportPeriod', e.target.value as Config['exportPeriod'])}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em',
                  cursor: 'pointer'
                }}
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="all">Tout</option>
              </select>
            </div>
          </div>

          <button
            onClick={exportData}
            style={{
              padding: '10px 20px',
              background: '#ff6b35',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Exporter les données
          </button>
        </div>

        {/* Configuration API */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            color: '#ff6b35',
            fontSize: '1.3em',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5em' }}>🔑</span>
            <span>Configuration API</span>
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#ddd',
              fontSize: '0.95em'
            }}>
              URL du serveur de tracking
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={config.apiUrl}
                onChange={(e) => updateConfig('apiUrl', e.target.value)}
                placeholder="http://localhost:3000"
                style={{
                  flex: 1,
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              />
              <button
                onClick={checkConnection}
                style={{
                  padding: '10px 20px',
                  background: '#333',
                  color: '#fff',
                  border: '1px solid #555',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Tester
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#ddd',
              fontSize: '0.95em'
            }}>
              URL WebSocket
            </label>
            <input
              type="text"
              value={config.wsUrl}
              onChange={(e) => updateConfig('wsUrl', e.target.value)}
              placeholder="ws://localhost:8080"
              style={{
                width: '100%',
                padding: '10px 15px',
                background: '#0a0a0a',
                border: '1px solid #444',
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
              fontSize: '0.95em'
            }}>
              État de la connexion
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: connectionStatus === 'connected' ? '#4CAF50' : 
                           connectionStatus === 'disconnected' ? '#666' : '#FF9800',
                boxShadow: connectionStatus === 'connected' ? '0 0 10px #4CAF50' : 'none'
              }} />
              <span>
                {connectionStatus === 'connected' ? 'Connecté' :
                 connectionStatus === 'disconnected' ? 'Non connecté' : 'Vérification...'}
              </span>
              {connectionStatus === 'connected' && <Wifi size={16} color="#4CAF50" />}
              {connectionStatus === 'disconnected' && <WifiOff size={16} color="#666" />}
            </div>
          </div>
        </div>

        {/* Sauvegardes automatiques */}
        <div style={{
          background: '#1a1a1a',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '1px solid #333'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            color: '#ff6b35',
            fontSize: '1.3em',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5em' }}>💾</span>
            <span>Sauvegardes automatiques</span>
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}>
              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '60px',
                height: '30px'
              }}>
                <input
                  type="checkbox"
                  checked={config.autoBackup}
                  onChange={(e) => updateConfig('autoBackup', e.target.checked)}
                  style={{
                    opacity: 0,
                    width: 0,
                    height: 0
                  }}
                />
                <div style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: config.autoBackup ? '#ff6b35' : '#444',
                  transition: '.4s',
                  borderRadius: '30px'
                }}>
                  <div style={{
                    position: 'absolute',
                    content: '',
                    height: '22px',
                    width: '22px',
                    left: config.autoBackup ? '34px' : '4px',
                    bottom: '4px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%'
                  }} />
                </div>
              </div>
              <span>Activer les sauvegardes automatiques</span>
            </label>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Intervalle de sauvegarde
              </label>
              <select
                value={config.backupInterval}
                onChange={(e) => updateConfig('backupInterval', e.target.value as Config['backupInterval'])}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em',
                  cursor: 'pointer'
                }}
              >
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Tous les jours</option>
                <option value="weekly">Toutes les semaines</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#ddd',
                fontSize: '0.95em'
              }}>
                Conserver les sauvegardes (jours)
              </label>
              <input
                type="number"
                value={config.backupRetention}
                onChange={(e) => updateConfig('backupRetention', parseInt(e.target.value) || 30)}
                min="1"
                max="365"
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  background: '#0a0a0a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.95em'
                }}
              />
            </div>
          </div>

          <button
            onClick={backupNow}
            style={{
              padding: '10px 20px',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} />
            Sauvegarder maintenant
          </button>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '40px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={saveConfiguration}
            disabled={isSaving}
            style={{
              padding: '15px 30px',
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '1em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: isSaving ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {isSaving ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Sauvegarde...
              </>
            ) : (
              <>
                <Check size={20} />
                Sauvegarder la configuration
              </>
            )}
          </button>

          <button
            onClick={() => {
              console.log('Clic sur le bouton réinitialiser détecté');
              resetConfiguration();
            }}
            style={{
              padding: '15px 30px',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            <RefreshCw size={20} />
            Réinitialiser
          </button>

          <button
            onClick={clearAllData}
            style={{
              padding: '15px 30px',
              background: '#F44336',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
          >
            <Trash2 size={20} />
            Effacer toutes les données
          </button>
        </div>

        {/* Messages de statut */}
        {statusMessages.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            {statusMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: msg.type === 'success' ? 'rgba(76, 175, 80, 0.2)' :
                            msg.type === 'warning' ? 'rgba(255, 152, 0, 0.2)' :
                            msg.type === 'danger' ? 'rgba(244, 67, 54, 0.2)' :
                            'rgba(33, 150, 243, 0.2)',
                  border: `1px solid ${
                    msg.type === 'success' ? '#4CAF50' :
                    msg.type === 'warning' ? '#FF9800' :
                    msg.type === 'danger' ? '#F44336' :
                    '#2196F3'
                  }`,
                  color: msg.type === 'success' ? '#4CAF50' :
                         msg.type === 'warning' ? '#FF9800' :
                         msg.type === 'danger' ? '#F44336' :
                         '#2196F3',
                  animation: 'slideIn 0.3s ease'
                }}
              >
                <span style={{ fontSize: '1.2em' }}>
                  {msg.type === 'success' && '✅'}
                  {msg.type === 'warning' && '⚠️'}
                  {msg.type === 'danger' && '❌'}
                  {msg.type === 'info' && 'ℹ️'}
                </span>
                <span>{msg.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '30px 0',
          color: '#666',
          borderTop: '1px solid #333',
          marginTop: '50px'
        }}>
          <p>SnowLab v1.0 | Module Configuration</p>
          <p>Made with ❤️ for Dofus Unity botters</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
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
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .config-grid {
            grid-template-columns: 1fr !important;
          }
          
          .two-column {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfigPage;