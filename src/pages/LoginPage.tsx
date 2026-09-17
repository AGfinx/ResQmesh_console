import { useAuthStore } from '@/stores/authStore';
import { mockUsers } from '@/data/users';
import { useNavigate } from 'react-router-dom';
import { Radio, Shield, MapPin, Users } from 'lucide-react';
import { getInitials } from '@/lib/utils';

const roleIcons: Record<string, typeof Shield> = { admin: Shield, 'control-room': MapPin, responder: Users, citizen: Users };
const roleColors: Record<string, string> = { admin: 'bg-navy', 'control-room': 'bg-primary', responder: 'bg-success', citizen: 'bg-warning' };

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = (userId: string) => {
    login(userId);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-primary to-navy flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
              <Radio className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ResQMesh</h1>
          <p className="text-lg text-blue-200">Stay Connected. Save Lives.</p>
          <p className="text-sm text-blue-300 mt-1">Emergency SOS & Disaster Response Ecosystem</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">Sign In</h2>
          <p className="text-sm text-text-secondary mb-6">Select a user to continue (demo mode)</p>

          <div className="space-y-3">
            {mockUsers.map((user) => {
              const Icon = roleIcons[user.role] || Users;
              return (
                <button key={user.id} onClick={() => handleLogin(user.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary-50/30 transition-all group">
                  <div className={`w-12 h-12 ${roleColors[user.role]} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-text-primary group-hover:text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary capitalize">{user.role.replace('-', ' ')}</p>
                  </div>
                  <Icon className="w-5 h-5 text-text-secondary group-hover:text-primary" />
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-blue-300 mt-6">Stronger Together. Safer Forever.</p>
      </div>
    </div>
  );
}
