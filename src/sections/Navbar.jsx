import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Menu, X, Bot, Users, Home, BookOpen, Gamepad2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const NAV = [
  { name: 'Home',       href: '/',           icon: Home },
  { name: 'Story',      href: '/story',       icon: BookOpen },
  { name: 'Space Game', href: '/space-game',  icon: Gamepad2 },
  { name: 'ChatBot',    href: '/chatbot',     icon: Bot },
  { name: 'About',      href: '/about',       icon: Users },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const ref = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // GSAP: stagger entrance for all nav elements
  useGSAP(() => {
    if (!navRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });
    tl.from('.nav-logo', { x: -40, opacity: 0, duration: 0.65 })
      .from('.nav-item', { y: -22, opacity: 0, stagger: 0.07, duration: 0.45 }, '-=0.35')
      .from('.nav-github', { x: 40, opacity: 0, duration: 0.55 }, '-=0.45')
      .from('.nav-mobile-btn', { scale: 0, opacity: 0, duration: 0.4, ease: 'back.out(3)' }, '-=0.5');
  }, { scope: navRef });

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50">
      <div className={`transition-all duration-400 ${scrolled
        ? 'bg-[#020614]/92 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,100,255,0.1)]'
        : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 relative">

            {/* Logo */}
            <Link to="/" className="nav-logo flex items-center gap-2 z-10">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.55 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center shadow-[0_0_14px_rgba(50,180,255,0.5)]">
                <Rocket size={14} className="text-white" />
              </motion.div>
              <span className="font-extrabold tracking-tight text-lg text-white hidden sm:block">
                COSMO<span className="bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent">Minds</span>
              </span>
            </Link>

            {/* Desktop pill nav */}
            <nav className="hidden lg:block absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-0.5 bg-white/8 backdrop-blur-md border border-white/15 rounded-full px-2 py-1.5">
                {NAV.map(item => {
                  const active = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} to={item.href} className="nav-item">
                      <motion.div
                        className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? 'text-white' : 'text-white/55 hover:text-white/90'}`}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      >
                        {active && (
                          <motion.div layoutId="navActive"
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/70 to-teal-500/70 rounded-full shadow-[0_0_12px_rgba(50,180,255,0.35)]"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                        )}
                        <Icon size={12} className="relative z-10" />
                        <span className="relative z-10">{item.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* GitHub */}
            <motion.a href="https://github.com/asif4762/TeamCosmoMinds" target="_blank" rel="noreferrer"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="nav-github hidden lg:flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 border border-white/20 px-4 py-2 rounded-full hover:bg-white/15 transition-colors z-10">
              ⭐ GitHub
            </motion.a>

            {/* Mobile toggle */}
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(v => !v)}
              className="nav-mobile-btn lg:hidden text-white p-2 rounded-lg hover:bg-white/10 z-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={open ? 'x' : 'm'}
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.14 }}>
                  {open ? <X size={22} /> : <Menu size={22} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div ref={ref}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden mx-3 mt-1 bg-[#050d28]/96 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,100,0.4)] overflow-hidden">
            <div className="p-4 space-y-1">
              {NAV.map((item, i) => {
                const active = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <motion.div key={item.href} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.045 }}>
                    <Link to={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${active ? 'bg-gradient-to-r from-blue-500/30 to-teal-500/20 text-white border border-blue-400/25' : 'text-white/65 hover:text-white hover:bg-white/8'}`}>
                      <Icon size={15} /> {item.name}
                      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2fd]" />}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="pt-2 border-t border-white/10">
                <a href="https://github.com/asif4762/TeamCosmoMinds" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/45 hover:text-white px-4 py-2 transition-colors">
                  ⭐ GitHub
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
