# Deploy to production

Checklist to run this app in production at your domain (e.g. **https://your-domain.com**).

## 1. Build and run locally (smoke test)

```bash
npm run build
npm run start
```

Open http://localhost:3001 and test booking + admin.

## 2. Environment variables

Use the template in **`env.example`**. Copy those keys into your host’s environment (e.g. Vercel).

| Variable                   | Required | Notes                                            |
| -------------------------- | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`     | Yes      | Your production URL (e.g. `https://your-domain.com`) |
| `NEXTAUTH_URL`             | Yes      | Same as site URL (apex, not www)                 |
| `NEXTAUTH_SECRET`          | Yes      | e.g. `openssl rand -base64 32`                   |
| `ADMIN_EMAIL`              | Yes      | Admin login email                                |
| `ADMIN_PASSWORD`           | Yes      | Admin login password                             |
| `NEXT_PUBLIC_FIREBASE_*`   | Yes      | From Firebase Console → Project settings         |
| `RESEND_API_KEY`           | Yes      | For booking/notification emails                  |
| `RESEND_FROM_EMAIL`        | Optional | Use a verified domain (e.g. `noreply@your-domain.com`) |
| `ADMIN_EMAIL_NOTIFICATION` | Optional | Where to send admin notifications               |

## 3. Domain

- **Preferred:** Use your apex domain (e.g. `your-domain.com`).
- **www:** The app redirects `www.your-domain.com` → apex in **middleware** (derived from `NEXT_PUBLIC_SITE_URL`) to avoid redirect loops.

### If you use Vercel

1. Project → **Settings** → **Domains**.
2. Add your apex domain as primary and the www variant. Do **not** set “Redirect apex → www” or you may get “redirected too many times”.
3. Follow Vercel’s DNS instructions (A/CNAME for your registrar).
4. In **Environment Variables**, set `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to your production URL (e.g. `https://your-domain.com`) for **Production**.

### Fix “ERR_TOO_MANY_REDIRECTS” (apex ↔ www loop)

If you see “redirected you too many times”, **Vercel may be redirecting apex → www** while the app redirects www → apex. Fix it in Vercel:

1. **Vercel Dashboard** → your project → **Settings** → **Domains**.
2. Set the **primary domain** to your apex (e.g. `your-domain.com`).
3. For the **www** domain: choose **“Redirect to apex”** (or “Redirect to primary”).
4. Ensure the apex domain does **not** redirect anywhere.
5. Save, wait a minute, then try your site again (e.g. in an incognito window).

### If you use another host

- Point DNS for your domain (and optionally www) to that host.
- Set the same env vars and ensure HTTPS is enabled.

## 4. Firebase

1. **Firebase Console** → your project → **Authentication** → **Settings** → **Authorized domains**.
2. Add your production domain and www so auth and Firestore work.

## 5. Resend (email)

- Verify your sending domain in Resend.
- Use a from-address on that domain for `RESEND_FROM_EMAIL`.

### Avoid emails going to spam (deliverability)

1. **Verify your domain in Resend**
   - Resend Dashboard → **Domains** → Add your domain.
   - Add the DNS records Resend gives you (SPF, DKIM) at your DNS provider.
   - Wait until Resend shows the domain as **Verified**.

2. **Optional: DMARC (recommended)**
   - Add a TXT record at `_dmarc.your-domain.com` (monitoring: `v=DMARC1; p=none; rua=mailto:you@example.com`).

3. **Use a proper From name**
   - Set `RESEND_FROM_EMAIL` to an address on your verified domain. A real business name in the From field helps deliverability.

## 6. After deploy

- Open your production URL and test: Home, Services, Book flow, Privacy/Terms.
- Open `/admin/login` and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Run through: create/edit appointment, availability, analytics.

## Summary

| Step     | Action                                                                 |
| -------- | ---------------------------------------------------------------------- |
| Env      | Set all variables from `env.example` in your host for production.      |
| Domain   | Add your domain (and www) in your host’s domain settings and DNS.      |
| Firebase | Add your domain (and www) to Auth authorized domains.                  |
| Resend   | Verify your domain and use it for `RESEND_FROM_EMAIL`.                 |
| Build    | `npm run build` (or use your host’s build command).                    |
