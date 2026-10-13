# Newsroom (admin) setup — Supabase + Vercel

The site works without this (it shows its built-in content). Follow these steps once to
switch on the admin page at **/admin** so you can edit everything yourself.

## 1. Create the Supabase project
1. Go to <https://supabase.com> → **New project** (free plan is fine). Name: `dhruv-times`.
2. Pick a strong database password and save it in a password manager.

## 2. Create the tables, security rules and storage
1. Supabase → **SQL Editor** → **New query**.
2. Paste the whole of `supabase/schema.sql` → **Run**.
3. New query → paste `supabase/seed.sql` → **Run** (copies your current site content in).

## 3. Lock down sign-in and create your admin account
1. **Authentication → Sign In / Providers**: turn **OFF** “Allow new users to sign up”.
   (Keep the Email provider enabled.)
2. **Authentication → Users → Add user → Create new user**: your email + a long unique
   password, tick **Auto Confirm User**.
3. SQL Editor → run (with your email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'YOUR-EMAIL@example.com';
   ```
4. **Authentication → URL Configuration → Site URL**: `https://dhruv-times.vercel.app`

## 4. Connect the website
1. Supabase → **Project Settings → API**. Copy **Project URL** and the **anon public** key.
2. Put them in `config.js`:
   ```js
   window.DT_CONFIG = {
     supabaseUrl: "https://xxxx.supabase.co",
     supabaseAnonKey: "eyJ..."
   };
   ```
3. Commit and push. Vercel redeploys automatically.

**Never** put the `service_role` key anywhere in this project. The anon key is meant to be public:
Row Level Security only lets it read published content.

## 5. Use it
Open `https://dhruv-times.vercel.app/admin`, sign in, edit, **Save**. Visitors see changes on
their next page load. Untick **Published** to keep something as a draft.

Story formatting: `## Heading`, `- list item`, `> pull quote`, blank line = new paragraph.
In *About*, wrap words in `[[double brackets]]` to show them as redacted.

## Security summary
- Row Level Security on every table: public can only read published rows; only accounts in
  `public.admins` can read drafts or write. The anon role has no write privileges at all.
- Database constraints reject `javascript:` links, bad slugs and oversized text.
- Every change is written to an append-only `audit_log` (see the Activity log tab).
- Storage bucket `media` is public-read, admin-write, limited to JPEG/PNG/WebP/GIF/PDF ≤ 10 MB;
  uploads get random file names.
- Admin session lives in `sessionStorage` (cleared when the tab closes) and signs out after
  30 idle minutes. The page is `noindex` and never cached.
- Strict Content-Security-Policy and security headers via `vercel.json`; no inline scripts;
  the Supabase library is pinned to an exact version with a Subresource Integrity hash.

## Good to know
- Free Supabase projects **pause after ~7 days without activity**. The site keeps working with
  its built-in content; open the Supabase dashboard and click **Restore** to wake it.
- Optional extra protection: enable **MFA** for your Supabase dashboard account.
