import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Clock, Users as UsersIcon, ChevronRight, CloudRain, Flame, Car, Zap, Building, Wind, Droplets, AlertTriangle } from 'lucide-react';
import { useIncidentStore } from '@/stores/incidentStore';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatTimeAgo, formatDistance, getPriorityBorderColor, cn } from '@/lib/utils';
import { IncidentPriority } from '@/types';

const categoryIcons: Record<string, typeof CloudRain> = {
  'Heavy Rainfall': CloudRain, 'Flooding': Droplets, 'Fire': Flame, 'Road Accident': Car,
  'Power Outage': Zap, 'Building Collapse': Building, 'Gas Leak': Wind, 'Landslide': AlertTriangle,
  'Water Logging': Droplets, 'Traffic Blockage': Car, 'Bridge Damage': Building, 'Electrical Hazard': Zap,
};

export default function IncidentsPage() {
  const incidents = useIncidentStore((s) => s.incidents);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | IncidentPriority>('all');
  const [sortBy, setSortBy] = useState('recent');

  const filtered = useMemo(() => {
    let result = [...incidents];
    if (activeTab !== 'all') result = result.filter((i) => i.priority === activeTab);
    if (search) result = result.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()) || i.locationName.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'recent') result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime());
    else if (sortBy === 'priority') { const p: Record<string, number> = { high: 0, medium: 1, low: 2 }; result.sort((a, b) => (p[a.priority] ?? 3) - (p[b.priority] ?? 3)); }
    else if (sortBy === 'affected') result.sort((a, b) => b.peopleAffected - a.peopleAffected);
    return result;
  }, [incidents, activeTab, search, sortBy]);

  const counts = { all: incidents.length, high: incidents.filter(i => i.priority === 'high').length, medium: incidents.filter(i => i.priority === 'medium').length, low: incidents.filter(i => i.priority === 'low').length };
  const tabs = [{ key: 'all' as const, label: 'All' }, { key: 'high' as const, label: 'High' }, { key: 'medium' as const, label: 'Medium' }, { key: 'low' as const, label: 'Low' }];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Incidents</h1>
        <p className="text-sm text-text-secondary mt-1">Track and manage all reported incidents in real-time.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search incidents..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <button className="p-2.5 bg-white border border-border rounded-lg hover:bg-gray-50"><SlidersHorizontal className="w-4 h-4 text-text-secondary" /></button>
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest</option>
          <option value="priority">Highest Priority</option>
          <option value="affected">Most Affected</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('px-4 py-2 rounded-md text-sm font-medium transition-colors', activeTab === tab.key ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary')}>
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.map((inc) => {
          const Icon = categoryIcons[inc.category] || AlertTriangle;
          return (
            <Link key={inc.id} to={`/incidents/${inc.id}`}
              className={cn('block bg-white rounded-card border border-border shadow-sm hover:shadow-md transition-all border-l-4', getPriorityBorderColor(inc.priority))}>
              <div className="flex items-center gap-4 p-5">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', inc.priority === 'high' ? 'bg-red-50 text-red-600' : inc.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary">{inc.title}</h3>
                    <StatusBadge status={inc.priority} variant="priority" />
                    <StatusBadge status={inc.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{inc.locationName}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatTimeAgo(inc.reportedAt)}</span>
                    <span className="flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" />{inc.peopleAffected} affected</span>
                    {inc.distanceKm && <span>{formatDistance(inc.distanceKm)}</span>}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-secondary flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
