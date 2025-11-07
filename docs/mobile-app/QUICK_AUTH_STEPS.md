# Quick Setup: Google & Apple Sign In

## ⚡ 2 Steps in Xcode (5 minutes total)

### Step 1: Add Apple Sign In Capability

```bash
# Open Xcode
open "Movie Club Cafe.xcodeproj"
```

Then in Xcode:
1. Select project → Target → **"Signing & Capabilities"** tab
2. Click **"+ Capability"**
3. Add **"Sign in with Apple"**

---

### Step 2: Add Google URL Scheme

Still in Xcode:
1. Select project → Target → **"Info"** tab
2. Expand **"URL Types"** → Click **"+"**
3. Fill in:
   ```
   URL Schemes: com.googleusercontent.apps.712370038259-pimrcof7fqdk1f4lctr2hu1e3dcgsofl
   Identifier: com.google.signin
   Role: Editor
   ```

---

## ✅ Done!

Press **⌘R** to build and run.

Test both sign-in buttons on the login screen.

---

## 📋 Verify in Firebase Console

Go to: https://console.firebase.google.com/

1. Select project: **ac-movie-club**
2. **Authentication** → **Sign-in method**
3. Enable **Google** and **Apple** if not already enabled

---

## 📚 Full Documentation

See **AUTH_SETUP_COMPLETE.md** for:
- Detailed implementation details
- Troubleshooting guide
- Production checklist
- Code reference

---

**That's it! You now have Google & Apple authentication! 🎉**

