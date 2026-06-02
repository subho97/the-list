'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Plus, List } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Browse', icon: Compass },
  { href: '/add', label: 'Add', icon: Plus },
  { href: '/lists/new', label: 'Lists', icon: List },
];

export default function Nav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      {/* Mobile bottom nav — cream bg, stone border top */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-stone-200 z-50 md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-5 py-2 transition-all duration-150 ${
                  active
                    ? 'text-amber-primary'
                    : 'text-olive-light hover:text-stone-600'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.5}
                  className="transition-all duration-150"
                />
                <span className="text-[11px] font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop top nav — cream bg, inline links */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-cream/95 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-6 h-14">
          <Link
            href="/"
            className="font-serif text-xl font-bold text-amber-primary tracking-tight"
          >
            The List
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-amber-primary text-white shadow-sm'
                      : 'text-olive hover:text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
