# Puriva F&B Automation

Web app untuk Puriva Live Cold Pressed & Blended Juice. Sistem ini mencakup landing page promosi, menu publik, QR self-order per meja, order management kasir, stock control, invoice/reporting, dashboard analytics, audit log, dan fondasi payment QRIS Midtrans sandbox.

## Stack

- Next.js `16.2.6`, React `19.2.4`, TypeScript, Tailwind CSS
- Supabase Auth, Postgres, Storage, Row Level Security
- Midtrans sandbox integration untuk dynamic QRIS
- Recharts untuk dashboard analytics
- PDFKit untuk invoice/report PDF
- Playwright untuk E2E desktop dan mobile

## Architecture

```text
src/domain              business types and pure domain rules
src/application         repository ports and use-case boundaries
src/infrastructure      Supabase and Midtrans adapters
src/components          UI components by feature area
src/app                 Next.js App Router routes, API routes, Server Actions
supabase/migrations     database migration history
supabase/schema.sql     current schema snapshot and seed data
e2e                     Playwright end-to-end tests
```

Menu cold-pressed disimpan satu row per base fruit. Contoh: `Sunkist` punya list mix seperti `Green Apple`, `Pineapple`, `Strawberry`, dan `Original`, sehingga admin tidak perlu membuat item berulang seperti `Sunkist + Pineapple`.

## Core Features

- Landing page promosi outlet, Maps, GrabFood, GoFood, ShopeeFood, dan WhatsApp bulk order.
- Public menu di `/menu`.
- QR self-order per meja dengan token random, bukan URL mudah ditebak seperti `/table/T01`.
- Cart order dengan payment method: Cash, EDC BCA, QRIS Static, Dynamic QRIS.
- POS kasir / order management untuk progress order.
- Dining table admin untuk generate/regenerate QR meja.
- Stock control:
  - Cold-pressed base yang habis akan mematikan original base itu.
  - Mix cold-pressed lain yang memakai ingredient habis ikut diblok.
  - Cut fruit dan blended juice yang memakai ingredient live habis ikut diblok.
  - Pre-made juice tidak auto ikut habis karena dianggap finished stock di kulkas.
- Invoice harian, mingguan, bulanan, tahunan, dan selected date.
- Dashboard analytics untuk BI awal.
- Audit log untuk aksi penting admin/system.
- Staff role hanya melihat fitur yang diizinkan: order management, stock control, invoice.

## Brand & Menu Assets

- Logo sementara memakai aset asli Puriva dari profil Instagram resmi.
- Hero tetap memakai animasi juice custom, ditambah kartu foto produk real dari GrabFood Puriva.
- Gambar menu disimpan di Supabase Storage bucket `menu-images`; kolom menu menggunakan URL publik dari bucket tersebut.
- Cold-pressed variant image disimpan per mix di `menu_entries.mix_image_urls`, sehingga warna/foto bisa berbeda untuk `Sunkist + Carrot`, `Sunkist + Strawberry`, dan seterusnya.
- UI theme diarahkan ke warna hijau dan putih agar konsisten dengan brand Puriva.

## Local Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- Landing page: `http://localhost:3000`
- Public menu: `http://localhost:3000/menu`
- Admin console: `http://localhost:3000/admin`
- QR table order: gunakan QR token dari halaman admin tables

## Environment

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SERVER_KEY=
MIDTRANS_NOTIFICATION_URL=
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai server-side dan local test. Jangan expose ke browser.

Untuk Midtrans lokal, gunakan ngrok untuk webhook:

```bash
MIDTRANS_NOTIFICATION_URL=https://your-ngrok-url.ngrok-free.app/api/payments/midtrans/webhook
```

URL yang sama dipasang di Midtrans Sandbox Dashboard pada Payment Notification URL.

## Supabase Workflow

Link project:

```bash
supabase link --project-ref <project-ref>
```

Push migration:

```bash
supabase db push
```

Jika PowerShell memblokir script Supabase, gunakan:

```bash
supabase.cmd db push
```

Remote dev project saat ini memakai migration history sampai:

```text
20260614000100_grab_menu_images
```

Migration terbaru menambahkan mapping gambar produk real dari GrabFood Puriva ke menu biasa dan varian cold-pressed.

## Tests

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

E2E memakai Playwright dan membutuhkan `.env.local` yang berisi Supabase URL + service role key. Test akan mengambil active dining table token dari dev DB dan submit order cash test.

Install browser Playwright jika belum ada:

```bash
npx playwright install chromium
```

## Deploy

Push ke GitHub, import repo ke Vercel, lalu isi environment variables yang sama. Untuk production payment, ganti Midtrans ke production mode dan gunakan webhook URL domain Vercel:

```text
https://your-domain.vercel.app/api/payments/midtrans/webhook
```

## Security Notes

- Public table order memakai QR token random dan lookup RPC, bukan predictable table code.
- Admin route dilindungi Supabase Auth + profile role.
- Staff role dibatasi di UI dan server authorization.
- Public read dibatasi oleh RLS dan service-side catalog filtering.
- Payment webhook memvalidasi status, amount, dan provider reference sebelum update order.
- Service role hanya dipakai untuk server-side trusted operations.
