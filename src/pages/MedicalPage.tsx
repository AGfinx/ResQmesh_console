import { Hospital, Truck, Users, Heart, Phone, MapPin, Navigation } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';

const HOSPITALS = [
  { id: 'h1', name: 'Sassoon General Hospital', distance: '2.1 km', beds: 45, status: 'available', eta: '8 mins', phone: '+91 20 2612 8000' },
  { id: 'h2', name: 'Ruby Hall Clinic', distance: '3.8 km', beds: 32, status: 'busy', eta: '12 mins', phone: '+91 20 6645 0500' },
  { id: 'h3', name: 'Jehangir Hospital', distance: '4.2 km', beds: 28, status: 'available', eta: '15 mins', phone: '+91 20 6681 9999' },
  { id: 'h4', name: 'KEM Hospital Pune', distance: '5.6 km', beds: 50, status: 'available', eta: '18 mins', phone: '+91 20 2621 7300' },
];

const AMBULANCES = [
  { id: 'AMB-101', status: 'available', location: 'Shivajinagar Station', type: 'Advanced Life Support (ALS)', phone: '+91 99887 76655' },
  { id: 'AMB-102', status: 'en-route', location: 'En route to Kothrud Sector 2', type: 'Basic Life Support (BLS)', phone: '+91 99887 76656' },
  { id: 'AMB-103', status: 'busy', location: 'At Sassoon Hospital ER', type: 'Advanced Life Support (ALS)', phone: '+91 99887 76657' },
];

export default function MedicalPage() {
  const handleCall = (num: string) => {
    toast(`Initiating voice call to ${num}...`, 'info');
  };

  const handleNavigate = (name: string) => {
    toast(`Routing navigation to ${name}...`, 'success');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">Medical Support</h1>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Simulated Data</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">Monitor nearby hospitals, ambulances, and emergency medical services</p>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Nearby Hospitals" value="4" icon={Hospital} color="bg-blue-50 text-blue-600" />
        <StatCard title="Available Ambulances" value="1 / 3" icon={Truck} color="bg-amber-50 text-amber-600" />
        <StatCard title="Deployed Medics" value="8" icon={Users} color="bg-green-50 text-green-600" />
        <StatCard title="Emergency Requests" value="2" icon={Heart} color="bg-red-50 text-red-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hospitals */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Hospital Triage Availability</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {HOSPITALS.map((h) => (
              <div key={h.id} className="bg-white rounded-card border border-border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-text-primary text-sm leading-snug">{h.name}</h3>
                    <StatusBadge status={h.status} />
                  </div>
                  <div className="space-y-1.5 text-xs text-text-secondary">
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{h.distance} away · ETA {h.eta}</p>
                    <p className="flex items-center gap-1.5 font-medium text-text-primary"><Heart className="w-3.5 h-3.5 text-red-500" />{h.beds} Emergency Beds Available</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                  <button onClick={() => handleCall(h.phone)} className="flex-1 text-center bg-gray-50 text-text-primary hover:bg-gray-100 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Call Hospital
                  </button>
                  <button onClick={() => handleNavigate(h.name)} className="flex-1 text-center bg-primary text-white hover:bg-primary-600 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                    <Navigation className="w-3.5 h-3.5" /> Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ambulances */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Ambulance Fleet Status</h2>
          <div className="bg-white rounded-card border border-border shadow-sm p-4 space-y-3">
            {AMBULANCES.map((amb) => (
              <div key={amb.id} className="p-3 border border-border rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-text-primary flex items-center gap-2">
                    {amb.id} <StatusBadge status={amb.status === 'en-route' ? 'en-route' : amb.status} className="px-1.5 py-0 text-[10px]" />
                  </p>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">{amb.location}</p>
                  <p className="text-[9px] text-text-secondary capitalize">{amb.type}</p>
                </div>
                <button onClick={() => handleCall(amb.phone)} className="p-2 hover:bg-gray-50 rounded-lg border border-border">
                  <Phone className="w-3.5 h-3.5 text-text-secondary" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
