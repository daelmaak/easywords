import { getMessaging, getToken } from 'firebase/messaging';

export function requestPermission() {
  console.log('Requesting permission...');
  Notification.requestPermission().then(async permission => {
    if (permission === 'granted') {
      await setUpToken();
    }
  });
}

// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
async function setUpToken() {
  const messaging = getMessaging();
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        'BD3N7U2SZQOC3BpvhFywUGvBCa1hHvCz8c8CPwWBYXvuCJsalVYzG-cjXpbT0pzAZTyQ-6ES_yoYCiajXTNxVFM',
    });
    if (currentToken) {
      // Send the token to your server and update the UI if necessary
      // ...
    } else {
      // Show permission request UI
      console.log(
        'No registration token available. Request permission to generate one.'
      );
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }
}
