# Puriva Live Cold Pressed Juice Menu

Dynamic QR menu for Puriva Live, built with Next.js App Router and Supabase. The cold-pressed menu is normalized by `baseName`, so the public view shows groups like `Sunkist -> Pure, Carrot, Pineapple, Strawberry` instead of repeating `Sunkist + ...` on every line.

## Stack

- Next.js `16.2.6`, React `19.2.4`, TypeScript, Tailwind CSS
- Supabase Auth, Postgres, Row Level Security
- Vercel-ready frontend and backend client usage through environment variables

## Architecture

```text
src/domain/menu              business types, formatters, grouping rules, seed catalog
src/application/menu         repository port and use-case functions
src/infrastructure/supabase  Supabase client and repository adapter
src/components               public QR menu and admin editor UI
src/app                      App Router routes and Server Actions
supabase/schema.sql          tables, RLS policies, seed data
```

The public route can render with local seed data when Supabase env is absent. Admin mutations require Supabase, Auth, and an `admin` profile role.

## Local Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- Public QR menu: `http://localhost:3000`
- Admin console: `http://localhost:3000/admin`

## Supabase Setup

1. Create a free Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Create an auth user in Supabase.
4. Promote that user:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin@email.com';
```

5. Add these env vars to `.env.local` and Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# Or, if your Supabase dashboard shows the newer key name:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Security notes:

- The anon key is safe to expose because RLS owns access control.
- Server Actions verify `profiles.role = admin` before every mutation.
- Public users can only read active sections and available entries.
- Admin writes use the logged-in user's Supabase session, not a service-role key.

## Deploy

Push the repo to GitHub, import it into Vercel, and set the same Supabase environment variables. Vercel's free tier is enough for this menu app, and Supabase free tier covers the database/auth layer for early usage.
