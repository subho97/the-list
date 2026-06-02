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

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 md:hidden">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-amber-primary'
                    : 'text-olive-light hover:text-stone-600'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-50">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-6 h-14">
          <Link href="/" className="font-serif text-xl font-bold text-amber-primary">
            The List
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-primary/10 text-amber-primary'
                      : 'text-olive hover:text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
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
