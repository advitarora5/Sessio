"use client";

import { SessioLogo } from "@/components/brand/SessioLogo";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";

const videoSrc =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Spots", href: "/spots" },
  { label: "Groups", href: "/groups" },
  { label: "About", href: "#product" },
  { label: "Contact", href: "mailto:hello@sessio.app" },
];

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: easeOutExpo },
  }),
};

export function OpeningHero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#0F223A] text-white">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(15,34,58,0.58)_0%,rgba(15,34,58,0.30)_45%,rgba(15,34,58,0.80)_100%)]" />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="focus-ring rounded-lg" aria-label="Sessio home">
          <SessioLogo variant="white" wordmarkClassName="text-2xl" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-slate-200 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Link
            href="/auth/sign-up"
            className="liquid-glass rounded-full px-5 py-2.5 text-sm text-white transition-transform sm:px-6"
          >
            Create account
          </Link>
        </motion.div>
      </nav>

      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-6xl px-6 text-center">
          <motion.h1
            custom={0}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-5xl text-5xl font-semibold leading-[1.03] tracking-tight sm:text-7xl md:text-8xl"
          >
            Deep focus,{" "}
            <span className="text-slate-300">mapped</span> across your campus.
          </motion.h1>

          <motion.p
            custom={1}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg"
          >
            Sessio turns study sessions into cinematic blocks of focus with maps,
            analytics, and classroom-style gold stars from friends.
          </motion.p>

          <motion.div
            custom={2}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/session/new"
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-white px-10 text-base font-semibold text-[#0F223A] shadow-lg transition-colors hover:bg-slate-100 sm:w-auto"
              >
                Start a session
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/auth/sign-up"
                className="inline-flex h-14 w-full items-center justify-center rounded-full border border-white/40 bg-white/5 px-10 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/15 sm:w-auto"
              >
                Create account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 mb-8 flex justify-center"
      >
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
          Scroll to see your week
        </span>
      </motion.div>
    </section>
  );
}
