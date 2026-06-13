import Image from "next/image";

type PurivaLogoProps = {
  compact?: boolean;
};

export function PurivaLogo({ compact = false }: PurivaLogoProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative h-9 w-9 overflow-hidden rounded-[8px] border border-[#d7c7a8] bg-[#285a39] shadow-sm">
        <Image
          src="/brand/puriva-instagram-logo.jpg"
          alt="Puriva"
          fill
          sizes="36px"
          className="object-cover"
          priority
        />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-lg font-black tracking-[0.12em] text-[#285a39]">PURIVA</span>
          <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-[#8b6c2e]">
            Juice Bar
          </span>
        </span>
      ) : null}
    </span>
  );
}
