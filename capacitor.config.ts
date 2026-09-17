import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.resqmesh.disaster.app',
  appName: 'ResQMesh',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#0f172a',
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;
