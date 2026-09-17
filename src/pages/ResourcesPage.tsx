import { useState } from 'react';
import { useResourceStore } from '@/stores/resourceStore';
import { Package, Truck, Heart, Plus, Search, Filter, MoreVertical } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from '@/components/ui/Toast';

export default function ResourcesPage() {
  const resources = useResourceStore((s) => s.resources);
  const addResource = useResourceStore((s) => s.addResource);
  const assignResource = useResourceStore((s) => s.assignResource);
  const releaseResource = useResourceStore((s) => s.releaseResource);
  const [activeTab, setActiveTab] = useState<'All' | 'equipment' | 'vehicle' | 'medical'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resName, setResName] = useState('');
  const [resCat, setResCat] = useState<'equipment' | 'vehicle' | 'medical'>('equipment');
  const [resTotal, setResTotal] = useState(1);
  const [resLoc, setResLoc] = useState('');

  const filteredResources = resources.filter(r => {
    if (activeTab === 'All') return true;
    return r.category === activeTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment': return <Package className="h-5 w-5 text-blue-500" />;
      case 'vehicle': return <Truck className="h-5 w-5 text-amber-500" />;
      case 'medical': return <Heart className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleAddResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName) return;
    addResource({
      name: resName,
      category: resCat,
      available: resTotal,
      inUse: 0,
      total: resTotal,
      status: 'available',
      location: resLoc,
    });
    toast('Resource added successfully', 'success');
    setIsAddModalOpen(false);
    setResName('');
    setResTotal(1);
    setResLoc('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Resources</h1>
          <p className="text-sm text-text-secondary mt-1">Manage and track all available response resources</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors w-fit"
        >
          <Plus className="h-4 w-4" /> Add Resource
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['All', 'equipment', 'vehicle', 'medical'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab} ({tab === 'All' ? resources.length : resources.filter((r) => r.category === tab).length})
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-card border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-55/50 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Available</th>
                <th className="px-6 py-4 text-center">In Use</th>
                <th className="px-6 py-4 text-center">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredResources.map((r) => (
                <tr key={r.id} className="text-sm hover:bg-gray-55/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">{getCategoryIcon(r.category)}</div>
                      <div>
                        <p className="font-semibold text-text-primary">{r.name}</p>
                        <p className="text-xs text-text-secondary">{r.location || 'Central Depot'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">{r.category}</td>
                  <td className="px-6 py-4 text-center font-medium">{r.available}</td>
                  <td className="px-6 py-4 text-center font-medium">{r.inUse}</td>
                  <td className="px-6 py-4 text-center font-medium">{r.total}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {r.available > 0 && (
                        <button
                          onClick={() => { assignResource(r.id, 'inc-001'); toast('Resource assigned to active incident', 'success'); }}
                          className="text-xs text-primary hover:underline font-semibold"
                        >
                          Assign
                        </button>
                      )}
                      {r.inUse > 0 && (
                        <button
                          onClick={() => { releaseResource(r.id); toast('Resource released', 'success'); }}
                          className="text-xs text-success hover:underline font-semibold"
                        >
                          Release
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-text-primary mb-4">Add Response Resource</h2>
            <form onSubmit={handleAddResourceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  placeholder="e.g. Life Jacket, Rescue Boat"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                <select
                  value={resCat}
                  onChange={(e) => setResCat(e.target.value as any)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="equipment">Equipment</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="medical">Medical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Total Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={resTotal}
                  onChange={(e) => setResTotal(parseInt(e.target.value) || 1)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Base Location</label>
                <input
                  type="text"
                  value={resLoc}
                  onChange={(e) => setResLoc(e.target.value)}
                  placeholder="e.g. Central Depot, Aundh Fire Station"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 border border-border text-text-secondary font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
