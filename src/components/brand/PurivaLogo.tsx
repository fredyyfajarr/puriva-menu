import Image from "next/image";

type PurivaLogoProps = {
  compact?: boolean;
  className?: string;
};

export function PurivaLogo({ compact = false, className = "" }: PurivaLogoProps) {
  if (!compact) {
    return (
      <span
        aria-label="Puriva"
        className={`inline-block font-serif text-xl font-semibold uppercase leading-none tracking-[0.34em] text-[#173f2a] ${className}`}
      >
        PURÍVA
      </span>
    );
  }

  return (
    <span className="inline-flex items-center">
      <span className={`relative h-9 w-9 overflow-hidden rounded-[8px] ${className}`}>
        <Image
          src="/brand/puriva-instagram-logo.jpg"
          alt="Puriva"
          fill
          sizes="36px"
          className="object-contain"
          priority
        />
      </span>
    </span>
  );
}
