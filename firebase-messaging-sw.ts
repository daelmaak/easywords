/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';
import { onBackgroundMessage } from 'firebase/messaging/sw';

// See: https://github.com/microsoft/TypeScript/issues/14877
/** @type {ServiceWorkerGlobalScope} */
let self;

const firebaseConfig = {
  apiKey: 'AIzaSyDZG8HNUdn-saTnYv9Ren0nQbSQRPnzngk',
  authDomain: 'easywords-3083d.firebaseapp.com',
  projectId: 'easywords-3083d',
  storageBucket: 'easywords-3083d.firebasestorage.app',
  messagingSenderId: '386545686156',
  appId: '1:386545686156:web:0d7bb2cd0069c21df40da9',
};

// await navigator.serviceWorker.register('/firebase-messaging-sw.js');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

onBackgroundMessage(messaging, payload => {
  self.console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

export {};
