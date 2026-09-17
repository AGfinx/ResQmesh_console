import { useState } from 'react';
import { TriangleAlert, MapPin, Radio, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { sosService } from '@/services/sosService';
import { hardwareService } from '@/services/hardwareService';

export default function EmergencySOSModal() {
  const isOpen = useUiStore((s) => s.sosModalOpen);
  const closeModal = useUiStore((s) => s.closeSosModal);

  const [sosType, setSosType] = useState('flood');
  const [sosDesc, setSosDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ incidentId: string; status: string } | null>(null);

  if (!isOpen) return null;

  const handleSOS = async () => {
    if (!sosType || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await sosService.triggerSOS(sosType, sosDesc);
      setSuccessInfo({
        incidentId: result.incident.id,
        status: result.sos.status,
      });
      // After showing confirmation briefly
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessInfo(null);
        setSosDesc('');
        closeModal();
      }, 2000);
    } catch (err) {
      console.error('SOS dispatch error:', err);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    hardwareService.vibrate(30);
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {successInfo ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">SOS Beacon Dispatched</h2>
            <p className="text-slate-300 text-sm mb-4">
              Incident <span className="font-mono font-bold text-primary-400">{successInfo.incidentId}</span> has been logged.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              Status: <span className="font-semibold text-white capitalize">{successInfo.status}</span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-500/30">
                <TriangleAlert className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Emergency Distress SOS</h2>
                <p className="text-xs text-slate-400">High-priority beacon with live GPS telemetry</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Emergency Category
                </label>
                <select
                  value={sosType}
                  onChange={(e) => setSosType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="flood">Flood / Flash Flood Warning</option>
                  <option value="fire">Fire / Hazardous Chemical</option>
                  <option value="medical">Severe Medical Emergency</option>
                  <option value="collapse">Structural Collapse / Trapped Persons</option>
                  <option value="landslide">Landslide / Road Blockade</option>
                  <option value="other">General Life-Threatening Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Situation Details (Optional)
                </label>
                <textarea
                  value={sosDesc}
                  onChange={(e) => setSosDesc(e.target.value)}
                  placeholder="State your exact floor, landmark, or immediate medical needs..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60 flex items-center gap-2.5 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Device GPS telemetry and offline-sync queue active.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 font-medium py-2.5 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSOS}
                  disabled={isSubmitting || !sosType}
                  className="flex-1 bg-gradient-to-r from-red-600 to-emergency text-white font-bold py-2.5 rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4" />
                      <span>Transmit SOS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
