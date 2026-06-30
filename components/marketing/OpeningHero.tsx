"use client";

import { SessioLogo } from "@/components/brand/SessioLogo";
import { Skiper19 } from "@/components/ui/svg-follow-scroll";
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
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(15,34,58,0.55)_0%,rgba(15,34,58,0.28)_42%,rgba(15,34,58,0.78)_100%)]" />

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
            href="/session/new"
            className="liquid-glass rounded-full px-5 py-2.5 text-sm text-white transition-transform sm:px-6"
          >
            Start a session
          </Link>
        </motion.div>
      </nav>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-12 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-16">
        <div className="max-w-2xl text-center lg:text-left">
          <motion.h1
            custom={0}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl"
          >
            Deep focus,{" "}
            <span className="text-slate-300">mapped</span> across your campus.
          </motion.h1>
          <motion.p
            custom={1}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg lg:mx-0"
          >
            Sessio turns study sessions into cinematic blocks of focus with maps,
            analytics, and classroom-style gold stars from friends.
          </motion.p>
          <motion.div
            custom={2}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/session/new"
                className="liquid-glass inline-flex rounded-full px-10 py-4 text-base text-white transition-transform sm:px-12"
              >
                Start a session
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/auth/sign-up"
                className="inline-flex rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
              >
                Create account
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          custom={3}
          variants={fadeRise}
          initial="hidden"
          animate="show"
          className="w-full max-w-md lg:max-w-lg"
        >
          <Skiper19 />
        </motion.div>
      </div>
    </section>
  );
}
