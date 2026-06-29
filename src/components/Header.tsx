
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import HeaderSearch from './HeaderSearch';
import { toolCategories } from '../data/toolCategories';

const Header: React.FC = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLUListElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuActive(!isMenuActive);
  };

  const closeMenu = () => {
    setIsMenuActive(false);
  };

  // Close mobile menu when pathname changes
  useEffect(() => {
    closeMenu();
  }, [pathname]);

  // Click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isMenuActive && !target.closest('.navbar')) {
        closeMenu();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuActive]);

  return (
    <header className="fixed top-0 left-0 right-0 h-20 glass-panel border-b border-slate-200/40 z-50 flex items-center navbar">
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 group">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-36 h-10 animate-float">
              <Image
                src="/images/logo.png"
                alt="Tuitility"
                fill
                sizes="(max-width: 144px) 100vw, 144px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Search */}
        <HeaderSearch idPrefix="desktopSearch" isMobile={false} />

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center space-x-1">
          <li className="animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-slate-100/80 ${
                pathname === '/' ? 'text-accent bg-accent-soft/40' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
          </li>
          {toolCategories.map((category, i) => {
            const isActive = pathname.startsWith(category.url);
            return (
              <li className="animate-fade-in-up" key={category.url} style={{ animationDelay: `${(i + 1) * 0.08}s` }}>
                <Link
                  href={category.url}
                  className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1.5 transition-all duration-300 hover:bg-slate-100/80 ${
                    isActive ? 'text-accent bg-accent-soft/40' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <i className={`${category.icon} text-xs`}></i>
                  <span>{category.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Hamburger Burger Menu button */}
        <div
          ref={burgerRef}
          onClick={toggleMenu}
          className="flex lg:hidden flex-col justify-between w-6 h-4 cursor-pointer z-50 group"
          role="button"
          aria-label="Toggle Menu"
          aria-expanded={isMenuActive}
        >
          <span
            className={`h-[2px] bg-slate-800 rounded-full transition-transform duration-300 origin-left ${
              isMenuActive ? 'rotate-45 translate-y-[2px] translate-x-[2px]' : ''
            }`}
          ></span>
          <span
            className={`h-[2px] bg-slate-800 rounded-full transition-opacity duration-300 ${
              isMenuActive ? 'opacity-0' : 'opacity-100'
            }`}
          ></span>
          <span
            className={`h-[2px] bg-slate-800 rounded-full transition-transform duration-300 origin-left ${
              isMenuActive ? '-rotate-45 -translate-y-[2px] translate-x-[2px]' : ''
            }`}
          ></span>
        </div>

        {/* Mobile Navigation Drawer */}
        <ul
          ref={menuRef}
          className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-100 px-6 py-24 flex flex-col space-y-6 z-40 transform transition-all duration-300 lg:hidden ${
            isMenuActive ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          {/* Mobile search */}
          <div className="mb-4" style={{ animationDelay: '0.1s' }}>
            <HeaderSearch idPrefix="mobileSearch" isMobile={true} />
          </div>

          <li className={isMenuActive ? 'animate-fade-in-up' : ''} style={isMenuActive ? { animationDelay: '0.15s' } : undefined}>
            <Link
              href="/"
              onClick={closeMenu}
              className={`block py-2 text-base font-semibold border-b border-slate-50 ${
                pathname === '/' ? 'text-accent' : 'text-slate-700'
              }`}
            >
              Home
            </Link>
          </li>
          {toolCategories.map((category, i) => {
            const isActive = pathname.startsWith(category.url);
            return (
              <li className={isMenuActive ? 'animate-fade-in-up' : ''} key={category.url} style={isMenuActive ? { animationDelay: `${0.15 + (i + 1) * 0.05}s` } : undefined}>
                <Link
                  href={category.url}
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 py-2 text-base font-semibold border-b border-slate-50 ${
                    isActive ? 'text-accent' : 'text-slate-700'
                  }`}
                >
                  <i className={`${category.icon} text-slate-400`}></i>
                  <span>{category.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
