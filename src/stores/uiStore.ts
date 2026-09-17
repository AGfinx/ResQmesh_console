import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  demoMode: boolean;
  simulationPanelOpen: boolean;
  sosModalOpen: boolean;
  toggleSidebar: () => void;
  toggleDemoMode: () => void;
  toggleSimulationPanel: () => void;
  openSosModal: () => void;
  closeSosModal: () => void;
}

export const useUiStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  demoMode: true,
  simulationPanelOpen: false,
  sosModalOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode })),
  toggleSimulationPanel: () => set((s) => ({ simulationPanelOpen: !s.simulationPanelOpen })),
  openSosModal: () => set({ sosModalOpen: true }),
  closeSosModal: () => set({ sosModalOpen: false }),
}));
export type { UIState };
