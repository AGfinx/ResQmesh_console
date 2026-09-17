export const CONFIG = {
  // Environment
  APP_ENV: import.meta.env.VITE_APP_ENV || 'production',
  
  // Backend & Gateway Endpoints
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  WS_GATEWAY_URL: import.meta.env.VITE_WS_GATEWAY_URL || '',
  
  // Map Layer Configuration
  MAP_TILE_PROVIDER: import.meta.env.VITE_MAP_TILE_PROVIDER || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  
  // Hardware & Feature Flags
  ENABLE_OFFLINE_OUTBOX: import.meta.env.VITE_ENABLE_OFFLINE_OUTBOX !== 'false',
  ENABLE_HARDWARE_HAPTICS: import.meta.env.VITE_ENABLE_HARDWARE_HAPTICS !== 'false',
  
  // Command Center Sector Geolocation (Default: Pune Disaster Response Zone)
  DEFAULT_LAT: parseFloat(import.meta.env.VITE_EMERGENCY_SECTOR_LAT || '18.5204'),
  DEFAULT_LNG: parseFloat(import.meta.env.VITE_EMERGENCY_SECTOR_LNG || '73.8567'),
};
