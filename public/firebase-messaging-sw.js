

importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
    
    apiKey: "AIzaSyCacK4GQ0TyQgCm2zWepnhSCQ0JyiJqeo4",
    authDomain: "freshtrack-a5ce4.firebaseapp.com",
    projectId: "freshtrack-a5ce4",
    messagingSenderId: "468653965948",
    appId: "1:468653965948:web:5256445622b1be820e7ff9",
   
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  console.log("Background message: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };


  self.registration.showNotification(notificationTitle, notificationOptions);
});
