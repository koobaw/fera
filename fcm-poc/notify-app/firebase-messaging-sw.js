// this file must be in root folder
importScripts(
  "https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyCmsBCaOlO639E_eaW8-LSnjd8qSEyWmhs",
  authDomain: "cainz-cainzapp-backend-dev.firebaseapp.com",
  databaseURL: "https://cainz-cainzapp-backend-dev-default-rtdb.firebaseio.com",
  projectId: "cainz-cainzapp-backend-dev",
  storageBucket: "cainz-cainzapp-backend-dev.appspot.com",
  messagingSenderId: "199688626981",
  appId: "1:199688626981:web:f720ec5bd01d0b4657b0cc",
  measurementId: "G-E8CKK003H5",
};

// receiving messages in background
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// get this type of message in background
messaging.onBackgroundMessage(function (payload) {
  if (!payload.hasOwnProperty("notification")) {
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: payload.data.icon,
      image: payload.data.image,
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
    self.addEventListener("notificationclick", function (event) {
      const clickedNotification = event.notification;
      clickedNotification.close();
      event.waitUntil(clients.openWindow(payload.data.click_action));
    });
  }
});
