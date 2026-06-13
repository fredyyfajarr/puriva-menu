import { ArrowRight, Bike, Droplets, Leaf, MapPin, MessageCircle, Search, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

import { LandingNav } from "@/components/landing/LandingNav";
import { HeroJuiceStage } from "@/components/menu/HeroJuiceStage";

const mapsUrl =
  "https://www.google.com/maps/place/Puriva+Live+Cold+Pressed+%26+Blended+Juice/@-6.274666,106.6166609,17z/data=!3m1!4b1!4m6!3m5!1s0x2e6a016df024e1a7:0x45e019470e43f6d9!8m2!3d-6.274666!4d106.6192358!16s%2Fg%2F11yjx9_bjv?entry=ttu&g_ep=EgoyMDI2MDUxNy4wIKXMDSoASAFQAw%3D%3D";
const grabFoodUrl =
  "https://food.grab.com/id/id/restaurant/puriva-live-cold-pressed-and-blended-juice-gading-serpong-delivery/6-C7MFPE3BNCMFJN?";
const whatsappUrl =
  "https://wa.me/6281283330392?text=Halo%20Puriva%20Live%2C%20saya%20mau%20order%20jus%20/%20bulk%20order.";
const shopeeFoodUrl =
  "https://shopee.co.id/now-food/shop/22729687?shareChannel=copy_link&stm_medium=organic&stm_source=google-rw&uls_trackid=55n4t7ue00q9";
const goFoodUrl =
  "https://gofood.co.id/jakarta/restaurant/puriva-live-cold-pressed-and-blended-juice-pagedangan-f198ffea-c030-4a75-af60-26bc3f1bf370?as=gmaps";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#fff9ef] text-[#233224]">
      <LandingNav grabFoodUrl={grabFoodUrl} shopeeFoodUrl={shopeeFoodUrl} goFoodUrl={goFoodUrl} whatsappUrl={whatsappUrl} />

      <section className="relative overflow-hidden border-b border-[#f0ddbc] bg-[#fff7e8]">
        <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-6xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_430px]">
          <div className="max-w-3xl">
            <div className="animate-landing-in mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8d4ab] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#7a5d21]">
              <Sparkles size={14} />
              Fresh daily juice bar
            </div>
            <h1 className="animate-landing-in text-5xl font-black leading-[0.95] text-[#173f2a] sm:text-7xl [animation-delay:90ms]">
              Puriva Live
              <span className="block text-[#d64e2a]">Cold Pressed & Blended Juice</span>
            </h1>
            <p className="animate-landing-in mt-6 max-w-2xl text-lg leading-8 text-[#4d5a47] [animation-delay:170ms]">
              Jus buah dan sayur segar yang dipress dingin, tanpa air, tanpa gula, tanpa sirup. Pilihan clean untuk
              refresh harian, detox ringan, vitamin boost, dan bulk order sehat.
            </p>
            <div className="animate-landing-in mt-8 flex flex-wrap gap-3 [animation-delay:250ms]">
              <Link
                href="/menu"
                className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-[#173f2a] px-5 text-sm font-black uppercase text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f2f1f] hover:shadow-lg"
              >
                Lihat menu
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="animate-landing-in mt-6 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#7a5d21] [animation-delay:330ms]">
              <span className="rounded-full border border-[#e8d4ab] bg-white px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#f7c76b]">Cold pressed</span>
              <span className="rounded-full border border-[#e8d4ab] bg-white px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#f7c76b]">Blended juice</span>
              <span className="rounded-full border border-[#e8d4ab] bg-white px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#f7c76b]">Cut fruits</span>
              <span className="rounded-full border border-[#e8d4ab] bg-white px-3 py-2 transition duration-200 hover:-translate-y-0.5 hover:border-[#f7c76b]">Pre-made juice</span>
            </div>
          </div>
          <HeroJuiceStage className="min-h-[390px] justify-self-center lg:justify-self-end" />
        </div>
      </section>

      <section id="quality" className="mx-auto grid scroll-mt-20 w-full max-w-6xl gap-4 px-5 py-10 sm:px-8 md:grid-cols-3">
        {[
          { icon: <Leaf size={20} />, title: "100% buah & sayur", copy: "Dibuat dari bahan segar tanpa tambahan gula, air, atau sirup." },
          { icon: <Droplets size={20} />, title: "Rasa clean", copy: "Cold pressed menjaga karakter rasa buah dan sayur tetap ringan diminum." },
          { icon: <ShoppingBag size={20} />, title: "Bisa order satuan & bulk", copy: "Cocok untuk konsumsi harian, kantor, acara, atau healthy gift." },
        ].map((item) => (
          <article key={item.title} className="animate-landing-in rounded-[8px] border border-[#e5d7bd] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[#173f2a] text-white transition duration-300 group-hover:scale-105">{item.icon}</div>
            <h2 className="mt-4 text-xl font-black text-[#173f2a]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#65705e]">{item.copy}</p>
          </article>
        ))}
      </section>

      <section className="border-y border-[#f0ddbc] bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#7a5d21]">
              <Droplets size={15} />
              Menu sehat yang tetap enak
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#173f2a]">
              Dari booster vitamin sampai hydration series.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#65705e]">
              Pilih cold-pressed juice berdasarkan base buah favorit, pre-made juice siap minum, blended juice yang
              creamy dan fresh, atau cut fruits untuk snack sehat. Kalau dine-in, gunakan QR meja untuk self order
              langsung ke kasir.
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-[8px] bg-[#d64e2a] px-5 text-sm font-black uppercase text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#c13f20] hover:shadow-lg"
            >
              Buka menu digital
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Roots & Detox", copy: "Carrot, beet, celery, dan mix sayur-buah untuk rasa clean." },
              { title: "Vitamin C Booster", copy: "Sunkist, pineapple, guava, dan strawberry untuk refresh harian." },
              { title: "Hydration", copy: "Watermelon, melon, cucumber, dan green apple yang segar diminum dingin." },
              { title: "Pre-made Juice", copy: "Varian siap minum dengan komposisi buah yang sudah dikurasi." },
            ].map((item) => (
              <article key={item.title} className="rounded-[8px] border border-[#e5d7bd] bg-[#fffaf0] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#f7c76b] hover:bg-white hover:shadow-md">
                <h3 className="font-black text-[#173f2a]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#65705e]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="location" className="mx-auto grid scroll-mt-20 w-full max-w-6xl gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[8px] border border-[#e5d7bd] bg-white p-5 shadow-sm transition duration-300 hover:shadow-lg">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#7a5d21]">
            <Bike size={15} />
            Order & delivery
          </p>
          <h2 className="mt-3 text-3xl font-black text-[#173f2a]">Order dari outlet Puriva Live Gading Serpong</h2>
          <p className="mt-3 text-sm leading-6 text-[#65705e]">
            Pilih channel delivery favorit kamu, atau chat WhatsApp untuk bulk order kantor, acara, dan request jumlah
            botol.
          </p>
          <div className="mt-5 grid gap-3">
            <a
              href={grabFoodUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-between rounded-[8px] bg-[#173f2a] px-4 text-sm font-black uppercase text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#0f2f1f] hover:shadow-md"
            >
              Order via GrabFood
              <Bike size={18} />
            </a>
            <a
              href={shopeeFoodUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-between rounded-[8px] border border-[#d64e2a] bg-[#fff1e8] px-4 text-sm font-black uppercase text-[#b83d1f] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffe4d5] hover:shadow-md"
            >
              Order via ShopeeFood
              <ShoppingBag size={18} />
            </a>
            <a
              href={goFoodUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-between rounded-[8px] border border-[#16a34a] bg-[#ecfdf3] px-4 text-sm font-black uppercase text-[#166534] transition duration-200 hover:-translate-y-0.5 hover:bg-[#dcfce7] hover:shadow-md"
            >
              Order via GoFood
              <Bike size={18} />
            </a>
          </div>
          <div className="mt-5 rounded-[8px] border border-dashed border-[#e5d7bd] bg-[#fffaf0] p-4">
            <div className="flex items-start gap-3">
              <Search className="mt-0.5 shrink-0 text-[#7a5d21]" size={18} />
              <p className="text-sm leading-6 text-[#65705e]">
                ShopeeFood dan GoFood juga tersedia untuk order delivery. Link lengkapnya ada di dropdown{" "}
                <span className="font-black text-[#173f2a]">Order</span> pada navbar.
              </p>
            </div>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="group relative min-h-[420px] overflow-hidden rounded-[8px] border border-[#e5d7bd] bg-[#fffaf0] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="absolute inset-0 opacity-80">
            <div className="absolute left-[12%] top-0 h-full w-px bg-[#e5d7bd]" />
            <div className="absolute left-[34%] top-0 h-full w-px bg-[#e5d7bd]" />
            <div className="absolute left-[58%] top-0 h-full w-px bg-[#e5d7bd]" />
            <div className="absolute left-[78%] top-0 h-full w-px bg-[#e5d7bd]" />
            <div className="absolute left-0 top-[18%] h-px w-full bg-[#e5d7bd]" />
            <div className="absolute left-0 top-[42%] h-px w-full bg-[#e5d7bd]" />
            <div className="absolute left-0 top-[66%] h-px w-full bg-[#e5d7bd]" />
            <div className="absolute left-0 top-[84%] h-px w-full bg-[#e5d7bd]" />
            <div className="absolute left-[-8%] top-[52%] h-12 w-[118%] rotate-[-8deg] bg-[#d9f0df]" />
            <div className="absolute left-[25%] top-[-10%] h-[120%] w-12 rotate-[18deg] bg-[#fde8bf]" />
          </div>
          <div className="animate-soft-pulse absolute left-1/2 top-1/2 flex h-24 w-24 items-center justify-center rounded-full bg-[#173f2a] text-white shadow-xl">
            <MapPin size={42} />
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-[8px] border border-[#e5d7bd] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7a5d21]">Google Maps</p>
            <h3 className="mt-2 text-2xl font-black text-[#173f2a]">Puriva Live, Gading Serpong</h3>
            <p className="mt-2 text-sm leading-6 text-[#65705e]">
              Tap card ini untuk buka rute langsung di Google Maps.
            </p>
          </div>
        </a>
      </section>

      <section className="border-t border-[#f0ddbc] bg-[#173f2a]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-9 text-white sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-black">Mau stock jus untuk kantor atau acara?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Chat WhatsApp untuk tanya ketersediaan, request jumlah botol, atau bulk order.
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-sm font-black uppercase text-[#173f2a] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Chat WhatsApp
            <MessageCircle size={17} />
          </a>
        </div>
      </section>

      <footer className="border-t border-[#f0ddbc] px-5 py-6 text-center text-sm font-bold text-[#65705e]">
        Copyright 2026. Made with love by fredyyfajarr.
      </footer>
    </main>
  );
}
