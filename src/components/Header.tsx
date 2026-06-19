
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import HeaderSearch from './HeaderSearch';
import { toolCategories } from '../data/toolCategories';

gsap.registerPlugin(useGSAP);

const Header: React.FC = () => {
  const [isMenuActive, setIsMenuActive] = useState(false);
  const pathname = usePathname();
  const navContainerRef = useRef<HTMLDivElement>(null);
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

  // GSAP animations for load and sticky state
  useGSAP(
    () => {
      // Entrance animation for header links
      gsap.fromTo('.nav-item', 
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );

      // Subtle logo float
      gsap.to('.logo-img', {
        y: -2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: navContainerRef }
  );

  // GSAP animation for mobile drawer opening
  useGSAP(
    () => {
      if (isMenuActive) {
        gsap.to(menuRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
        });
        gsap.fromTo(
          '.mobile-nav-item',
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power3.out', delay: 0.1 }
        );
      } else {
        gsap.to(menuRef.current, {
          x: '100%',
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in',
        });
      }
    },
    { dependencies: [isMenuActive] }
  );

  return (
    <header
      ref={navContainerRef}
      className="fixed top-0 left-0 right-0 h-20 glass-panel border-b border-slate-200/40 z-50 flex items-center navbar"
    >
      <nav className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0 group">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-36 h-10 logo-img">
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
          <li className="nav-item">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-slate-100/80 ${
                pathname === '/' ? 'text-accent bg-accent-soft/40' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Home
            </Link>
          </li>
          {toolCategories.map((category) => {
            const isActive = pathname.startsWith(category.url);
            return (
              <li className="nav-item" key={category.url}>
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
          className="fixed top-0 right-0 bottom-0 w-[280px] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-100 px-6 py-24 flex flex-col space-y-6 z-40 transform translate-x-full lg:hidden"
        >
          {/* Mobile search */}
          <div className="mb-4">
            <HeaderSearch idPrefix="mobileSearch" isMobile={true} />
          </div>

          <li className="mobile-nav-item">
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
          {toolCategories.map((category) => {
            const isActive = pathname.startsWith(category.url);
            return (
              <li className="mobile-nav-item" key={category.url}>
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
