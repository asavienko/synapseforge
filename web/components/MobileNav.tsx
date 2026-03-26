"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface MobileNavProps {
  labels: {
    services: string;
    pricing: string;
    about: string;
    contact: string;
    signIn: string;
    demo: string;
    templates: string;
    useCases: string;
    blog: string;
  };
}

export function MobileNav({ labels }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden p-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white/98 dark:bg-[#0a0a0f]/98 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.06] z-50 px-6 py-5 flex flex-col gap-0.5 text-[15px] text-gray-600 dark:text-zinc-400 shadow-xl shadow-black/5 dark:shadow-black/20">
            {/* Primary nav */}
            <a href="#how" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3">
              {labels.services}
            </a>
            <a href="#demo" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3">
              {labels.demo}
            </a>
            <a href="#pricing" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3">
              {labels.pricing}
            </a>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-white/[0.06] my-2" />

            {/* Secondary links */}
            <Link href="/templates" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3">
              {labels.templates}
            </Link>
            <Link href="/use-cases" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3">
              {labels.useCases}
            </Link>
            <Link href="/blog" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3">
              {labels.blog}
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3">
              {labels.contact}
            </Link>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-white/[0.06] my-2" />

            <Link href="/sign-in" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all py-2.5 px-3 rounded-lg -mx-3 font-medium">
              {labels.signIn}
            </Link>
          </div>
        </>
      )}
    </>
  );
}
