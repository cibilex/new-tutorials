# Firebase Cloud Messaging

- I am using Firebase Cloud Messaging to notify users when an important event happened.I am using Firebase notification messages.Here is my stack
  Frontend: TypeScript,React,firebase
  Backend: TypeScript,Express,firebase-admin

Here is some my notes.

- The FCM SDK is supported only in pages served over HTTPS. This is due to its use of service workers, which are available only on HTTPS sites. If you need a provider, Firebase Hosting is recommended and provides a no-cost tier for HTTPS hosting on your own domain.

- **VAPID** : FCM uses VAPID(Voluntary Application Server Identification) to authorize an website.Click [here](https://firebase.google.com/docs/cloud-messaging/js/client#configure_web_credentials_with) to open related firebase documentation.
- **getToken(messaging, options)**: Subscribes the Messaging instance to push notifications. Returns a Firebase Cloud Messaging registration token that can be used to send push messages.If notification permission isn't already granted, this method asks the user for permission. The returned promise rejects if the user does not allow the app to show notifications.
- Also FCM requires a `firebase-messaging-sw.js` file in the root directory.So if you are using Vite, you should add this file into `public` directory.
- Token’a göre kullanıcı ve platform (web/android/ios) kombinasyonu da kontrol edilmeli. Aynı token’ın başka platformlarda tekrar oluşması FCM’de nadiren de olsa olabiliyor.
- **Topics**: - Topic messaging supports unlimited subscriptions for each topic. However, FCM enforces limits in these areas: One app instance can be subscribed to no more than 2000 topics. - I am not going to use topics since firebase does not allow to list topics,this might cause vital errors.
  Frontend: I created a singleton class to manage firebase operations like below:




- Firebase notification payload:
- `click_action`: Click actions support only secure HTTPS URLs.

