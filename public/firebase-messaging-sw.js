




importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyCzMKKqK_Y4U_w0YHEgryUlHMOKX5XTHrg",
    authDomain: "amrti-675c7.firebaseapp.com",
    projectId: "amrti-675c7",
    storageBucket: "amrti-675c7.appspot.com",
    messagingSenderId: "739166640710",
    appId: "1:739166640710:web:44fad55f60e613dd570847",
    measurementId: "G-X011SBYWKS"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
    );
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});