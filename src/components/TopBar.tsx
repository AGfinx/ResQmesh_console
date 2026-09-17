import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, ChevronDown, Wifi, WifiOff, Radio, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { useMeshStore } from '@/stores/meshStore';
import { useUiStore } from '@/stores/uiStore';
import { getInitials, formatTimeAgo, cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard', '/incidents': 'Incidents', '/map': 'Map View',
  '/teams': 'Teams', '/communication': 'Communication', '/resources': 'Resources',
  '/medical': 'Medical Support', '/reports': 'Reports & Logs', '/analytics': 'Analytics',
  '/alerts': 'Alerts & Notifications', '/settings': 'Settings', '/profile': 'Profile',
};

export default function TopBar() {
  const location = useLocation();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const alerts = useAlertStore((s) => s.alerts);
  const markAsRead = useAlertStore((s) => s.markAsRead);
  const markAllAsRead = useAlertStore((s) => s.markAllAsRead);
  const connectivityMode = useMeshStore((s) => s.connectivityMode);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter(a => !a.read).length;
  const title = routeTitles[location.pathname] || (location.pathname.includes('/incidents/') ? 'Incident Details' : 'ResQMesh');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const connIcon = connectivityMode === 'online' ? Wifi : connectivityMode === 'mesh' ? Radio : WifiOff;
  const connColor = connectivityMode === 'online' ? 'text-success' : connectivityMode === 'mesh' ? 'text-warning' : 'text-emergency';
  const connLabel = connectivityMode === 'online' ? 'Connected' : connectivityMode === 'mesh' ? 'Mesh Mode' : 'Offline — Queued';

  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg text-text-secondary">
          <Menu className="w-5.5 h-5.5" />
        </button>
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search incidents, teams, resources..." className="pl-10 pr-4 py-2 w-72 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        </div>

        {/* Connectivity */}
        <div className={cn('flex items-center gap-1.5 text-sm font-medium', connColor)}>
          {(() => { const I = connIcon; return <I className="w-4 h-4" />; })()}
          <span className="hidden lg:inline">{connLabel}</span>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }} className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-emergency text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-border rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.slice(0, 5).map((a) => (
                  <button key={a.id} onClick={() => { markAsRead(a.id); setShowNotifs(false); }} className={cn('w-full text-left px-4 py-3 border-b border-border/50 hover:bg-gray-50 transition-colors', !a.read && 'bg-primary-50/30')}>
                    <div className="flex items-start gap-2">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', a.priority === 'critical' ? 'bg-emergency' : a.priority === 'high' ? 'bg-red-400' : a.priority === 'medium' ? 'bg-warning' : 'bg-blue-400')} />
                      <div>
                        <p className={cn('text-sm', !a.read ? 'font-semibold' : 'font-medium')}>{a.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{formatTimeAgo(a.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Link to="/alerts" onClick={() => setShowNotifs(false)} className="block text-center py-3 text-sm text-primary font-medium hover:bg-gray-50">View all alerts</Link>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">{currentUser ? getInitials(currentUser.name) : '?'}</div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-text-primary leading-tight">{currentUser?.name}</p>
              <p className="text-[10px] text-text-secondary leading-tight capitalize">{currentUser?.role?.replace('-', ' ')}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-secondary hidden lg:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-xl shadow-xl z-50 py-1">
              <Link to="/profile" onClick={() => setShowProfile(false)} className="block px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50">Profile</Link>
              <Link to="/settings" onClick={() => setShowProfile(false)} className="block px-4 py-2.5 text-sm text-text-primary hover:bg-gray-50">Settings</Link>
              <hr className="my-1 border-border" />
              <button onClick={() => { logout(); setShowProfile(false); }} className="w-full text-left px-4 py-2.5 text-sm text-emergency hover:bg-red-50">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
