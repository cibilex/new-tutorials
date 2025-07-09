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


# Firebase Admin SDK Initialization Methods

## Method 1: GOOGLE_APPLICATION_CREDENTIALS (Recommended) ⭐

**Most secure and Google's recommended approach.**

```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/firebase-service-account.json"
```

**⚠️ Important:** Each terminal has its own lifecycle. You need to run `export` command in **every new terminal session** where you want to use Firebase.

```typescript
// Firebase SDK automatically uses GOOGLE_APPLICATION_CREDENTIALS
const app = admin.initializeApp();
```

**Advantages:** ✅ Most secure ✅ Environment-specific ✅ Docker/K8s compatible

---

## Method 2: Direct File Path

**Explicitly specify file path in code.**

```typescript
const app = admin.initializeApp({
    credential: admin.credential.cert("./path/to/firebase-service-account.json"),
});
```

**Advantages:** ✅ Simple setup  
**Disadvantages:** ❌ Less secure ❌ Not production-ready

---

## Method 3: Manual Environment Variables

**Store each credential field separately.**

```bash
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----\n"
```

```typescript
const app = admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
});
```

**Advantages:** ✅ Flexible ✅ CI/CD friendly  
**Disadvantages:** ❌ Complex setup ❌ Error-prone

## Usage Examples

### Development:

```bash
# Run in each terminal session
export GOOGLE_APPLICATION_CREDENTIALS="./src/constants/firebase-config.json"
npm start
```

### Production:

```bash
# Run in each terminal session
export GOOGLE_APPLICATION_CREDENTIALS="/app/secrets/firebase-service-account.json"
node dist/index.js
```

### Docker:


```dockerfile
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/secrets/firebase-service-account.json
```

**💡 Tip:** To avoid running export every time, add it to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
echo 'export GOOGLE_APPLICATION_CREDENTIALS="./src/constants/firebase-config.json"' >> ~/.zshrc
```
