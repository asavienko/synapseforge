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
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 z-50 px-6 py-4 flex flex-col gap-1 text-sm text-gray-600 dark:text-zinc-400">
          {/* Primary nav */}
          <a href="#how" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.services}
          </a>
          <a href="#demo" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.demo}
          </a>
          <a href="#pricing" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.pricing}
          </a>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-white/10 my-1" />

          {/* Secondary links */}
          <Link href="/templates" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.templates}
          </Link>
          <Link href="/use-cases" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.useCases}
          </Link>
          <Link href="/blog" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.blog}
          </Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.contact}
          </Link>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-white/10 my-1" />

          <Link href="/sign-in" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-2">
            {labels.signIn}
          </Link>
        </div>
      )}
    </>
  );
}
