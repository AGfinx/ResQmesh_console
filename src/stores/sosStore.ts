import { create } from 'zustand';
import { SOSStatus } from '@/types';

interface SOSState {
  sosActive: boolean;
  sosStatus: SOSStatus;
  sosType: string;
  sosDescription: string;
  activateSOS: (type: string, description: string) => void;
  cancelSOS: () => void;
  acknowledgeSOS: () => void;
  resolveSOS: () => void;
  setSosStatus: (status: SOSStatus) => void;
}

export const useSosStore = create<SOSState>((set) => ({
  sosActive: false,
  sosStatus: 'idle',
  sosType: '',
  sosDescription: '',
  activateSOS: (type, description) => set({
    sosActive: true, sosStatus: 'sending', sosType: type, sosDescription: description,
  }),
  cancelSOS: () => set({ sosActive: false, sosStatus: 'idle', sosType: '', sosDescription: '' }),
  acknowledgeSOS: () => set({ sosStatus: 'acknowledged' }),
  resolveSOS: () => set({ sosActive: false, sosStatus: 'resolved', sosType: '', sosDescription: '' }),
  setSosStatus: (status) => set({ sosStatus: status }),
}));
export type { SOSState };
