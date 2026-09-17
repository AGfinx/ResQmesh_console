import { create } from 'zustand';

export interface AppSettings {
  // Notifications
  criticalAlertsSound: boolean;
  teamMessagesSound: boolean;
  weeklyDigest: boolean;
  desktopPush: boolean;

  // Emergency & SOS
  locationSharing: boolean;
  sosTriggerCountdown: number; // 0 (instant), 3, 5 seconds
  sosMode: 'both' | 'silent' | 'voice';
  autoRelayMesh: boolean;

  // Mesh & Radio Connectivity
  radioAdapter: 'ble-5.2' | 'wifi-direct' | 'lora-868' | 'hybrid';
  meshHopLimit: number; // TTL 1-10
  syncIntervalSec: number; // 5, 15, 30, 60
  dataCompression: boolean;
  offlineSyncBatchSize: number;

  // UI & Display
  compactMode: boolean;
  highContrastDisasterMode: boolean;
  mapStyle: 'streets' | 'satellite' | 'dark' | 'terrain';
  autoRefreshInterval: number; // in seconds, 0 = manual
}

const DEFAULT_SETTINGS: AppSettings = {
  criticalAlertsSound: true,
  teamMessagesSound: true,
  weeklyDigest: false,
  desktopPush: true,

  locationSharing: true,
  sosTriggerCountdown: 3,
  sosMode: 'both',
  autoRelayMesh: true,

  radioAdapter: 'hybrid',
  meshHopLimit: 5,
  syncIntervalSec: 15,
  dataCompression: true,
  offlineSyncBatchSize: 20,

  compactMode: false,
  highContrastDisasterMode: false,
  mapStyle: 'streets',
  autoRefreshInterval: 10,
};

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetDefaults: () => void;
}

const STORAGE_KEY = 'resqmesh_settings_v1';

const getInitialSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings from storage', e);
  }
  return DEFAULT_SETTINGS;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: getInitialSettings(),
  updateSettings: (partial) => set((state) => {
    const updated = { ...state.settings, ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
    return { settings: updated };
  }),
  resetDefaults: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ settings: DEFAULT_SETTINGS });
  }
}));
