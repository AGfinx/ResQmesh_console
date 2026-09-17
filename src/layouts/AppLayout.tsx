import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import SimulationPanel from '@/components/SimulationPanel';
import AndroidBottomNav from '@/components/mobile/AndroidBottomNav';
import EmergencySOSModal from '@/components/EmergencySOSModal';
import { useUiStore } from '@/stores/uiStore';
import { useIncidentStore } from '@/stores/incidentStore';
import { useTeamStore } from '@/stores/teamStore';
import { useResourceStore } from '@/stores/resourceStore';
import { initDatabase } from '@/services/db';
import { outboxManager } from '@/services/sync/outbox';

export default function AppLayout() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const openSosModal = useUiStore((s) => s.openSosModal);

  const fetchIncidents = useIncidentStore((s) => s.fetchIncidents);
  const fetchTeams = useTeamStore((s) => s.fetchTeams);
  const fetchResources = useResourceStore((s) => s.fetchResources);

  useEffect(() => {
    initDatabase().catch((err) => console.warn('Database initialization error:', err));
    outboxManager.processOutbox().catch((err) => console.warn('Initial outbox sync error:', err));

    // Fetch authoritative server state
    fetchIncidents().catch((err) => console.warn('Incident fetch error:', err));
    fetchTeams().catch((err) => console.warn('Team fetch error:', err));
    fetchResources().catch((err) => console.warn('Resource fetch error:', err));
  }, [fetchIncidents, fetchTeams, fetchResources]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col min-w-0 transition-sidebar ${
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        } ml-0`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <AndroidBottomNav onOpenSOS={openSosModal} />
      <SimulationPanel />
      <EmergencySOSModal />
    </div>
  );
}
