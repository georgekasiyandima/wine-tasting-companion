# Firebase Setup Guide for Wine Tasting Companion

## 🔧 **Current Issue**
You're getting `auth/configuration-not-found` errors because Google Sign-In is not properly configured in your Firebase project.

## 📋 **Step-by-Step Firebase Configuration**

### 1. **Enable Authentication in Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `winetastingcompanion`
3. In the left sidebar, click **Authentication**
4. Click **Get started** if you haven't set up Authentication yet

### 2. **Enable Email/Password Authentication**

1. In Authentication, click the **Sign-in method** tab
2. Click **Email/Password**
3. Toggle **Enable** to ON
4. Click **Save**

### 3. **Enable Google Sign-In**

1. In the Sign-in method tab, click **Google**
2. Toggle **Enable** to ON
3. Add a **Project support email** (your email)
4. Click **Save**

### 4. **Configure Authorized Domains**

1. In Authentication, click the **Settings** tab
2. Scroll down to **Authorized domains**
3. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - Your production domain (when you deploy)

### 5. **Enable Realtime Database**

1. In Firebase Console, click **Realtime Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location close to you
5. Click **Done**

### 6. **Enable Storage**

1. In Firebase Console, click **Storage**
2. Click **Get started**
3. Choose **Start in test mode** (for development)
4. Select a location close to you
5. Click **Done**

### 7. **Update Database Rules**

1. In Realtime Database, click the **Rules** tab
2. Replace the rules with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "wines": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "tastingSessions": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 8. **Update Storage Rules**

1. In Storage, click the **Rules** tab
2. Replace the rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 **Alternative: Use Demo Mode**

If you want to test the app without setting up Firebase, you can use the demo mode:

1. Create a `.env.local` file in your project root
2. Add: `VITE_DEMO_MODE=true`
3. The app will work with mock data

## 🔍 **Troubleshooting**

### Common Issues:

1. **"auth/configuration-not-found"**
   - Make sure Google Sign-In is enabled in Firebase Console
   - Check that your domain is in authorized domains

2. **"auth/unauthorized-domain"**
   - Add `localhost` to authorized domains in Firebase Console

3. **"auth/popup-blocked"**
   - Allow pop-ups for localhost in your browser

4. **Database permission denied**
   - Update database rules as shown above

### Testing Steps:

1. After configuration, restart your development server
2. Try signing up with email/password first
3. Then try Google Sign-In
4. Check browser console for specific error messages

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for specific error codes
2. Verify all Firebase services are enabled
3. Make sure your Firebase config matches the one in `src/services/firebase.ts`

## 🔐 **Security Note**

For production:
- Update database and storage rules to be more restrictive
- Add your production domain to authorized domains
- Consider using Firebase App Check for additional security 