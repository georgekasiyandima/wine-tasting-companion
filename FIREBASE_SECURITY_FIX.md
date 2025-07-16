# Firebase Security Rules Fix

## 🚨 **Current Issue**
You're getting this error:
```
Error fetching wines: Error: permission_denied at /users/diPOGVoI8eXNJMe2hAYzVgVLfEN2/wines: Client doesn't have permission to access the desired data.
```

## 🔧 **Quick Fix: Demo Mode (Already Applied)**
I've enabled demo mode by creating `.env.local` with `VITE_DEMO_MODE=true`. This will allow the app to work with mock data without Firebase configuration.

## 🛠️ **Permanent Fix: Update Firebase Security Rules**

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `winetastingcompanion`
3. Click **Realtime Database** in the left sidebar

### Step 2: Update Security Rules
1. Click the **Rules** tab
2. Replace the current rules with this exact configuration:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "wines": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "tastingSessions": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        },
        "cellars": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    },
    "wines": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "tastingSessions": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "cellars": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Step 3: Publish Rules
1. Click **Publish** to save the rules
2. Wait a few seconds for the rules to propagate

### Step 4: Test the Fix
1. Refresh your app in the browser
2. Sign in again
3. Navigate to Dashboard
4. The wines should now load without permission errors

## 🔍 **What These Rules Do**

- **User-specific data**: Users can only access their own wines, tasting sessions, and cellars
- **Global data**: All authenticated users can read/write to the global wines, sessions, and cellars collections
- **Security**: Prevents users from accessing other users' private data

## 🚀 **Alternative: Keep Demo Mode**

If you prefer to continue using demo mode for development:
1. Keep the `.env.local` file with `VITE_DEMO_MODE=true`
2. The app will work with mock data
3. No Firebase configuration needed

## 📞 **Need Help?**

If you're still having issues:
1. Check the browser console for new error messages
2. Verify the rules were published successfully
3. Try signing out and signing back in
4. Clear browser cache and cookies

## 🔐 **Security Note**

For production deployment:
- Update rules to be more restrictive
- Add your production domain to authorized domains
- Consider using Firebase App Check
- Review and audit access patterns 