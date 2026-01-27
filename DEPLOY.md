# Deploy to blondhouse.nl

Checklist to run this app in production at **https://blondhouse.nl**.

## 1. Build and run locally (smoke test)

```bash
npm run build
npm run start
```

Open http://localhost:3001 and test booking + admin.

## 2. Environment variables

Use the template in **`env.example`**. Copy those keys into your host’s environment (e.g. Vercel).

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://blondhouse.nl` |
| `NEXTAUTH_URL` | Yes | `https://blondhouse.nl` (same as site URL) |
| `NEXTAUTH_SECRET` | Yes | e.g. `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `NEXT_PUBLIC_FIREBASE_*` | Yes | From Firebase Console → Project settings |
| `RESEND_API_KEY` | Yes | For booking/notification emails |
| `RESEND_FROM_EMAIL` | Optional | Default `noreply@blondhouse.nl` – use a verified domain |
| `ADMIN_EMAIL_NOTIFICATION` | Optional | Where to send admin notifications |

## 3. Domain (blondhouse.nl)

- **Preferred domain:** `blondhouse.nl` (apex).
- **www:** The app redirects `www.blondhouse.nl` → `https://blondhouse.nl` in **middleware** (early, before anything else) to avoid redirect loops.

### If you use Vercel

1. Project → **Settings** → **Domains**.
2. Add `blondhouse.nl` as primary and `www.blondhouse.nl`. Do **not** set “Redirect apex → www” or you’ll get “redirected too many times”.
3. Follow Vercel’s DNS instructions (A/CNAME for your registrar).
4. In **Environment Variables**, set `NEXT_PUBLIC_SITE_URL=https://blondhouse.nl` and `NEXTAUTH_URL=https://blondhouse.nl` for **Production**.

### Fix “ERR_TOO_MANY_REDIRECTS” (apex ↔ www loop)

If you see “blondhouse.nl redirected you too many times”, **Vercel is redirecting apex → www** while the app redirects www → apex. Fix it in Vercel:

1. **Vercel Dashboard** → your project → **Settings** → **Domains**.
2. You should see **blondhouse.nl** and **www.blondhouse.nl**. One of them is “Primary” or has a redirect.
3. **Set the primary domain to `blondhouse.nl`** (apex).  
   - If there is a **“Redirect”** or **“Edit”** next to a domain, open it.  
   - For **www.blondhouse.nl**: choose **“Redirect to blondhouse.nl”** (or “Redirect to primary”).  
   - For **blondhouse.nl**: it must **not** redirect anywhere; it should be the primary.  
4. If you see **“Redirect apex (blondhouse.nl) to www”** or **“Make www the primary”**, **turn that off** or switch to “Redirect www to apex” / “blondhouse.nl is primary”.
5. Save, wait a minute, then try https://blondhouse.nl again (ideally in an incognito window or after clearing cookies for blondhouse.nl).

### If you use another host

- Point DNS for `blondhouse.nl` (and optionally `www.blondhouse.nl`) to that host.
- Set the same env vars and ensure HTTPS is enabled.

## 4. Firebase

1. **Firebase Console** → your project → **Authentication** → **Settings** → **Authorized domains**.
2. Add `blondhouse.nl` and `www.blondhouse.nl` so auth and Firestore work on your domain.

## 5. Resend (email)

- Verify the domain **blondhouse.nl** in Resend.
- Use a from-address on that domain (e.g. `noreply@blondhouse.nl`) for `RESEND_FROM_EMAIL`.

## 6. After deploy

- Open https://blondhouse.nl and test:
  - Home, Services, Book flow, Privacy/Terms.
- Open https://blondhouse.nl/admin/login and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Run through: create/edit appointment, availability, analytics.

## Summary

| Step | Action |
|------|--------|
| Env | Set all variables from `env.example` in your host (production = blondhouse.nl). |
| Domain | Add blondhouse.nl (and www) in your host’s domain settings and DNS. |
| Firebase | Add blondhouse.nl (and www) to Auth authorized domains. |
| Resend | Verify blondhouse.nl and use it for `RESEND_FROM_EMAIL`. |
| Build | `npm run build` (or use your host’s build command). |
