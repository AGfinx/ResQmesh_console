import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import { 
  Mail, Phone, MapPin, Shield, Calendar, Award, 
  Briefcase, CheckCircle2, Clock, Activity, Edit3, 
  X, Save, Radio, HeartPulse, UserCheck, AlertTriangle
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const userStatus = useAuthStore((s) => s.userStatus);
  const setUserStatus = useAuthStore((s) => s.setUserStatus);

  const teams = useTeamStore((s) => s.teams);
  const assignedTeam = teams.find(t => t.id === currentUser?.teamId || t.name.includes('Alpha'));

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [editLocation, setEditLocation] = useState(currentUser?.location || 'Pune Command Base');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');

  const certifications = [
    { name: 'Disaster Incident Commander L3', issuer: 'NDRF Certified', icon: Shield, color: 'text-blue-600 bg-blue-50' },
    { name: 'Swift Water & Flood Rescue', issuer: 'SDRF Maharashtra', icon: Award, color: 'text-cyan-600 bg-cyan-50' },
    { name: 'Tactical BLE Mesh Specialist', issuer: 'ResQMesh Ops', icon: Radio, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Advanced Trauma First Aid', issuer: 'Red Cross Emergency', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
  ];

  const deploymentStats = [
    { label: 'Disaster Deployments', value: '48', desc: 'Total missions active' },
    { label: 'Lives Rescued / Assisted', value: '182', desc: 'Direct field triage' },
    { label: 'Operational Field Hours', value: '340h', desc: 'On-duty logs' },
    { label: 'Avg Dispatch Response', value: '8.4m', desc: 'Under 10m target' },
  ];

  const missionLogs = [
    { id: 1, action: 'Commanded Squad Dispatch', target: 'Kothrud Flash Flood Evacuation', time: '2 hours ago', status: 'In Progress' },
    { id: 2, action: 'Mesh Gateway Synchronized', target: 'Node-Alpha-01 Relay Station', time: '5 hours ago', status: 'Completed' },
    { id: 3, action: 'Resource Allocation Approved', target: '2x Inflatable Rescue Boats to Team Bravo', time: '1 day ago', status: 'Delivered' },
    { id: 4, action: 'Situational Assessment Submitted', target: 'Mula River Inundation Damage Report', time: '2 days ago', status: 'Reviewed' },
    { id: 5, action: 'Triage Response Coordination', target: 'Aundh Structural Evac', time: '3 days ago', status: 'Resolved' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      phone: editPhone,
      location: editLocation,
      email: editEmail,
    });
    toast('Profile updated successfully', 'success');
    setIsEditModalOpen(false);
  };

  const handleStatusChange = (status: 'available' | 'busy' | 'offline') => {
    setUserStatus(status);
    toast(`Duty status updated to ${status.toUpperCase()}`, 'success');
  };

  if (!currentUser) return null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto pb-12">
      {/* Profile Card Header */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Banner with Gradient & Status Selector */}
        <div className="h-36 bg-gradient-to-r from-navy via-primary to-blue-700 relative p-6 flex justify-between items-start">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Badge #RQM-{currentUser.id || '001'}</span>
          </div>

          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg">
            <span className="text-[11px] font-bold text-text-secondary px-2">Duty Status:</span>
            {(['available', 'busy', 'offline'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  userStatus === st
                    ? st === 'available'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : st === 'busy'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-600 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Avatar Positioned at Bottom Left */}
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 rounded-2xl border-4 border-white bg-primary-50 flex items-center justify-center text-3xl font-extrabold text-primary shadow-xl">
              {getInitials(currentUser.name)}
            </div>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="pt-16 pb-6 px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-text-primary">{currentUser.name}</h1>
                <span className="bg-primary-50 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/20 capitalize">
                  {currentUser.role.replace('-', ' ')}
                </span>
              </div>
              <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-text-secondary" />
                {currentUser.location || 'Pune Command Base, Maharashtra'}
              </p>
            </div>

            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone || '');
                setEditLocation(currentUser.location || '');
                setEditEmail(currentUser.email);
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-border text-text-primary px-4 py-2 rounded-xl text-xs font-bold transition-colors w-fit"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>

          {/* Contact Details Grid */}
          <div className="grid sm:grid-cols-3 gap-6 pt-6 text-xs">
            <div className="flex items-center gap-3 bg-gray-50/70 p-3 rounded-xl border border-border/50">
              <Mail className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-text-secondary uppercase font-semibold">Official Email</p>
                <p className="font-bold text-text-primary text-xs mt-0.5">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 p-3 rounded-xl border border-border/50">
              <Phone className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-text-secondary uppercase font-semibold">Emergency Hot-Line</p>
                <p className="font-bold text-text-primary text-xs mt-0.5">{currentUser.phone || '+91 98765 43210'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/70 p-3 rounded-xl border border-border/50">
              <Briefcase className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-text-secondary uppercase font-semibold">Assigned Command Unit</p>
                <p className="font-bold text-text-primary text-xs mt-0.5">
                  {assignedTeam ? assignedTeam.name : 'NDRF Quick Response Team Alpha'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {deploymentStats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-border shadow-sm">
            <span className="text-xs text-text-secondary font-medium">{stat.label}</span>
            <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Certifications & Tactical Skills */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-sm font-bold text-text-primary mb-1">Certifications & Tactical Clearances</h2>
        <p className="text-xs text-text-secondary mb-4">Official disaster response credentials and operational authorizations</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {certifications.map((cert) => {
            const Icon = cert.icon;
            return (
              <div key={cert.name} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-gray-50/50">
                <div className={`p-2.5 rounded-xl ${cert.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-primary truncate">{cert.name}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">{cert.issuer}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission History & Operational Log */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Recent Deployment & Mission Logs</h2>
            <p className="text-xs text-text-secondary">Chronological operational activity stream for this responder</p>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs text-primary hover:text-primary-600 font-semibold"
          >
            View Full Audit Logs →
          </button>
        </div>

        <div className="space-y-3">
          {missionLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-xl border border-border/70 hover:bg-gray-50/60 transition-colors text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 text-primary rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">{log.action}</p>
                  <p className="text-text-secondary mt-0.5">{log.target}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-text-secondary font-mono">{log.time}</span>
                <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-blue-50 text-blue-700">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-50 text-primary rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Edit Responder Profile</h2>
                  <p className="text-xs text-text-secondary">Update personal call credentials and contact info</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Emergency Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1">
                  Base Location
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-white border border-border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-border text-text-secondary hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
