# Authentication System Documentation

This project uses **Firebase Authentication** for a passwordless sign-in experience. We support two methods:
1.  **Phone Number (OTP)**
2.  **Email Magic Link**

## 1. Phone Authentication (OTP)

Phone authentication provides a secure, low-friction way for users to sign in using their mobile number.

### Architecture
*   **Provider:** Firebase Auth (`signInWithPhoneNumber`)
*   **Security:** reCAPTCHA Enterprise (with fallback to v2)
*   **Fraud Protection:** Managed via Firebase Console (SMS Toll Fraud Protection)

### Workflow
1.  **User Input:** User enters their phone number on the Sign-Up/Sign-In page.
2.  **reCAPTCHA:** An invisible reCAPTCHA verifies the user is human.
    *   *Note:* We use a specific Web Key configured in Google Cloud Console with `localhost` and production domains allowed.
3.  **OTP Sent:** Firebase sends a 6-digit SMS code.
4.  **Verification:** User enters the code.
5.  **Completion:**
    *   If the code is correct, the user is signed in.
    *   A user record is created/updated in Firestore via `firebaseUsersService`.

### Configuration Checklist
- [x] **Firebase Console:** Phone Sign-in enabled.
- [x] **Google Cloud:** "FarmCraft Web OTP" key created.
- [x] **Domains:** `127.0.0.1` and production domains added to the Key's allowed list.
- [x] **Fraud Protection:** "Block none" (or disabled) to allow standard reCAPTCHA v2 fallback if Enterprise fails.

---

## 2. Email Magic Link

Email authentication uses a "Magic Link" sent to the user's inbox. Clicking the link signs them in without a password.

### Architecture
*   **Provider:** Firebase Auth (`sendSignInLinkToEmail`, `signInWithEmailLink`)
*   **State Management:** `localStorage` is used to persist the user's email during the flow (to avoid asking for it again).

### Workflow
1.  **Initiation:**
    *   User enters email on Sign-Up/Sign-In page.
    *   App calls `sendSignInLinkToEmail`.
    *   **Crucial:** The email address is saved to `localStorage` (`farmcraft_email_link_data`).
2.  **Email Sent:** User receives an email with a verification link.
3.  **Verification (Same Device):**
    *   User clicks the link.
    *   App opens `/auth/verify-email`.
    *   App detects the email in `localStorage`.
    *   Sign-in completes automatically.
4.  **Verification (Different Device):**
    *   User clicks the link on a different device (e.g., phone).
    *   App opens `/auth/verify-email`.
    *   `localStorage` is empty.
    *   App prompts user: *"Please confirm your email address"*.
    *   User enters email -> Sign-in completes.

### Code Reference
*   **Sending:** `src/context/AuthContext.tsx` -> `sendEmailLink`
*   **Landing Page:** `src/app/(site)/auth/verify-email/page.tsx`

---

## How to Test

### Testing Phone Auth
1.  Go to `/sign-up`.
2.  Select **"Phone"** tab.
3.  Enter a valid phone number.
4.  Solve reCAPTCHA (if visible).
5.  Enter the OTP received via SMS.
6.  **Success:** You should be redirected to `/account`.

### Testing Email Auth
1.  Go to `/sign-up`.
2.  Select **"Email"** tab.
3.  Enter your email address.
4.  Check your inbox for "Sign in to FarmCraft".
5.  Click the link.
6.  **Success:** You should be redirected to `/account` automatically.

### Troubleshooting
*   **Phone Error (400/Invalid Credential):** Usually means the reCAPTCHA key is blocked or the Fraud Protection settings are too strict. Ensure "Block none" is set in Firebase Console.
*   **Email Link Invalid:** Links are one-time use. If you click it twice, it will fail. Request a new one.

---

## Deployment Checklist

When deploying to production (e.g., Vercel, Netlify, or custom domain), you **must** update your Firebase configuration:

1.  **Authorized Domains:**
    *   Go to [Firebase Console](https://console.firebase.google.com/) -> Authentication -> Settings -> Authorized Domains.
    *   Click **Add Domain**.
    *   Enter your production domain (e.g., `www.your-furniture-store.com`).
    *   *Note:* `localhost` and `127.0.0.1` are added by default for development.

2.  **Environment Variables:**
    *   Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set in your production environment.
    *   Ensure `FIREBASE_ADMIN_PRIVATE_KEY` and `FIREBASE_ADMIN_CLIENT_EMAIL` are set for server-side operations.

3.  **reCAPTCHA (Phone Auth):**
    *   If using reCAPTCHA Enterprise, add your production domain to the allowed domains list in the Google Cloud Console (Security -> reCAPTCHA Enterprise).
