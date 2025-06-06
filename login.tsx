import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Configuration API (à adapter selon votre environnement)
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com', // À remplacer par votre URL API
  endpoints: {
    login: '/auth/login',
    validateToken: '/auth/validate',
    refreshToken: '/auth/refresh'
  }
};

interface LoginFormData {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
  };
  error?: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for saved credentials
    const savedRemember = sessionStorage.getItem('rememberMe') === 'true';
    const savedUsername = savedRemember ? sessionStorage.getItem('savedUsername') || '' : '';
    
    if (savedUsername) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername,
        remember: true
      }));
    }

    // Check if user has a valid token
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    try {
      // TODO: Implémenter la validation du token avec l'API
      console.log('Vérification du token existant...');
      
      // Simulation - À remplacer par l'appel API réel
      const isValid = await validateToken(token);
      
      if (isValid) {
        // Redirection vers le dashboard
        console.log('Token valide, redirection...');
        // window.location.href = '/dashboard';
      } else {
        sessionStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      sessionStorage.removeItem('authToken');
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    // TODO: Remplacer par l'appel API réel
    // const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.validateToken}`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // });
    // return response.ok;
    
    // Simulation
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.5), 500);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const performLogin = async (username: string, password: string): Promise<LoginResponse> => {
    // TODO: Remplacer par l'appel API réel
    // const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.login}`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ username, password })
    // });
    // return await response.json();

    // Simulation avec fausses données
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
          resolve({
            success: true,
            token: 'fake-jwt-token-' + Date.now(),
            refreshToken: 'fake-refresh-token-' + Date.now(),
            user: {
              id: '1',
              username: 'admin',
              role: 'administrator',
              permissions: ['view_all', 'manage_bots', 'view_analytics']
            }
          });
        } else if (username === 'user' && password === 'user123') {
          resolve({
            success: true,
            token: 'fake-jwt-token-' + Date.now(),
            refreshToken: 'fake-refresh-token-' + Date.now(),
            user: {
              id: '2',
              username: 'user',
              role: 'user',
              permissions: ['view_own', 'view_analytics']
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Nom d\'utilisateur ou mot de passe incorrect'
          });
        }
      }, 1500);
    });
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!formData.username || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.username.length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await performLogin(formData.username, formData.password);
      
      if (response.success && response.token) {
        // Sauvegarder le token
        sessionStorage.setItem('authToken', response.token);
        if (response.refreshToken) {
          sessionStorage.setItem('refreshToken', response.refreshToken);
        }
        
        // Sauvegarder les préférences
        if (formData.remember) {
          sessionStorage.setItem('rememberMe', 'true');
          sessionStorage.setItem('savedUsername', formData.username);
        } else {
          sessionStorage.removeItem('rememberMe');
          sessionStorage.removeItem('savedUsername');
        }
        
        // Sauvegarder les infos utilisateur
        if (response.user) {
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }
        
        console.log('Connexion réussie!', response);
        
        // TODO: Redirection vers le dashboard
        // window.location.href = '/dashboard';
        
        // Pour la démo, afficher un message de succès
        setError('');
        alert('Connexion réussie! (Redirection vers le dashboard...)');
      } else {
        setError(response.error || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setError('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implémenter la récupération de mot de passe
    console.log('Mot de passe oublié');
    alert('Fonctionnalité à venir: Récupération de mot de passe par email');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 107, 53, 0.05) 0%, transparent 50%)'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        padding: '20px' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          border: '1px solid #333',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Rotating background effect */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
            animation: 'rotate 30s linear infinite',
            pointerEvents: 'none'
          }} />

          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '40px', 
            position: 'relative', 
            zIndex: 1 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '15px', 
              marginBottom: '20px' 
            }}>
              <img 
                src="https://i.imgur.com/CIA4ZyD.png" 
                alt="Snow Stats Lab Logo"
                style={{
                  width: '60px',
                  height: '60px',
                  filter: 'drop-shadow(0 0 20px rgba(255, 107, 53, 0.5))',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              <h1 style={{
                fontSize: '2.5em',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: 0
              }}>
                SnowLab
              </h1>
            </div>
            <p style={{ 
              color: '#888', 
              fontSize: '1.1em', 
              marginTop: '10px' 
            }}>
              Connectez-vous à votre dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid #F44336',
              color: '#F44336',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9em',
              animation: 'shake 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2em' }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Demo info */}
          <div style={{
            background: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid #2196F3',
            color: '#2196F3',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85em',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔑 Comptes de démonstration:</div>
            <div>Admin: admin / admin123</div>
            <div>User: user / user123</div>
          </div>

          {/* Form */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Username field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#ddd', 
                fontSize: '0.95em', 
                fontWeight: 500 
              }}>
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: '#0a0a0a',
                  border: '2px solid #333',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Entrez votre nom d'utilisateur"
                autoComplete="username"
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#ddd', 
                fontSize: '0.95em', 
                fontWeight: 500 
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    paddingRight: '50px',
                    background: '#0a0a0a',
                    border: '2px solid #333',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '1em',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '30px' 
            }}>
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="remember" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  cursor: 'pointer' 
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: formData.remember ? '#ff6b35' : '#0a0a0a',
                  border: formData.remember ? '2px solid #ff6b35' : '2px solid #333',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {formData.remember && (
                    <span style={{ color: '#000', fontWeight: 'bold' }}>✓</span>
                  )}
                </div>
                <span style={{ color: '#888', fontSize: '0.9em' }}>
                  Se souvenir de moi
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontSize: '1.1em',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid #333',
                  borderTop: '3px solid #ff6b35',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          {/* Footer */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '30px', 
            position: 'relative', 
            zIndex: 1 
          }}>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
              style={{
                color: '#888',
                textDecoration: 'none',
                fontSize: '0.9em',
                transition: 'color 0.3s ease'
              }}
            >
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '30px', 
          color: '#666', 
          fontSize: '0.8em' 
        }}>
          <p>© 2025 SnowLab - Tous droits réservés</p>
          <p style={{ marginTop: '5px', fontSize: '0.7em' }}>
            API Status: <span style={{ color: '#4CAF50' }}>● Ready</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: #ff6b35 !important;
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
          background: #111 !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        a:hover {
          color: #ff6b35 !important;
          text-decoration: underline !important;
        }
        
        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;