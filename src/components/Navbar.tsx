"use client";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Diretoria", href: "/diretoria" },
  { label: "Membros", href: "/membros" },
  { label: "Eventos", href: "/eventos" },
  { label: "Mercado", href: "/mercado" },
  { label: "Inteligência", href: "/inteligencia" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy/95 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl font-bold gold-gradient">BSWFCC</span>
            <span className="hidden sm:block text-xs text-gray-400 max-w-[200px] leading-tight">
              Brazilian Southwest Florida<br />Chamber of Commerce
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm text-gray-300 hover:text-gold transition-colors rounded-lg hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-4 px-4 py-2 text-sm font-medium bg-gold text-navy rounded-lg hover:bg-light-gold transition-colors"
            >
              Entrar
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-gold p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-dark-blue border-t border-gold/20">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-gray-300 hover:text-gold hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 text-gold font-medium">
            Entrar
          </Link>
        </div>
      )}
    </nav>
  );
}
