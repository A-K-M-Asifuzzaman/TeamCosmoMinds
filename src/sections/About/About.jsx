import { useRef, useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Globe2, Rocket, Sparkles, Leaf, Users, Layers,
  ShieldCheck, ChevronDown, Bot, Gamepad2, BookOpen,
  Telescope, Star, Code2, Zap, Heart,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ── Animated counter on scroll ── */
function Counter({ to, suffix = '', prefix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const dur = 1400, start = performance.now();
      const anim = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    }, { threshold: .2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ── FAQ accordion ── */
function QA({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left px-5 py-4 gap-3">
        <span className="text-white font-semibold text-sm sm:text-base">{q}</span>
        <ChevronDown className={`text-white/40 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} size={18} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: .28 }}
            className="px-5 pb-4 text-white/60 text-sm leading-relaxed">{a}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Nebula canvas ── */
const NebulaBg = memo(function NebulaBg() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = Math.max(innerHeight, 5000);
    const orbs = Array.from({ length: 14 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 150 + Math.random() * 280,
      vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .1,
      hue: [210, 255, 175, 285][Math.floor(Math.random() * 4)],
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0, id;
    const draw = () => {
      t += .0015; ctx.clearRect(0, 0, W, H);
      for (const o of orbs) {
        o.x = (o.x + o.vx + W) % W; o.y = (o.y + o.vy + H) % H;
        const a = .022 + .01 * Math.sin(t + o.ph);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},65%,55%,${a})`); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.28); ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = c.width = innerWidth; };
    addEventListener('resize', resize);
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
});

/* ── Feature card ── */
function FeatureCard({ icon: Icon, title, desc, color, accentBg, idx }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 45, scale: .92 },
      {
        opacity: 1, y: 0, scale: 1, duration: .65, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', toggleActions: 'play none none none' },
        delay: idx * .09,
      }
    );
  }, []);
  return (
    <div ref={ref} className={`rounded-2xl border ${accentBg} p-5 sm:p-6 group hover:scale-[1.03] transition-transform duration-300`}
      style={{ boxShadow: 'none', transition: 'box-shadow .3s ease, transform .3s ease' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px ${color}28`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="text-white font-black text-base sm:text-lg mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── Team member card ── */
function TeamCard({ name, role, img, emoji, idx }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 35, scale: .88 },
      {
        opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: ref.current, start: 'top 90%', toggleActions: 'play none none none' },
        delay: idx * .08,
      }
    );
  }, []);
  return (
    <div ref={ref}
      className="group relative rounded-2xl border border-white/10 bg-white/4 p-5 hover:bg-white/8 transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_28px_rgba(100,160,255,.15)] overflow-hidden">
      <div className="absolute top-3 right-3 text-xl opacity-20 group-hover:opacity-60 transition-opacity">{emoji}</div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img src={img} alt={name}
            className="w-14 h-14 rounded-2xl object-cover border border-white/20"
            onError={e => { e.currentTarget.style.display = 'none'; }} />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-[8px] shadow-lg">
            ✦
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-white font-black text-sm truncate">{name}</div>
          <div className="text-white/50 text-xs mt-0.5 leading-snug">{role}</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500/0 via-teal-400/60 to-blue-500/0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}

/* ── MAIN ── */
export default function About() {
  const heroRef = useRef(null);

  useGSAP(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ delay: .2 });
    tl.from('.about-badge', { y: -24, opacity: 0, stagger: .12, duration: .5, ease: 'back.out(2)' })
      .from('.about-title-char', {
        y: -70, opacity: 0, rotation: gsap.utils.wrap([-28, 28]), scale: .15,
        stagger: .03, duration: .7, ease: 'back.out(3)',
      }, '-=.3')
      .from('.about-sub', { y: 22, opacity: 0, duration: .55, ease: 'power2.out' }, '-=.35')
      .from('.about-cta', { scale: 0, opacity: 0, stagger: .1, duration: .45, ease: 'back.out(2.5)' }, '-=.25')
      .from('.about-stat', { y: 28, opacity: 0, stagger: .12, duration: .5, ease: 'power2.out' }, '-=.2');
  }, []);

  const TEAM = [
    { name: 'ASIF ZAMAN',       role: 'AI/ML Engineer',       emoji: '🤖', img: 'https://i.ibb.co.com/DHmLW7K0/Whats-App-Image-2025-09-23-at-10-30-29.jpg' },
    { name: 'AFRIDI AKBAR IFTY',role: 'Full-Stack Developer', emoji: '💻', img: 'https://i.ibb.co.com/ynHZtbpw/Whats-App-Image-2025-09-23-at-10-30-29-1.jpg' },
    { name: 'ROBIUL HASAN',     role: 'Project Storyteller',  emoji: '📖', img: 'https://i.ibb.co.com/xkzbkTK/Whats-App-Image-2025-09-23-at-10-30-29-2.jpg' },
    { name: 'MEHRAB-AL-HASAN',  role: 'Video Editor',         emoji: '🎬', img: 'https://i.ibb.co.com/1GsMC4wL/Whats-App-Image-2025-09-23-at-10-32-05.jpg' },
    { name: 'ABRAR HOSSAIN',    role: 'UI/UX Designer',       emoji: '🎨', img: 'https://i.ibb.co.com/cKNNDfqL/Whats-App-Image-2025-09-23-at-10-30-00.jpg' },
    { name: 'KAZI TAHERA JANNAT',role: 'Lead Researcher',     emoji: '🔬', img: 'https://i.ibb.co.com/Wp57yvJK/Whats-App-Image-2025-09-23-at-10-30-28.jpg' },
  ];

  const FEATURES = [
    { icon: Globe2,    title: '3D Interactive Globe',    desc: 'Explore NASA Terra data on a fully interactive 3D Earth globe. Click glowing markers to explore real climate data by country.', color: '#4af', accentBg: 'border-blue-500/20 bg-blue-900/15', idx: 0 },
    { icon: BookOpen,  title: 'Cinematic Story Mode',    desc: 'Full-screen animated stories per country with typewriter dialogue, SVG characters, environment particles, and film-grain cinematics.', color: '#2fd', accentBg: 'border-teal-500/20 bg-teal-900/15', idx: 1 },
    { icon: Rocket,    title: 'NASA Live Data API',      desc: 'Real-time integration with NASA APOD and EPIC APIs — actual astronomy photos and real Earth images from the DSCOVR satellite daily.', color: '#f8a030', accentBg: 'border-orange-500/20 bg-orange-900/15', idx: 2 },
    { icon: Bot,       title: 'Terra AI Chatbot',        desc: 'AI-powered chatbot trained on NASA Terra instrument data — ask about ASTER, CERES, MISR, and MODIS in real time.', color: '#a78bfa', accentBg: 'border-purple-500/20 bg-purple-900/15', idx: 3 },
    { icon: Gamepad2,  title: 'Educational Space Game',  desc: 'Dodge asteroids and collect NASA data orbs — each orb teaches a real Earth science fact about the four Terra instruments.', color: '#f472b6', accentBg: 'border-pink-500/20 bg-pink-900/15', idx: 4 },
    { icon: Telescope, title: 'Terra Science Lab',       desc: 'Deep-dive into ASTER, CERES, MISR, MODIS instruments with animated data gauges, comparison tables, and 25-year mission timeline.', color: '#ffd43b', accentBg: 'border-yellow-500/20 bg-yellow-900/15', idx: 5 },
    { icon: Sparkles,  title: 'Animated Characters',     desc: 'Custom SVG astronaut kid and commander characters with bobbing, blinking, leg swing, arm swing, and jet-pack flame animations.', color: '#51cf66', accentBg: 'border-green-500/20 bg-green-900/15', idx: 6 },
    { icon: Zap,       title: 'GSAP-Powered Animations', desc: 'Professional-grade animation with letter-by-letter title reveals, elastic bounces, stagger sequences, scroll triggers, and cinematic particle systems.', color: '#ff6b6b', accentBg: 'border-red-500/20 bg-red-900/15', idx: 7 },
  ];

  const TECH_STACK = [
    { name: 'React 18',       emoji: '⚛️',  color: '#61dafb' },
    { name: 'GSAP 3',         emoji: '🎬',  color: '#88ce02' },
    { name: 'Framer Motion',  emoji: '✨',  color: '#a855f7' },
    { name: 'Vite',           emoji: '⚡',  color: '#646cff' },
    { name: 'Tailwind CSS',   emoji: '🎨',  color: '#06b6d4' },
    { name: 'React Globe GL', emoji: '🌍',  color: '#4af' },
    { name: 'NASA APIs',      emoji: '🛸',  color: '#f8a030' },
    { name: 'Canvas API',     emoji: '🖼️',  color: '#ff6b6b' },
    { name: 'React Router',   emoji: '🗺️',  color: '#f44250' },
    { name: 'EmailJS',        emoji: '📧',  color: '#f59e0b' },
    { name: 'Three.js',       emoji: '🔷',  color: '#51cf66' },
    { name: 'React Query',    emoji: '🔄',  color: '#ff4757' },
  ];

  const FAQS = [
    { q: 'What is NASA Terra?', a: 'Terra is NASA\'s flagship Earth observation satellite, launched in December 1999. It carries four science instruments — ASTER, CERES, MISR, and MODIS — that have continuously monitored Earth\'s climate, forests, oceans, and atmosphere for 25 years.' },
    { q: 'What data powers the globe?', a: 'The globe is powered by real Terra-era climate data converted into interactive location markers. Each country dot links to real satellite-derived observations about temperature, vegetation, and environmental change.' },
    { q: 'How does the AI chatbot work?', a: 'The Terra AI guide connects to a backend powered by a language model trained on NASA Terra instrument documentation. It can answer questions about ASTER surface imaging, CERES energy balance, MISR aerosol mapping, and MODIS vegetation monitoring.' },
    { q: 'Who is CosmoMinds for?', a: 'CosmoMinds is designed for children aged 7–14, but our interactive data tools, science lab, and NASA API integrations make it valuable for students, teachers, researchers, and anyone curious about Earth\'s changing climate.' },
    { q: 'Is this project open source?', a: 'Yes! CosmoMinds is built for NASA Space Apps Challenge 2025. The full source code is available on GitHub. We welcome contributions — star and fork us!' },
    { q: 'How accurate is the climate data?', a: 'All climate facts and statistics are sourced directly from NASA Terra scientific publications, MODIS land cover products, ASTER thermal data reports, and CERES energy budget analyses.' },
  ];

  return (
    <div className="relative min-h-screen w-full">
      <NebulaBg />

      {/* Gradient header overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(20,50,140,.35),transparent_65%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#020614] to-transparent" />
      </div>

      <main className="relative z-10">

        {/* ── HERO ── */}
        <section ref={heroRef} className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[['🏆 NASA Space Apps 2025', 'bg-teal-400/90 text-black'],
              ['🌍 Terra — 25 Years', 'bg-blue-400/90 text-black'],
              ['🚀 Global Challenge', 'bg-purple-400/90 text-black']].map(([label, cls]) => (
              <span key={label} className={`about-badge text-[11px] font-black px-3 py-1.5 rounded-full ${cls}`}>{label}</span>
            ))}
          </div>

          {/* Title — letter by letter */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4">
            {'About CosmoMinds'.split('').map((ch, i) => (
              <span key={i} className="about-title-char gradient-text-animated inline-block" style={{ animationDelay: `${i * .08}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>

          <p className="about-sub text-white/65 text-base sm:text-lg max-w-3xl leading-relaxed mb-8">
            We turn 25 years of NASA Terra satellite data into playful, cinematic stories and interactive experiences — designed to spark climate curiosity and action in every child on Earth.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link to="/">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                className="about-cta inline-flex items-center gap-2 rounded-full bg-white text-black font-black px-6 py-3 cursor-pointer hover:bg-white/90">
                <Rocket size={15} /> Try Terra Explorer
              </motion.div>
            </Link>
            <Link to="/terra-lab">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                className="about-cta inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 text-white font-bold px-6 py-3 cursor-pointer hover:bg-white/10">
                <Telescope size={15} /> Terra Lab
              </motion.div>
            </Link>
            <a href="https://github.com/asif4762/TeamCosmoMinds" target="_blank" rel="noreferrer">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                className="about-cta inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 text-white/70 font-bold px-6 py-3 cursor-pointer hover:bg-white/10 hover:text-white">
                ⭐ GitHub
              </motion.div>
            </a>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: 10, suffix: '+', label: 'Country stories', icon: '📖' },
              { to: 25, suffix: ' yrs', label: 'Terra mission data', icon: '🛸' },
              { to: 4,  suffix: '', label: 'NASA instruments', icon: '🔬' },
              { to: 6,  suffix: '', label: 'Team members', icon: '👥' },
            ].map((s, i) => (
              <div key={i} className="about-stat glass rounded-2xl p-4 sm:p-5 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl sm:text-3xl font-black text-white">
                  <Counter to={s.to} suffix={s.suffix} />
                </div>
                <p className="text-white/40 text-[11px] font-semibold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-teal-400 to-blue-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white">What We Built</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} idx={i} />)}
          </div>
        </section>

        {/* ── TECH STACK ── */}
        <section className="bg-black/20 border-y border-white/8 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-400 to-blue-400" />
              <h2 className="text-2xl sm:text-3xl font-black text-white">Tech Stack</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {TECH_STACK.map((t, i) => (
                <motion.div key={t.name}
                  initial={{ opacity: 0, scale: .8 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * .05 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="flex items-center gap-2 bg-white/6 border border-white/12 rounded-full px-4 py-2 hover:border-white/25 transition-all cursor-default"
                  style={{ borderColor: `${t.color}30` }}>
                  <span>{t.emoji}</span>
                  <span className="text-sm font-bold" style={{ color: t.color }}>{t.name}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 size={16} className="text-teal-300" />
                  <span className="text-white font-bold text-sm">Architecture</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  React 18 SPA with Vite, lazy-loaded page chunks, canvas-based particle systems, GSAP ScrollTrigger for scroll-driven animations, and NASA API fetching with graceful fallbacks.
                </p>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={16} className="text-blue-300" />
                  <span className="text-white font-bold text-sm">Design Principles</span>
                </div>
                <ul className="text-white/60 text-sm space-y-1.5">
                  <li>• Kid-friendly language, scientifically accurate</li>
                  <li>• Hopeful narratives: problem → action → hope</li>
                  <li>• Full mobile responsiveness (xs: 480px breakpoint)</li>
                  <li>• Accessibility: keyboard navigation, ARIA labels</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHALLENGE INFO ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-yellow-400 to-orange-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white">The Challenge</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-3xl p-6 sm:p-8">
              <div className="text-4xl mb-4">🛸</div>
              <h3 className="text-white font-black text-xl mb-3">NASA Space Apps 2025</h3>
              <p className="text-white/65 text-sm leading-relaxed mb-4">
                CosmoMinds was built for the <strong className="text-white">NASA International Space Apps Challenge 2025</strong> — the world's largest global hackathon. Our challenge: <em className="text-teal-300">"Celebrating 25 Years of Terra"</em>.
              </p>
              <p className="text-white/65 text-sm leading-relaxed">
                We had to create an engaging, educational experience that brings NASA's Terra satellite mission to life — making 25 years of Earth science data accessible, meaningful, and memorable for children worldwide.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: '🌍', title: 'Real NASA Data', desc: 'ASTER surface temperature, MODIS vegetation, CERES energy budget, MISR aerosol data — 25 years of Earth science' },
                { icon: '👦', title: 'Child-First Design', desc: 'Every interaction designed for ages 7–14 — simple language, fun characters, encouraging feedback' },
                { icon: '🏆', title: 'Global Impact', desc: '10+ country stories, NASA Live API integration, AI guide, space game — one complete platform' },
                { icon: '💡', title: 'Open & Accessible', desc: 'Open source, mobile-first, keyboard accessible, available to every child with a browser' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 25 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * .1 }}
                  className="flex items-start gap-4 bg-white/4 rounded-2xl border border-white/10 p-4 hover:bg-white/8 transition-colors">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <div className="text-white font-bold text-sm">{item.title}</div>
                    <div className="text-white/55 text-xs mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section id="team" className="bg-black/20 border-t border-white/8 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-pink-400 to-purple-400" />
              <h2 className="text-2xl sm:text-3xl font-black text-white">The Team</h2>
            </div>
            <p className="text-white/45 text-sm mb-8 ml-5">Team CosmoMinds — 6 builders from Bangladesh 🇧🇩</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEAM.map((m, i) => <TeamCard key={m.name} {...m} idx={i} />)}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-teal-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(f => <QA key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>

        {/* ── CTA FOOTER ── */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-24 text-center">
          <div className="glass rounded-3xl p-8 sm:p-12 border border-white/12">
            <div className="text-5xl mb-5">🚀</div>
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Ready to explore?</h3>
            <p className="text-white/50 text-sm sm:text-base mb-8 max-w-md mx-auto">
              Dive into the 3D globe, read animated country stories, or test your Earth science knowledge
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/">
                <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-black px-7 py-3.5 rounded-full cursor-pointer shadow-xl hover:shadow-[0_0_35px_rgba(50,200,180,.45)]">
                  🌍 Open Globe
                </motion.div>
              </Link>
              <Link to="/story">
                <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-white/8 border border-white/18 text-white font-bold px-7 py-3.5 rounded-full cursor-pointer hover:bg-white/15 transition-all">
                  <BookOpen size={15} /> Read Stories
                </motion.div>
              </Link>
              <Link to="/discover">
                <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-orange-500/15 border border-orange-400/25 text-orange-200 font-bold px-7 py-3.5 rounded-full cursor-pointer hover:bg-orange-500/25 transition-all">
                  🛸 NASA Live
                </motion.div>
              </Link>
            </div>
            <p className="mt-6 text-white/25 text-xs flex items-center justify-center gap-1.5">
              Made with <Heart size={10} className="text-red-400" /> by Team CosmoMinds · NASA Space Apps 2025
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
