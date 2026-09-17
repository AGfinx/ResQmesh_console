import { PUNE_CENTER } from '@/lib/constants';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  isRealGPS: boolean;
  timestamp: number;
}

let wakeLockSentinel: any = null;

export const hardwareService = {
  // Geolocation
  async getGPSLocation(): Promise<GPSLocation> {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              isRealGPS: true,
              timestamp: position.timestamp,
            });
          },
          (error) => {
            console.warn('GPS location unavailable, using emergency sector fallback:', error.message);
            resolve({
              latitude: PUNE_CENTER.lat + (Math.random() - 0.5) * 0.02,
              longitude: PUNE_CENTER.lng + (Math.random() - 0.5) * 0.02,
              accuracy: 100,
              isRealGPS: false,
              timestamp: Date.now(),
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 10000,
          }
        );
      });
    }

    return {
      latitude: PUNE_CENTER.lat,
      longitude: PUNE_CENTER.lng,
      accuracy: 50,
      isRealGPS: false,
      timestamp: Date.now(),
    };
  },

  // Haptic Feedback / Vibration
  vibrate(pattern: number | number[] = 200): boolean {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        return navigator.vibrate(pattern);
      } catch (e) {
        console.warn('Vibration API error:', e);
      }
    }
    return false;
  },

  // Emergency SOS distinct vibration pulse: 3 short, 3 long, 3 short (SOS in Morse code)
  vibrateEmergencySOS(): boolean {
    return this.vibrate([100, 50, 100, 50, 100, 150, 300, 50, 300, 50, 300, 150, 100, 50, 100, 50, 100]);
  },

  // Screen Wake Lock (keeps display active during active emergency navigation)
  async requestScreenWakeLock(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        return true;
      } catch (err) {
        console.warn('Screen WakeLock error:', err);
      }
    }
    return false;
  },

  releaseScreenWakeLock(): void {
    if (wakeLockSentinel) {
      try {
        wakeLockSentinel.release();
        wakeLockSentinel = null;
      } catch (e) {
        // ignore
      }
    }
  },

  // Web Notification API
  async showEmergencyNotification(title: string, body: string, icon = '/icons/icon-192.png'): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;
      }

      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [200, 100, 200],
          tag: 'resqmesh-alert',
        } as any);
        return true;
      }
    } catch (err) {
      console.warn('Notification error:', err);
    }
    return false;
  },

  // Native Web Share API
  async shareEmergencyStatus(title: string, text: string, url?: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title,
          text,
          url: url || (typeof window !== 'undefined' ? window.location.href : ''),
        });
        return true;
      } catch (err) {
        // User cancelled or share failed
      }
    }
    return false;
  }
};
