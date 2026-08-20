// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDAZNWimAjCKSgFTNYwDbiFaTyBy6NaVdI",
  authDomain: "crbt-df05c.firebaseapp.com",
  projectId: "crbt-df05c",
  storageBucket: "crbt-df05c.appspot.com",
  messagingSenderId: "801274491647",
  appId: "1:801274491647:web:17ea6a01e580401d31d2ca",
  measurementId: "G-65MVRD9Q3G"
});

const messaging = firebase.messaging();
