import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useMeshStore } from '@/stores/meshStore';
import { useSettingsStore, AppSettings } from '@/stores/settingsStore';
import { 
  User, Bell, Shield, Wifi, Moon, Save, RotateCcw, 
  Download, Database, Radio, Sliders, Volume2, 
  Map, CheckCircle2, Lock, Cpu
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const connectivityMode = useMeshStore((s) => s.connectivityMode);
  const setConnectivity = useMeshStore((s) => s.setConnectivity);
  
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const resetDefaults = useSettingsStore((s) => s.resetDefaults);

  // Local state for profile inputs
  const [userName, setUserName] = useState(currentUser?.name || 'Capt. Rajesh Sharma');
  const [userEmail, setUserEmail] = useState(currentUser?.email || 'rajesh.sharma@ndrf.gov.in');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [userLocation, setUserLocation] = useState(currentUser?.location || 'Pune Command Base');

  // Local state for settings form
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  const handleSaveAll = () => {
    // Save Profile
    updateProfile({
      name: userName,
      email: userEmail,
      phone: userPhone,
      location: userLocation,
    });

    // Save Settings
    updateSettings(localSettings);
    toast('System settings & user preferences saved successfully', 'success');
  };

  const handleReset = () => {
    if (confirm('Reset all disaster configuration settings to factory defaults?')) {
      resetDefaults();
      setLocalSettings(useSettingsStore.getState().settings);
      toast('Settings reset to defaults', 'info');
    }
  };

  const handleExportConfig = () => {
    const configData = {
      user: currentUser,
      settings: localSettings,
      exportedAt: new Date().toISOString(),
      version: 'ResQMesh-v1.4-tactical'
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resqmesh-config-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast('Configuration profile exported as JSON', 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">System & Protocol Settings</h1>
            <span className="bg-gray-100 text-text-secondary text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Tactical Config
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Configure mesh telemetry parameters, emergency SOS triggers, notifications, and device identity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-white border border-border hover:bg-gray-50 text-text-secondary hover:text-text-primary px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleExportConfig}
            className="flex items-center gap-1.5 bg-white border border-border hover:bg-gray-50 text-text-primary px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-text-secondary" />
            <span>Export Config</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Account & Responder Identity */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-border bg-gray-50/50 flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 text-primary rounded-lg">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-text-primary">Responder & Operator Identity</h2>
              <p className="text-[11px] text-text-secondary">Assigned credentials on field radios and triage maps</p>
            </div>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-primary uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-primary uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary uppercase tracking-wider mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-text-primary uppercase tracking-wider mb-1">Current Base</label>
                <input
                  type="text"
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-text-secondary">
              <span>Security Signer: <strong className="text-text-primary font-mono">Ed25519-SHA512</strong></span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* 2. Emergency SOS & Dispatch Protocols */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-border bg-gray-50/50 flex items-center gap-2.5">
            <div className="p-1.5 bg-red-50 text-emergency rounded-lg">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-text-primary">Emergency SOS & Distress Protocols</h2>
              <p className="text-[11px] text-text-secondary">Distress transmission payloads and trigger rules</p>
            </div>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-semibold text-text-primary">Real-Time GPS Coordinates Streaming</p>
                <p className="text-text-secondary text-[11px]">Continuously update squad location during active deployments</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.locationSharing}
                onChange={(e) => setLocalSettings({ ...localSettings, locationSharing: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-border/50 pt-2">
              <div>
                <p className="font-semibold text-text-primary">Automatic Mesh Packet Re-broadcasting</p>
                <p className="text-text-secondary text-[11px]">Act as an intermediate hop node for adjacent citizen SOS signals</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.autoRelayMesh}
                onChange={(e) => setLocalSettings({ ...localSettings, autoRelayMesh: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div>
                <label className="block font-semibold text-text-primary mb-1">SOS Trigger Countdown</label>
                <select
                  value={localSettings.sosTriggerCountdown}
                  onChange={(e) => setLocalSettings({ ...localSettings, sosTriggerCountdown: Number(e.target.value) })}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white text-xs"
                >
                  <option value={0}>0s (Instant Broadcast)</option>
                  <option value={3}>3s Countdown (Safety Delay)</option>
                  <option value={5}>5s Countdown</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-text-primary mb-1">SOS Distress Payload</label>
                <select
                  value={localSettings.sosMode}
                  onChange={(e) => setLocalSettings({ ...localSettings, sosMode: e.target.value as any })}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white text-xs"
                >
                  <option value="both">GPS & Distress Audio</option>
                  <option value="silent">Silent Beacon (Mesh Only)</option>
                  <option value="voice">Audio Call Priority</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Mesh & Radio Protocol Tuning */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-border bg-gray-50/50 flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Radio className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-text-primary">Mesh Network & Radio Tuning</h2>
              <p className="text-[11px] text-text-secondary">Low-level multi-hop transmission and CRDT sync rules</p>
            </div>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Radio Hardware Adapter</label>
                <select
                  value={localSettings.radioAdapter}
                  onChange={(e) => setLocalSettings({ ...localSettings, radioAdapter: e.target.value as any })}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white text-xs"
                >
                  <option value="hybrid">Hybrid Multipath (Auto)</option>
                  <option value="ble-5.2">BLE 5.2 Long Range</option>
                  <option value="wifi-direct">Wi-Fi Direct Peer Mesh</option>
                  <option value="lora-868">LoRa 868MHz Sub-GHz</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">
                  Mesh TTL Hop Limit ({localSettings.meshHopLimit} hops)
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={localSettings.meshHopLimit}
                  onChange={(e) => setLocalSettings({ ...localSettings, meshHopLimit: Number(e.target.value) })}
                  className="w-full accent-primary cursor-pointer mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div>
                <label className="block font-semibold text-text-primary mb-1">CRDT Sync Interval</label>
                <select
                  value={localSettings.syncIntervalSec}
                  onChange={(e) => setLocalSettings({ ...localSettings, syncIntervalSec: Number(e.target.value) })}
                  className="w-full border border-border rounded-lg px-2.5 py-1.5 bg-white text-xs"
                >
                  <option value={5}>5s (High Frequency)</option>
                  <option value={15}>15s (Standard Tactical)</option>
                  <option value={30}>30s (Low Power)</option>
                  <option value={60}>60s (Extreme Power Saver)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-semibold text-text-primary">Data Compression</p>
                  <p className="text-[10px] text-text-secondary">Gzip payload delta</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.dataCompression}
                  onChange={(e) => setLocalSettings({ ...localSettings, dataCompression: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between text-[11px] text-text-secondary">
              <span>Current Network State:</span>
              <span className="font-bold text-primary uppercase font-mono">{connectivityMode} Mode</span>
            </div>
          </div>
        </div>

        {/* 4. Notifications & Audio Alerts */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-border bg-gray-50/50 flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-text-primary">Alert Tone & Notification Audio</h2>
              <p className="text-[11px] text-text-secondary">Sound alarms and browser push dispatch channels</p>
            </div>
          </div>
          <div className="p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-semibold text-text-primary">Critical Incident Alarm Sirens</p>
                <p className="text-text-secondary text-[11px]">Sound persistent audio siren for Priority-High and Critical SOS</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.criticalAlertsSound}
                onChange={(e) => setLocalSettings({ ...localSettings, criticalAlertsSound: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-border/50 pt-2">
              <div>
                <p className="font-semibold text-text-primary">Team Comms & Chat Chimes</p>
                <p className="text-text-secondary text-[11px]">Play audio blip when squad channel receives tactical updates</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.teamMessagesSound}
                onChange={(e) => setLocalSettings({ ...localSettings, teamMessagesSound: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-border/50 pt-2">
              <div>
                <p className="font-semibold text-text-primary">Browser Push Notifications</p>
                <p className="text-text-secondary text-[11px]">Show background OS notifications during emergency events</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.desktopPush}
                onChange={(e) => setLocalSettings({ ...localSettings, desktopPush: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save action bar at bottom */}
      <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Database className="w-4 h-4 text-primary" />
          <span>Local storage synchronization active. All offline settings cache locally.</span>
        </div>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md w-full sm:w-fit justify-center"
        >
          <Save className="w-4 h-4" /> Save All Preferences
        </button>
      </div>
    </div>
  );
}
