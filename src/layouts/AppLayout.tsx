import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import SimulationPanel from '@/components/SimulationPanel';
import { useUiStore } from '@/stores/uiStore';

export default function AppLayout() {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 transition-sidebar ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'} ml-0`}>
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <SimulationPanel />
    </div>
  );
}
