"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

type HeroJuiceStageProps = {
  className?: string;
};

export function HeroJuiceStage({ className = "" }: HeroJuiceStageProps) {
  const shouldReduceMotion = useReducedMotion();
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const orangeId = `heroOrange-${rawId}`;
  const greenId = `heroGreen-${rawId}`;
  const pinkId = `heroPink-${rawId}`;
  const shadowId = `softShadow-${rawId}`;
  const floatAnimation = shouldReduceMotion ? undefined : { y: [0, -8, 0], rotate: [-1, 1, -1] };
  const bubbleAnimation = shouldReduceMotion ? undefined : { y: [0, -26], opacity: [0, 1, 0], scale: [0.7, 1, 0.8] };
  const waveAnimation = shouldReduceMotion ? undefined : { x: [-18, 18, -18] };
  const productCards = [
    {
      src: "/brand/sunkist-carrot.webp",
      label: "Sunkist + Carrot",
      className: "left-5 top-5 rotate-[-6deg]",
      delay: 0.15,
    },
    {
      src: "/brand/sunkist-strawberry.webp",
      label: "Sunkist + Strawberry",
      className: "right-5 top-8 rotate-[5deg]",
      delay: 0.3,
    },
    {
      src: "/brand/celery-pineapple.webp",
      label: "Celery + Pineapple",
      className: "bottom-6 left-8 rotate-[4deg]",
      delay: 0.45,
    },
  ];

  return (
    <motion.div
      className={`relative min-h-[360px] w-full max-w-lg overflow-hidden rounded-[8px] border border-[#dfcfad] bg-[#fff4dd] shadow-xl ${className}`}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.9),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(249,115,22,0.16),transparent_30%),linear-gradient(135deg,rgba(40,90,57,0.08),rgba(255,255,255,0))]" />
      {productCards.map((card) => (
        <motion.div
          key={card.label}
          className={`absolute z-10 hidden w-24 overflow-hidden rounded-[8px] border border-white/80 bg-white p-1 shadow-lg sm:block ${card.className}`}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.92 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, -8, 0], scale: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.2 }
              : { opacity: { duration: 0.35, delay: card.delay }, y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: card.delay } }
          }
        >
          <div className="relative aspect-square overflow-hidden rounded-[6px]">
            <Image src={card.src} alt={card.label} fill sizes="96px" className="object-cover" />
          </div>
        </motion.div>
      ))}
      <motion.svg
        viewBox="0 0 560 390"
        role="img"
        aria-label="Animated fruit juice illustration"
        className="absolute inset-0 h-full w-full"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <defs>
          <linearGradient id={orangeId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd65a" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id={greenId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#b8ee62" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id={pinkId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff7aa8" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#173f2a" floodOpacity="0.16" />
          </filter>
        </defs>

        <motion.g
          animate={shouldReduceMotion ? undefined : { x: [-8, 8, -8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          opacity="0.38"
        >
          <path d="M52 80 C150 42, 210 114, 314 70 S480 50, 524 100" fill="none" stroke="#f7d790" strokeWidth="16" strokeLinecap="round" />
          <path d="M44 308 C138 252, 234 332, 338 286 S478 252, 532 316" fill="none" stroke="#c7e68c" strokeWidth="14" strokeLinecap="round" />
        </motion.g>

        <motion.g animate={floatAnimation} transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }} filter={`url(#${shadowId})`}>
          <path d="M190 96 H338 L322 306 C318 334 300 350 264 350 H244 C208 350 190 334 186 306 Z" fill="#ffffff" stroke="#173f2a" strokeWidth="5" />
          <motion.path
            d="M204 190 C230 178 260 202 286 190 C306 182 322 184 330 190 L314 304 C312 318 298 326 270 326 H238 C212 326 204 318 202 304 Z"
            fill={`url(#${orangeId})`}
            animate={waveAnimation}
            transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <path d="M222 137 H310" stroke="#d8f0df" strokeWidth="21" strokeLinecap="round" />
          <circle cx="236" cy="246" r="6" fill="#173f2a" />
          <circle cx="282" cy="246" r="6" fill="#173f2a" />
          <path d="M247 266 C256 276 270 276 279 266" fill="none" stroke="#173f2a" strokeWidth="5" strokeLinecap="round" />
          <path d="M312 86 L348 34" stroke="#173f2a" strokeWidth="8" strokeLinecap="round" />
          <path d="M350 32 L366 48" stroke="#e11d48" strokeWidth="7" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={shouldReduceMotion ? undefined : { y: [0, 10, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
          filter={`url(#${shadowId})`}
        >
          <path d="M78 154 H176 L166 300 C164 322 150 334 124 334 H114 C88 334 74 322 72 300 Z" fill="#ffffff" stroke="#173f2a" strokeWidth="4" />
          <path d="M86 222 C108 212 128 230 148 222 C158 218 166 218 172 222 L160 296 C158 306 148 312 130 312 H104 C88 312 82 306 82 296 Z" fill={`url(#${greenId})`} />
          <circle cx="106" cy="258" r="4.5" fill="#173f2a" />
          <circle cx="139" cy="258" r="4.5" fill="#173f2a" />
          <path d="M114 276 C122 284 132 284 140 276" fill="none" stroke="#173f2a" strokeWidth="4" strokeLinecap="round" />
        </motion.g>

        <motion.g
          animate={shouldReduceMotion ? undefined : { y: [0, -12, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 5.3, repeat: Infinity, ease: "easeInOut" }}
          filter={`url(#${shadowId})`}
        >
          <path d="M390 158 H486 L476 302 C474 324 460 336 434 336 H424 C398 336 384 324 382 302 Z" fill="#ffffff" stroke="#173f2a" strokeWidth="4" />
          <path d="M398 220 C418 208 440 232 462 220 C470 216 478 216 482 220 L470 296 C468 306 458 312 440 312 H416 C398 312 390 306 390 296 Z" fill={`url(#${pinkId})`} />
          <circle cx="416" cy="258" r="4.5" fill="#173f2a" />
          <circle cx="449" cy="258" r="4.5" fill="#173f2a" />
          <path d="M423 276 C431 284 441 284 449 276" fill="none" stroke="#173f2a" strokeWidth="4" strokeLinecap="round" />
        </motion.g>

        <motion.g animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "126px 124px" }}>
          <circle cx="126" cy="124" r="29" fill="#f97316" />
          <circle cx="126" cy="124" r="21" fill="#ffd65a" />
          <path d="M126 103 V145 M105 124 H147 M111 109 L141 139 M141 109 L111 139" stroke="#fff7d6" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <motion.g animate={shouldReduceMotion ? undefined : { y: [0, -9, 0], rotate: [-4, 5, -4] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M402 86 C426 48 478 62 492 98 C466 112 428 112 402 86Z" fill="#16a34a" />
          <path d="M448 64 C444 90 436 104 422 114" fill="none" stroke="#0f5132" strokeWidth="4" strokeLinecap="round" />
          <path d="M410 112 L500 112 L455 156Z" fill="#ef4444" stroke="#173f2a" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="446" cy="126" r="3" fill="#173f2a" />
          <circle cx="462" cy="136" r="3" fill="#173f2a" />
        </motion.g>

        {[0, 1, 2, 3, 4, 5].map((bubble) => (
          <motion.circle
            key={bubble}
            cx={210 + bubble * 28}
            cy={116 + (bubble % 2) * 16}
            r={4 + (bubble % 3)}
            fill={bubble % 2 ? "#16a34a" : "#f97316"}
            animate={bubbleAnimation}
            transition={{ duration: 2.8, repeat: Infinity, delay: bubble * 0.28, ease: "easeOut" }}
          />
        ))}
      </motion.svg>
    </motion.div>
  );
}
