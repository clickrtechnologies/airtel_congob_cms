import { Injectable } from '@angular/core';
import { getMessaging, getToken } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private app = initializeApp(environment.firebase);
  private messaging = getMessaging(this.app);

  async generateToken(): Promise<string | null> {
    try {
      // ✅ Step 1: Register the service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
     

      // ✅ Step 2: Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
      }

      // ✅ Step 3: Get FCM token (link it to our service worker)
      const token = await getToken(this.messaging, {
        vapidKey: 'BN3_J2Gd4-aWytxf4nhGeCxaoZGGP8CvzNwZJQlMaXSSBW2BhKiR6tMksiqqq_uvFiyQRaRm4Lakv_6gWD6qn4s',
        serviceWorkerRegistration: registration, // important
      });

      return token;
    } catch (error) {
      console.error('Error generating FCM token:', error);
      return null;
    }
  }
}
