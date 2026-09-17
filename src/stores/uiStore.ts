import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  demoMode: boolean;
  simulationPanelOpen: boolean;
  toggleSidebar: () => void;
  toggleDemoMode: () => void;
  toggleSimulationPanel: () => void;
}

export const useUiStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  demoMode: true,
  simulationPanelOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode })),
  toggleSimulationPanel: () => set((s) => ({ simulationPanelOpen: !s.simulationPanelOpen })),
}));
export type { UIState };
