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
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/5 z-50 px-6 py-4 flex flex-col gap-4 text-sm text-gray-600 dark:text-zinc-400">
          <a href="#how" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-1">
            {labels.services}
          </a>
          <a href="#pricing" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-1">
            {labels.pricing}
          </a>
          <a href="#about" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-1">
            {labels.about}
          </a>
          <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-1">
            {labels.contact}
          </Link>
          <Link href="/sign-in" onClick={() => setOpen(false)} className="hover:text-gray-900 dark:hover:text-white transition-colors py-1">
            {labels.signIn}
          </Link>
        </div>
      )}
    </>
  );
}
