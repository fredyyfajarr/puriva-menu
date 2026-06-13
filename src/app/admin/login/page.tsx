import { signInAction } from "@/app/admin/actions";
import { PurivaLogo } from "@/components/brand/PurivaLogo";
import { getSupabaseEnv } from "@/infrastructure/supabase/env";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const { isConfigured } = getSupabaseEnv();
  const error = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff9ef] px-5 text-[#1f2f22]">
      <section className="w-full max-w-md rounded-[8px] border border-[#e5d7bd] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <PurivaLogo compact />
          <div>
            <h1 className="text-2xl font-black text-[#173f2a]">Admin Login</h1>
            <p className="text-sm text-[#65705e]">Puriva Live menu console</p>
          </div>
        </div>

        {!isConfigured ? (
          <div className="mb-4 rounded-[8px] border border-[#e0c58f] bg-[#fff9ef] p-3 text-sm text-[#72581d]">
            Supabase env belum terpasang. Admin login aktif setelah project Supabase dibuat.
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-[8px] border border-[#efc5bd] bg-[#fff4f2] p-3 text-sm text-[#b42318]">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <form action={signInAction} className="grid gap-4">
          <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
            Email
            <input
              name="email"
              type="email"
              className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium"
              required
            />
          </label>
          <label className="grid gap-1 text-sm font-bold text-[#4a4f45]">
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              className="h-11 rounded-[8px] border border-[#d9c8a7] px-3 font-medium"
              required
            />
          </label>
          <button className="h-11 rounded-[8px] bg-[#173f2a] text-sm font-black text-white">Sign in</button>
        </form>
      </section>
    </main>
  );
}
