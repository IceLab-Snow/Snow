import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Play, Pause, SkipBack, Settings, Bell, LogOut, RefreshCw, Clock, MapPin, Route, Eye, EyeOff } from 'lucide-react';

// Configuration API
const API_CONFIG = {
  baseURL: 'https://api.snowlab.example.com',
  endpoints: {
    map: {
      currentPositions: '/map/positions',
      movements: '/map/movements',
      areas: '/map/areas',
      mapData: '/map/data'
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

interface BotPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  serverId: string;
  serverName: string;
  status: 'fighting' | 'farming' | 'banking' | 'idle' | 'moving' | 'offline';
  class: string;
  level: number;
  lastUpdate: Date;
}

interface Movement {
  botId: string;
  botName: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  timestamp: Date;
  activity: string;
}

interface MapArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'city' | 'dungeon' | 'zone' | 'bank';
  level: string;
}

const MapPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // États
  const [user] = useState<User>({
    id: '1',
    username: 'admin',
    role: 'administrator',
    permissions: ['view_all', 'manage_bots', 'view_analytics', 'view_own']
  });

  const [bots, setBots] = useState<BotPosition[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [mapAreas, setMapAreas] = useState<MapArea[]>([]);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<string>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredBot, setHoveredBot] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredArea, setHoveredArea] = useState<MapArea | null>(null);

  // Constantes de la carte
  const MAP_WIDTH = 3000;
  const MAP_HEIGHT = 2000;
  const CELL_SIZE = 20;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 3;
  
  // Image de la carte
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [mapImageLoaded, setMapImageLoaded] = useState(false);

  // Chargement initial
  useEffect(() => {
    // Charger l'image de la carte
    const img = new Image();
    img.src = 'https://images.ankamausercontent.com/filestore/containers/images/dofus_unity_map.jpg'; // URL à remplacer par la vraie carte
    img.onload = () => {
      setMapImage(img);
      setMapImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Erreur chargement de la carte');
      // Utiliser une carte de fallback ou générer une carte basique
      setMapImageLoaded(true);
    };
    
    loadMapData();
  }, []);

  // Animation de l'historique
  useEffect(() => {
    if (isPlaying && movements.length > 0) {
      const interval = setInterval(() => {
        setCurrentTimeIndex(prev => {
          if (prev >= movements.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, movements.length]);

  // Rendu de la carte
  useEffect(() => {
    drawMap();
  }, [bots, movements, selectedBot, showLabels, showPaths, showAreas, zoom, offset, hoveredBot, currentTimeIndex]);

  const loadMapData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchBotPositions(),
        fetchMovements(),
        fetchMapAreas()
      ]);
    } catch (error) {
      console.error('Erreur chargement carte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBotPositions = async () => {
    // Données fictives - positions actuelles des bots
    const fakeBots: BotPosition[] = [
      {
        id: '1',
        name: 'CraBot-01',
        x: 3,
        y: -12,
        serverId: '1',
        serverName: 'Brial',
        status: 'fighting',
        class: 'Cra',
        level: 200,
        lastUpdate: new Date()
      },
      {
        id: '2',
        name: 'EniBot-02',
        x: -2,
        y: 7,
        serverId: '2',
        serverName: 'Hell Mina',
        status: 'farming',
        class: 'Eniripsa',
        level: 200,
        lastUpdate: new Date()
      },
      {
        id: '3',
        name: 'SacriBot-03',
        x: 0,
        y: 0,
        serverId: '3',
        serverName: 'Draconiros',
        status: 'banking',
        class: 'Sacrieur',
        level: 195,
        lastUpdate: new Date()
      },
      {
        id: '4',
        name: 'PandaBot-04',
        x: 5,
        y: -8,
        serverId: '1',
        serverName: 'Brial',
        status: 'moving',
        class: 'Pandawa',
        level: 200,
        lastUpdate: new Date()
      },
      {
        id: '5',
        name: 'RoublBot-05',
        x: -5,
        y: 3,
        serverId: '2',
        serverName: 'Hell Mina',
        status: 'idle',
        class: 'Roublard',
        level: 200,
        lastUpdate: new Date()
      }
    ];
    
    setBots(fakeBots);
  };

  const fetchMovements = async () => {
    // Données fictives - historique des mouvements
    const fakeMovements: Movement[] = [];
    const now = new Date();
    
    // Générer des mouvements pour chaque bot
    bots.forEach(bot => {
      let currentX = bot.x - 5;
      let currentY = bot.y - 5;
      
      for (let i = 0; i < 20; i++) {
        const nextX = currentX + Math.floor(Math.random() * 3 - 1);
        const nextY = currentY + Math.floor(Math.random() * 3 - 1);
        
        fakeMovements.push({
          botId: bot.id,
          botName: bot.name,
          from: { x: currentX, y: currentY },
          to: { x: nextX, y: nextY },
          timestamp: new Date(now.getTime() - (20 - i) * 5 * 60 * 1000),
          activity: ['combat', 'récolte', 'déplacement', 'banque'][Math.floor(Math.random() * 4)]
        });
        
        currentX = nextX;
        currentY = nextY;
      }
    });
    
    setMovements(fakeMovements.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  };

  const fetchMapAreas = async () => {
    // Zones fictives de la carte adaptées à la nouvelle carte simulée
    const fakeAreas: MapArea[] = [
      { id: '1', name: 'Astrub - Cité', x: -5, y: -5, width: 10, height: 10, type: 'city', level: '1-20' },
      { id: '2', name: 'Amakna - Campagne', x: -15, y: 5, width: 30, height: 20, type: 'zone', level: '20-60' },
      { id: '3', name: 'Bonta - Cité Blanche', x: -45, y: 35, width: 20, height: 20, type: 'city', level: '20-200' },
      { id: '4', name: 'Brâkmar - Cité Sombre', x: 25, y: 35, width: 20, height: 20, type: 'city', level: '20-200' },
      { id: '5', name: 'Île de Frigost', x: -60, y: 0, width: 15, height: 30, type: 'zone', level: '100-200' },
      { id: '6', name: 'Île de Pandala', x: 35, y: -35, width: 15, height: 15, type: 'zone', level: '40-80' },
      { id: '7', name: 'Île d\'Otomaï', x: -35, y: -35, width: 10, height: 10, type: 'zone', level: '60-120' },
      { id: '8', name: 'Îles Moon', x: 50, y: 0, width: 10, height: 10, type: 'zone', level: '140-180' },
      { id: '9', name: 'Banque Astrub', x: 0, y: 0, width: 2, height: 2, type: 'bank', level: '-' },
      { id: '10', name: 'Port de Madrestam', x: -10, y: 15, width: 5, height: 5, type: 'zone', level: '20-40' },
      { id: '11', name: 'Donjon des Bouftous', x: -8, y: 8, width: 3, height: 3, type: 'dungeon', level: '10-30' },
      { id: '12', name: 'Donjon des Rats', x: 12, y: -8, width: 3, height: 3, type: 'dungeon', level: '20-40' }
    ];
    
    setMapAreas(fakeAreas);
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sauvegarder le contexte
    ctx.save();
    
    // Appliquer zoom et offset
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2 + offset.x, -canvas.height / 2 + offset.y);
    
    // Dessiner l'image de fond de la carte si disponible
    if (mapImage && mapImageLoaded) {
      ctx.drawImage(mapImage, 0, 0, MAP_WIDTH, MAP_HEIGHT);
    } else {
      // Fallback : dessiner une carte basique avec des zones colorées
      drawBasicMap(ctx);
    }
    
    // Grille de coordonnées (semi-transparente)
    ctx.globalAlpha = 0.3;
    drawGrid(ctx);
    ctx.globalAlpha = 1;
    
    // Zones
    if (showAreas) {
      drawAreas(ctx);
    }
    
    // Chemins des bots
    if (showPaths) {
      drawPaths(ctx);
    }
    
    // Positions des bots
    drawBots(ctx);
    
    // Labels
    if (showLabels) {
      drawLabels(ctx);
    }
    
    ctx.restore();
  };
  
  const drawBasicMap = (ctx: CanvasRenderingContext2D) => {
    // Fond océan
    const oceanGradient = ctx.createLinearGradient(0, 0, MAP_WIDTH, MAP_HEIGHT);
    oceanGradient.addColorStop(0, '#0a1628');
    oceanGradient.addColorStop(0.5, '#0d1b2a');
    oceanGradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    
    // Fonction pour dessiner une île/continent
    const drawLandmass = (x: number, y: number, width: number, height: number, color: string, name: string) => {
      ctx.save();
      
      // Ombre de l'île
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      
      // Forme irrégulière pour l'île
      ctx.beginPath();
      ctx.moveTo(x + width * 0.3, y);
      ctx.quadraticCurveTo(x + width * 0.5, y - height * 0.1, x + width * 0.7, y);
      ctx.quadraticCurveTo(x + width, y + height * 0.2, x + width, y + height * 0.5);
      ctx.quadraticCurveTo(x + width * 0.9, y + height * 0.8, x + width * 0.7, y + height);
      ctx.quadraticCurveTo(x + width * 0.5, y + height * 1.1, x + width * 0.3, y + height);
      ctx.quadraticCurveTo(x, y + height * 0.8, x, y + height * 0.5);
      ctx.quadraticCurveTo(x - width * 0.1, y + height * 0.2, x + width * 0.3, y);
      ctx.closePath();
      
      // Gradient pour le terrain
      const landGradient = ctx.createRadialGradient(x + width/2, y + height/2, 0, x + width/2, y + height/2, width/2);
      landGradient.addColorStop(0, color);
      landGradient.addColorStop(0.7, adjustColor(color, -20));
      landGradient.addColorStop(1, adjustColor(color, -40));
      ctx.fillStyle = landGradient;
      ctx.fill();
      
      // Bordure côtière
      ctx.strokeStyle = adjustColor(color, -60);
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Nom de la zone
      ctx.restore();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 5;
      ctx.fillText(name, x + width/2, y + height/2);
      
      ctx.shadowBlur = 0;
    };
    
    // Fonction pour ajuster la couleur
    const adjustColor = (color: string, amount: number): string => {
      const num = parseInt(color.replace('#', ''), 16);
      const r = Math.max(0, Math.min(255, (num >> 16) + amount));
      const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
      const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    };
    
    // Dessiner les continents principaux
    
    // Continent d'Amakna (centre)
    drawLandmass(MAP_WIDTH/2 - 300, MAP_HEIGHT/2 - 200, 600, 400, '#4a7c59', 'AMAKNA');
    
    // Astrub (proche du centre)
    drawLandmass(MAP_WIDTH/2 - 100, MAP_HEIGHT/2 + 250, 200, 150, '#5a8f4e', 'ASTRUB');
    
    // Bonta (nord-ouest)
    drawLandmass(MAP_WIDTH/4 - 200, MAP_HEIGHT/4 - 100, 400, 300, '#3d5a80', 'BONTA');
    
    // Brakmar (nord-est)
    drawLandmass(3*MAP_WIDTH/4 - 200, MAP_HEIGHT/4 - 100, 400, 300, '#8b3a3a', 'BRAKMAR');
    
    // Pandala (sud-est)
    drawLandmass(3*MAP_WIDTH/4 - 150, 3*MAP_HEIGHT/4 - 150, 300, 250, '#7d6d39', 'PANDALA');
    
    // Frigost (ouest)
    drawLandmass(MAP_WIDTH/6 - 150, MAP_HEIGHT/2 - 200, 300, 400, '#6b8fa3', 'FRIGOST');
    
    // Otomaï (sud-ouest)
    drawLandmass(MAP_WIDTH/4 - 100, 3*MAP_HEIGHT/4 - 100, 200, 200, '#8b7355', 'OTOMAÏ');
    
    // Îles Moon (est)
    drawLandmass(5*MAP_WIDTH/6 - 100, MAP_HEIGHT/2 - 100, 200, 200, '#9b7aa1', 'MOON');
    
    // Dessiner des petites îles
    const drawSmallIsland = (x: number, y: number, radius: number, color: string) => {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = adjustColor(color, -40);
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    
    // Archipels et petites îles
    drawSmallIsland(MAP_WIDTH * 0.3, MAP_HEIGHT * 0.6, 30, '#5a7c59');
    drawSmallIsland(MAP_WIDTH * 0.35, MAP_HEIGHT * 0.62, 25, '#5a7c59');
    drawSmallIsland(MAP_WIDTH * 0.7, MAP_HEIGHT * 0.4, 35, '#7d6d39');
    drawSmallIsland(MAP_WIDTH * 0.75, MAP_HEIGHT * 0.42, 20, '#7d6d39');
    
    // Routes maritimes (pointillés)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
    // Route Astrub - Amakna
    ctx.beginPath();
    ctx.moveTo(MAP_WIDTH/2, MAP_HEIGHT/2 + 250);
    ctx.lineTo(MAP_WIDTH/2, MAP_HEIGHT/2);
    ctx.stroke();
    
    // Route Amakna - Bonta
    ctx.beginPath();
    ctx.moveTo(MAP_WIDTH/2 - 150, MAP_HEIGHT/2 - 100);
    ctx.lineTo(MAP_WIDTH/4, MAP_HEIGHT/4 + 50);
    ctx.stroke();
    
    // Route Amakna - Brakmar
    ctx.beginPath();
    ctx.moveTo(MAP_WIDTH/2 + 150, MAP_HEIGHT/2 - 100);
    ctx.lineTo(3*MAP_WIDTH/4, MAP_HEIGHT/4 + 50);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Ajouter une rose des vents
    ctx.save();
    ctx.translate(MAP_WIDTH - 100, 100);
    
    // Cercle de fond
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    
    // Points cardinaux
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -25);
    ctx.fillText('S', 0, 25);
    ctx.fillText('E', 25, 0);
    ctx.fillText('O', -25, 0);
    
    // Flèche Nord
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-5, -10);
    ctx.lineTo(5, -10);
    ctx.closePath();
    ctx.fillStyle = '#ff6b35';
    ctx.fill();
    
    ctx.restore();
    
    // Légende de la carte
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, MAP_HEIGHT - 120, 200, 100);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, MAP_HEIGHT - 120, 200, 100);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Monde des Douze', 120, MAP_HEIGHT - 95);
    ctx.font = '12px Arial';
    ctx.fillText('Carte simulée', 120, MAP_HEIGHT - 75);
    ctx.fillStyle = '#888';
    ctx.fillText('En attente de la carte', 120, MAP_HEIGHT - 55);
    ctx.fillText('officielle Dofus Unity', 120, MAP_HEIGHT - 35);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    const startX = Math.floor(-MAP_WIDTH / 2 / CELL_SIZE) * CELL_SIZE;
    const endX = Math.ceil(MAP_WIDTH / 2 / CELL_SIZE) * CELL_SIZE;
    const startY = Math.floor(-MAP_HEIGHT / 2 / CELL_SIZE) * CELL_SIZE;
    const endY = Math.ceil(MAP_HEIGHT / 2 / CELL_SIZE) * CELL_SIZE;
    
    // Lignes verticales principales tous les 10 cases
    for (let x = startX; x <= endX; x += CELL_SIZE * 10) {
      ctx.beginPath();
      ctx.moveTo(x + MAP_WIDTH / 2, startY + MAP_HEIGHT / 2);
      ctx.lineTo(x + MAP_WIDTH / 2, endY + MAP_HEIGHT / 2);
      ctx.stroke();
    }
    
    // Lignes horizontales principales tous les 10 cases
    for (let y = startY; y <= endY; y += CELL_SIZE * 10) {
      ctx.beginPath();
      ctx.moveTo(startX + MAP_WIDTH / 2, y + MAP_HEIGHT / 2);
      ctx.lineTo(endX + MAP_WIDTH / 2, y + MAP_HEIGHT / 2);
      ctx.stroke();
    }
    
    // Axes principaux
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    // Axe X
    ctx.beginPath();
    ctx.moveTo(0, MAP_HEIGHT / 2);
    ctx.lineTo(MAP_WIDTH, MAP_HEIGHT / 2);
    ctx.stroke();
    
    // Axe Y
    ctx.beginPath();
    ctx.moveTo(MAP_WIDTH / 2, 0);
    ctx.lineTo(MAP_WIDTH / 2, MAP_HEIGHT);
    ctx.stroke();
    
    // Numéros de coordonnées
    ctx.fillStyle = '#888';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Coordonnées X
    for (let x = -50; x <= 50; x += 10) {
      if (x !== 0) {
        const posX = x * CELL_SIZE + MAP_WIDTH / 2;
        ctx.fillText(x.toString(), posX, MAP_HEIGHT / 2 + 20);
      }
    }
    
    // Coordonnées Y
    for (let y = -50; y <= 50; y += 10) {
      if (y !== 0) {
        const posY = -y * CELL_SIZE + MAP_HEIGHT / 2;
        ctx.fillText(y.toString(), MAP_WIDTH / 2 + 20, posY);
      }
    }
    
    // Origine [0,0]
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('[0,0]', MAP_WIDTH / 2 + 25, MAP_HEIGHT / 2 - 25);
  };

  const drawAreas = (ctx: CanvasRenderingContext2D) => {
    mapAreas.forEach(area => {
      const x = area.x * CELL_SIZE + MAP_WIDTH / 2;
      const y = -area.y * CELL_SIZE + MAP_HEIGHT / 2;
      const width = area.width * CELL_SIZE;
      const height = area.height * CELL_SIZE;
      
      // Effet de survol
      const isHovered = hoveredArea?.id === area.id;
      
      // Fond de la zone
      ctx.fillStyle = area.type === 'city' ? `rgba(33, 150, 243, ${isHovered ? 0.2 : 0.1})` :
                      area.type === 'bank' ? `rgba(76, 175, 80, ${isHovered ? 0.2 : 0.1})` :
                      area.type === 'dungeon' ? `rgba(244, 67, 54, ${isHovered ? 0.2 : 0.1})` :
                      `rgba(255, 152, 0, ${isHovered ? 0.2 : 0.1})`;
      ctx.fillRect(x, y - height, width, height);
      
      // Bordure
      ctx.strokeStyle = area.type === 'city' ? '#2196F3' :
                        area.type === 'bank' ? '#4CAF50' :
                        area.type === 'dungeon' ? '#F44336' :
                        '#FF9800';
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.strokeRect(x, y - height, width, height);
      
      // Nom de la zone
      ctx.fillStyle = isHovered ? '#fff' : '#ddd';
      ctx.font = isHovered ? 'bold 14px Arial' : '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(area.name, x + width / 2, y - height / 2);
      
      // Niveau
      ctx.font = isHovered ? '12px Arial' : '10px Arial';
      ctx.fillStyle = '#888';
      ctx.fillText(`Niv. ${area.level}`, x + width / 2, y - height / 2 + 15);
    });
  };

  const drawPaths = (ctx: CanvasRenderingContext2D) => {
    const pathsByBot = new Map<string, Movement[]>();
    
    // Grouper les mouvements par bot
    const movementsToShow = isPlaying ? movements.slice(0, currentTimeIndex + 1) : movements;
    movementsToShow.forEach(movement => {
      if (!pathsByBot.has(movement.botId)) {
        pathsByBot.set(movement.botId, []);
      }
      pathsByBot.get(movement.botId)!.push(movement);
    });
    
    // Dessiner les chemins
    pathsByBot.forEach((botMovements, botId) => {
      if (selectedBot && selectedBot !== botId) {
        ctx.globalAlpha = 0.3;
      }
      
      const bot = bots.find(b => b.id === botId);
      if (!bot) return;
      
      ctx.strokeStyle = getClassColor(bot.class);
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      botMovements.forEach((movement, index) => {
        const fromX = movement.from.x * CELL_SIZE + MAP_WIDTH / 2;
        const fromY = -movement.from.y * CELL_SIZE + MAP_HEIGHT / 2;
        const toX = movement.to.x * CELL_SIZE + MAP_WIDTH / 2;
        const toY = -movement.to.y * CELL_SIZE + MAP_HEIGHT / 2;
        
        if (index === 0) {
          ctx.moveTo(fromX, fromY);
        }
        ctx.lineTo(toX, toY);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.globalAlpha = 1;
    });
  };

  const drawBots = (ctx: CanvasRenderingContext2D) => {
    const filteredBots = selectedServer === 'all' 
      ? bots 
      : bots.filter(bot => bot.serverId === selectedServer);
    
    filteredBots.forEach(bot => {
      const x = bot.x * CELL_SIZE + MAP_WIDTH / 2;
      const y = -bot.y * CELL_SIZE + MAP_HEIGHT / 2;
      
      // Effet de sélection
      if (selectedBot === bot.id || hoveredBot === bot.id) {
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        ctx.fill();
      }
      
      // Icône du bot
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = getStatusColor(bot.status);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Icône de classe
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getClassIcon(bot.class), x, y);
    });
  };

  const drawLabels = (ctx: CanvasRenderingContext2D) => {
    const filteredBots = selectedServer === 'all' 
      ? bots 
      : bots.filter(bot => bot.serverId === selectedServer);
    
    filteredBots.forEach(bot => {
      const x = bot.x * CELL_SIZE + MAP_WIDTH / 2;
      const y = -bot.y * CELL_SIZE + MAP_HEIGHT / 2;
      
      // Background du label
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x - 40, y + 15, 80, 20);
      
      // Texte
      ctx.fillStyle = '#fff';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(bot.name, x, y + 28);
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, MIN_ZOOM), MAX_ZOOM);
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Convertir les coordonnées du canvas en coordonnées de la carte
    const worldX = (canvasX - canvas.width / 2) / zoom + canvas.width / 2 - offset.x;
    const worldY = (canvasY - canvas.height / 2) / zoom + canvas.height / 2 - offset.y;
    
    // Convertir en coordonnées Dofus (système de grille)
    const mapX = Math.round((worldX - MAP_WIDTH / 2) / CELL_SIZE);
    const mapY = Math.round(-(worldY - MAP_HEIGHT / 2) / CELL_SIZE);
    
    setMousePosition({ x: mapX, y: mapY });
    
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      // Détection du survol des bots
      let foundBot = null;
      bots.forEach(bot => {
        const botX = bot.x * CELL_SIZE + MAP_WIDTH / 2;
        const botY = -bot.y * CELL_SIZE + MAP_HEIGHT / 2;
        const distance = Math.sqrt((worldX - botX) ** 2 + (worldY - botY) ** 2);
        
        if (distance < 15) {
          foundBot = bot.id;
        }
      });
      
      setHoveredBot(foundBot);
      
      // Détection du survol des zones
      let foundArea = null;
      mapAreas.forEach(area => {
        const areaX = area.x * CELL_SIZE + MAP_WIDTH / 2;
        const areaY = -area.y * CELL_SIZE + MAP_HEIGHT / 2;
        const areaWidth = area.width * CELL_SIZE;
        const areaHeight = area.height * CELL_SIZE;
        
        if (worldX >= areaX && worldX <= areaX + areaWidth &&
            worldY >= areaY - areaHeight && worldY <= areaY) {
          foundArea = area;
        }
      });
      
      setHoveredArea(foundArea);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredBot(null);
    setMousePosition(null);
    setHoveredArea(null);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadMapData();
    setRefreshing(false);
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

  const getClassColor = (className: string) => {
    const colors: Record<string, string> = {
      'Cra': '#ff6b35',
      'Eniripsa': '#ff1744',
      'Sacrieur': '#F44336',
      'Pandawa': '#4CAF50',
      'Roublard': '#9C27B0',
      'Xelor': '#2196F3',
      'Ecaflip': '#FFC107',
      'Iop': '#FF5722'
    };
    return colors[className] || '#666';
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

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const servers = [
    { id: 'all', name: 'Tous les serveurs' },
    { id: '1', name: 'Brial' },
    { id: '2', name: 'Hell Mina' },
    { id: '3', name: 'Draconiros' }
  ];

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
          <p style={{ color: '#888' }}>Chargement de la carte...</p>
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
      position: 'relative',
      overflow: 'hidden',
      backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255, 107, 53, 0.05) 0%, transparent 50%)'
    }}>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: '15px 30px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src="https://i.imgur.com/CIA4ZyD.png" 
              alt="Snow Stats Lab Logo"
              style={{
                width: '40px',
                height: '40px',
                filter: 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))'
              }}
            />
            <div>
              <h1 style={{
                fontSize: '1.5em',
                margin: 0,
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                SnowLab Map
              </h1>
              <p style={{ color: '#888', fontSize: '0.8em', margin: '2px 0 0 0' }}>
                Carte interactive en temps réel
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {user && (
              <div style={{
                background: '#252525',
                padding: '6px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  color: '#000'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.8em', fontWeight: 'bold' }}>{user.username}</div>
                  <div style={{ fontSize: '0.7em', color: '#888' }}>{user.role}</div>
                </div>
              </div>
            )}
            
            <button
              onClick={refreshData}
              disabled={refreshing}
              style={{
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '8px',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Rafraîchir"
            >
              <RefreshCw size={16} style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }} />
            </button>
            
            <button
              style={{
                background: '#252525',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}
              title="Notifications"
            >
              <Bell size={16} />
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
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Paramètres"
            >
              <Settings size={16} />
            </button>
            
            <button
              style={{
                background: 'linear-gradient(135deg, #F44336, #D32F2F)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 'bold',
                fontSize: '0.9em'
              }}
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          background: '#1a1a1a',
          padding: '10px 30px',
          display: 'flex',
          gap: '10px',
          borderBottom: '1px solid #333',
          flexShrink: 0
        }}>
          {[
            { name: 'Vue d\'ensemble', icon: '📊' },
            { name: 'Détails', icon: '📝' },
            { name: 'Graphiques', icon: '📈' },
            { name: 'Kolizéum', icon: '⚔️' },
            { name: 'Map', icon: '🗺️' },
            { name: 'Administration', icon: '🛡️' }
          ].map((tab, idx) => (
            <button
              key={idx}
              style={{
                padding: '10px 20px',
                background: tab.name === 'Map' ? '#ff6b35' : 'transparent',
                border: tab.name === 'Map' ? '2px solid #ff6b35' : '2px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                color: tab.name === 'Map' ? '#000' : '#fff',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Contenu principal */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Panneau latéral gauche */}
          <div style={{
            width: '300px',
            background: '#1a1a1a',
            borderRight: '1px solid #333',
            overflowY: 'auto',
            padding: '20px'
          }}>
            {/* Filtres */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#ff6b35' }}>
                🎯 Filtres
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#888', fontSize: '0.9em' }}>
                  Serveur
                </label>
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                >
                  {servers.map(server => (
                    <option key={server.id} value={server.id}>{server.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: '#888', fontSize: '0.9em' }}>
                  Options d'affichage
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    style={{ accentColor: '#ff6b35' }}
                  />
                  <span style={{ fontSize: '0.9em' }}>Afficher les noms</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showPaths}
                    onChange={(e) => setShowPaths(e.target.checked)}
                    style={{ accentColor: '#ff6b35' }}
                  />
                  <span style={{ fontSize: '0.9em' }}>Afficher les trajets</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showAreas}
                    onChange={(e) => setShowAreas(e.target.checked)}
                    style={{ accentColor: '#ff6b35' }}
                  />
                  <span style={{ fontSize: '0.9em' }}>Afficher les zones</span>
                </label>
              </div>
            </div>

            {/* Liste des bots */}
            <div>
              <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#ff6b35' }}>
                🤖 Bots actifs ({bots.filter(b => selectedServer === 'all' || b.serverId === selectedServer).length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bots
                  .filter(bot => selectedServer === 'all' || bot.serverId === selectedServer)
                  .map(bot => (
                    <div
                      key={bot.id}
                      onClick={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
                      style={{
                        background: selectedBot === bot.id ? '#252525' : '#0a0a0a',
                        border: selectedBot === bot.id ? '1px solid #ff6b35' : '1px solid #333',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#ff6b35';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedBot !== bot.id) {
                          e.currentTarget.style.borderColor = '#333';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: getStatusColor(bot.status)
                          }} />
                          <span style={{ fontWeight: 'bold' }}>{bot.name}</span>
                        </div>
                        <span style={{ fontSize: '1.2em' }}>{getClassIcon(bot.class)}</span>
                      </div>
                      <div style={{ fontSize: '0.85em', color: '#888', marginTop: '5px' }}>
                        <div>📍 Position: [{bot.x}, {bot.y}]</div>
                        <div>🌐 {bot.serverName}</div>
                        <div>⚡ {bot.status}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Zone de la carte */}
          <div style={{ flex: 1, position: 'relative', background: '#0a0a0a' }} ref={mapContainerRef}>
            {/* Effet de background orange subtil */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.05) 0%, transparent 60%)',
              pointerEvents: 'none',
              zIndex: 1
            }} />
            
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              style={{
                width: '100%',
                height: '100%',
                cursor: isDragging ? 'grabbing' : hoveredBot || hoveredArea ? 'pointer' : 'crosshair',
                position: 'relative',
                zIndex: 2
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />

            {/* Affichage des coordonnées de la souris */}
            {mousePosition && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(0, 0, 0, 0.9)',
                padding: '10px 15px',
                borderRadius: '8px',
                border: '1px solid #333',
                fontSize: '0.9em',
                minWidth: '150px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                zIndex: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <MapPin size={16} style={{ color: '#ff6b35' }} />
                  <span style={{ fontWeight: 'bold', color: '#ff6b35' }}>
                    [{mousePosition.x}, {mousePosition.y}]
                  </span>
                </div>
                {hoveredArea && (
                  <>
                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '5px' }}>
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>{hoveredArea.name}</div>
                      <div style={{ color: '#888', fontSize: '0.85em' }}>
                        {hoveredArea.type === 'city' && '🏰 Ville'}
                        {hoveredArea.type === 'zone' && '🗺️ Zone'}
                        {hoveredArea.type === 'dungeon' && '⚔️ Donjon'}
                        {hoveredArea.type === 'bank' && '🏦 Banque'}
                      </div>
                      <div style={{ color: '#888', fontSize: '0.85em' }}>
                        Niveau: {hoveredArea.level}
                      </div>
                    </div>
                  </>
                )}
                {hoveredBot && (() => {
                  const bot = bots.find(b => b.id === hoveredBot);
                  return bot ? (
                    <div style={{ borderTop: '1px solid #333', paddingTop: '5px', marginTop: '5px' }}>
                      <div style={{ color: '#fff', fontWeight: 'bold' }}>{bot.name}</div>
                      <div style={{ color: '#888', fontSize: '0.85em' }}>
                        {getClassIcon(bot.class)} {bot.class} - Niv. {bot.level}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px',
                        color: getStatusColor(bot.status),
                        fontSize: '0.85em',
                        marginTop: '3px'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: getStatusColor(bot.status)
                        }} />
                        {bot.status}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Contrôles de la carte */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              zIndex: 10
            }}>
              <button
                onClick={() => setZoom(Math.min(zoom * 1.2, MAX_ZOOM))}
                style={{
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#fff'
                }}
                title="Zoom avant"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom * 0.8, MIN_ZOOM))}
                style={{
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#fff'
                }}
                title="Zoom arrière"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={resetView}
                style={{
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#fff'
                }}
                title="Réinitialiser la vue"
              >
                <Maximize2 size={20} />
              </button>
            </div>

            {/* Indicateur de zoom et position */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '10px 15px',
              borderRadius: '8px',
              fontSize: '0.9em',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              minWidth: '120px',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Zoom:</span>
                <span style={{ fontWeight: 'bold' }}>{Math.round(zoom * 100)}%</span>
              </div>
              {mousePosition && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Pos:</span>
                  <span style={{ fontWeight: 'bold', color: '#ff6b35' }}>
                    [{mousePosition.x}, {mousePosition.y}]
                  </span>
                </div>
              )}
            </div>

            {/* Légende */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '0.85em',
              zIndex: 10
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#ff6b35' }}>Légende</h4>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2196F3' }} />
                  <span>Inactif</span>
                </div>
              </div>
            </div>
            
            {/* Note sur la carte */}
            {!mapImage && (
              <div style={{
                position: 'absolute',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid #FF9800',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '0.85em',
                color: '#FF9800',
                maxWidth: '400px',
                textAlign: 'center',
                zIndex: 10
              }}>
                ℹ️ Pour afficher la vraie carte de Dofus Unity, configurez l'URL de l'image dans l'API
              </div>
            )}

            {/* Contrôles de l'historique */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              zIndex: 10
            }}>
              <button
                onClick={() => setCurrentTimeIndex(0)}
                style={{
                  background: '#252525',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#fff'
                }}
                title="Retour au début"
              >
                <SkipBack size={16} />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background: '#ff6b35',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#000',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pause' : 'Lecture'}
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>Historique: {currentTimeIndex + 1}/{movements.length}</span>
              </div>
            </div>
          </div>

          {/* Panneau latéral droit - Détails */}
          {selectedBot && (
            <div style={{
              width: '300px',
              background: '#1a1a1a',
              borderLeft: '1px solid #333',
              overflowY: 'auto',
              padding: '20px'
            }}>
              {(() => {
                const bot = bots.find(b => b.id === selectedBot);
                if (!bot) return null;
                
                const botMovements = movements.filter(m => m.botId === selectedBot);
                
                return (
                  <>
                    <h3 style={{ fontSize: '1.1em', marginBottom: '15px', color: '#ff6b35' }}>
                      📍 Détails - {bot.name}
                    </h3>
                    
                    <div style={{
                      background: '#0a0a0a',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'grid', gap: '10px' }}>
                        <div>
                          <span style={{ color: '#888' }}>Position actuelle:</span>
                          <div style={{ fontWeight: 'bold' }}>[{bot.x}, {bot.y}]</div>
                        </div>
                        <div>
                          <span style={{ color: '#888' }}>Statut:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: getStatusColor(bot.status)
                            }} />
                            <span>{bot.status}</span>
                          </div>
                        </div>
                        <div>
                          <span style={{ color: '#888' }}>Serveur:</span>
                          <div style={{ fontWeight: 'bold' }}>{bot.serverName}</div>
                        </div>
                        <div>
                          <span style={{ color: '#888' }}>Dernière MAJ:</span>
                          <div>{formatTimestamp(bot.lastUpdate)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <h4 style={{ fontSize: '1em', marginBottom: '10px', color: '#ff6b35' }}>
                      🛤️ Historique des déplacements
                    </h4>
                    
                    <div style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px'
                    }}>
                      {botMovements.reverse().map((movement, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#0a0a0a',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '0.85em',
                            borderLeft: `3px solid ${getClassColor(bot.class)}`
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#888' }}>{formatTimestamp(movement.timestamp)}</span>
                            <span style={{ color: '#ff6b35' }}>{movement.activity}</span>
                          </div>
                          <div>
                            [{movement.from.x}, {movement.from.y}] → [{movement.to.x}, {movement.to.y}]
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

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
          overflow: hidden;
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
      `}</style>
    </div>
  );
};

export default MapPage;