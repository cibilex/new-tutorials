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
- **Topics**:
     - Topic messaging supports unlimited subscriptions for each topic. However, FCM enforces limits in these areas: One app instance can be subscribed to no more than 2000 topics.
Frontend: I created a singleton class to manage firebase operations like below:
```ts
// Import the functions you need from the SDKs you need
import { FirebaseApp, FirebaseError, initializeApp } from "firebase/app";
import { Messaging, getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";
import { enqueueSnackbar } from "notistack";

import { firebaseConfig } from "@/constants/firebase";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

class FirebaseManager {
    private static instance: FirebaseManager;
    private app: FirebaseApp;
    private messaging: Messaging;
    private isSupported: boolean = false;

    private constructor() {
        this.app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(this.app);

        onMessage(this.messaging, (payload) => {
            console.log(payload, "payload");
        });
    }

    public static getInstance(): FirebaseManager {
        if (!FirebaseManager.instance) {
            FirebaseManager.instance = new FirebaseManager();
        }
        return FirebaseManager.instance;
    }

    async checkBrowserSupport() {
        this.isSupported = await isSupported();
        if (!this.isSupported) {
            console.log("Firebase messaging is not supported in this browser.");
            enqueueSnackbar("Firebase messaging is not supported in this browser.", {
                variant: "error",
            });
            return;
        }
    }

    // async delToken() {
    //     const res = await deleteToken(this.messaging);
    //     console.log(res, "del token res");
    // }

    async initMessaging() {
        await this.checkBrowserSupport();
        if (!this.isSupported) return;

        try {
            await this.delToken();
            const token = await getToken(this.messaging, {
                vapidKey: "BBceKQvDTbthYBuvYhKEdfyelJtAR8zksaLrdQgX0JoyCqnSdxcf5b7IDJwJ3BR8UuQpOzc8Es63iAUiNRJyLLE",
            });
            if (!token) {
                enqueueSnackbar("Bildirim kurulumu yapılamadı.", {
                    variant: "error",
                });
                return;
            }
            console.log(token);
            console.log("token");
        } catch (err) {
            console.table(err);
            let message = "";
            if (err && err instanceof FirebaseError) {
                if (err.code === "messaging/permission-blocked") {
                    message =
                        "Bildirim İzni bloklanmış durumda,Bildirimleri alabilmek için lütfen bildirimlerin iznini veriniz";
                }
            }
            if (!message) {
                message = "Firebase messaging token alınamadı.";
            }
            enqueueSnackbar(message, {
                variant: "error",
            });
        }
    }
}
const firebaseManager = FirebaseManager.getInstance();

export default firebaseManager;
```

I will start to write code but I need to decide how my structure should be.So please let's make a perfect logic:
I am planning to run `initMessaging` when an user logs in.But a token must represent only one user.For example I run below steps:
1. Login in with A user => run `initMessaging` => token value is `x`
2. Logout and log in with different user => run `initMessaging` =>token value is still `x`

How to