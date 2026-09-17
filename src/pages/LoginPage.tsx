import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { mockUsers } from '@/data/users';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Users, Lock, Mail, ArrowRight, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { ResQMeshIcon } from '@/components/Logo';

const roleIcons: Record<string, typeof Shield> = {
  admin: Shield,
  'control-room': MapPin,
  responder: Users,
  citizen: Users,
};

const roleColors: Record<string, string> = {
  admin: 'bg-navy',
  'control-room': 'bg-primary',
  responder: 'bg-success',
  citizen: 'bg-warning',
};

export default function LoginPage() {
  const { login, register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'seeded' | 'credentials' | 'register'>('seeded');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'citizen' | 'responder' | 'control-room' | 'admin'>('citizen');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSeededLogin = async (userId: string) => {
    setFormError(null);
    const success = await login(userId);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password) {
        setFormError('All fields are required for registration.');
        return;
      }
      const success = await register({ name, email, password, role });
      if (success) {
        navigate('/dashboard');
      }
    } else {
      if (!email.trim() || !password) {
        setFormError('Please provide both email and password.');
        return;
      }
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-primary to-navy flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ResQMeshIcon size={72} className="shadow-2xl rounded-3xl ring-4 ring-white/10" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">resqmesh</h1>
          <p className="text-lg text-blue-200">Stay Connected. Save Lives.</p>
          <p className="text-sm text-blue-300 mt-1">Emergency SOS & Disaster Response Operations</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 transition-all">
          {/* Mode Switch Tabs */}
          <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
            <button
              onClick={() => {
                setMode('seeded');
                setFormError(null);
              }}
              className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                mode === 'seeded'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              1-Click Demo Profiles
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMode('credentials');
                  setFormError(null);
                }}
                className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                  mode === 'credentials'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setFormError(null);
                }}
                className={`text-sm font-semibold pb-2 border-b-2 transition-all ${
                  mode === 'register'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {(formError || error) && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* Seeded Mode */}
          {mode === 'seeded' && (
            <div>
              <p className="text-sm text-text-secondary mb-4">
                Select a tactical persona to log in instantly with real database credentials:
              </p>
              <div className="space-y-3">
                {mockUsers.map((user) => {
                  const Icon = roleIcons[user.role] || Users;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSeededLogin(user.id)}
                      disabled={isLoading}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary-50/30 transition-all group disabled:opacity-50"
                    >
                      <div
                        className={`w-12 h-12 ${
                          roleColors[user.role]
                        } rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-text-primary group-hover:text-primary">{user.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-surface-hover text-text-secondary">
                            {user.email}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary capitalize">{user.role.replace('-', ' ')}</p>
                      </div>
                      <Icon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Credentials Login or Register */}
          {mode !== 'seeded' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Inspector Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        required
                      />
                      <Users className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                      Role / Clearance Level
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="responder">Field Responder</option>
                      <option value="control-room">Control Room Operator</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="admin@resqmesh.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    required
                  />
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    required
                  />
                  <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : mode === 'register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-blue-300 mt-6">Stronger Together. Safer Forever.</p>
      </div>
    </div>
  );
}
