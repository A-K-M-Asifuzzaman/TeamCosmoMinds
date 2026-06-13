import { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, BookOpen, Gamepad2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LocationModal from '../components/LocationModal';
import GlobeComponent from '../components/GlobeComponent';
import Navbar from './Navbar';
import { generateStarsData, locations } from '../constants/locationsData';

const STORY = [
  { speaker: 'kid',   text: "Wow… 🌍 Is that really our planet from space?!" },
  { speaker: 'astro', text: "It sure is! Every blue bit is ocean, every green is forest. Terra watches it all!" },
  { speaker: 'kid',   text: "Why are some parts getting hotter? Even my village feels different now…" },
  { speaker: 'astro', text: "That's climate change — NASA's Terra satellite tracked it for 25 years!" },
  { speaker: 'kid',   text: "Can we fix it? I want to plant trees and help! 🌱" },
  { speaker: 'astro', text: "Yes! Tap any glowing dot on the globe to explore countries together!" },
];

const TITLE_TEXT = "Terra · Earth Explorer";

// ── Animated nebula canvas — beating any video background ──
const NebulaCanvas = memo(function NebulaCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;

    const orbs = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 90 + Math.random() * 220,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.22,
      hue: [200, 250, 175, 290, 195][i % 5],
      sat: 70 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0, id;
    const draw = () => {
      t += 0.0025;
      ctx.clearRect(0, 0, W, H);
      for (const o of orbs) {
        o.x = (o.x + o.vx + W) % W;
        o.y = (o.y + o.vy + H) % H;
        const alpha = 0.035 + 0.02 * Math.sin(t + o.phase);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},${o.sat}%,60%,${alpha})`);
        g.addColorStop(0.5, `hsla(${o.hue + 20},${o.sat}%,50%,${alpha * 0.5})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.283); ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
    addEventListener('resize', resize);
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
});

// ── Pure canvas starfield ──
const CanvasStarfield = memo(function CanvasStarfield() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;
    const stars = Array.from({ length: 260 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0, id;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.x = (s.x + s.vx + W) % W;
        s.y = (s.y + s.vy + H) % H;
        const a = 0.18 + 0.2 * Math.sin(t + s.ph);
        ctx.fillStyle = `rgba(200,225,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
    addEventListener('resize', resize);
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.7 }} />;
});

// ── Shooting stars ──
const ShootingStars = memo(function ShootingStars() {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    const fire = () => {
      const id = Date.now();
      setStars(s => [...s.slice(-4), { id, top: `${Math.random() * 40}%`, left: `${Math.random() * 65}%` }]);
      setTimeout(() => setStars(s => s.filter(x => x.id !== id)), 1100);
    };
    const t = setInterval(fire, 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <div key={s.id} style={{ top: s.top, left: s.left, transform: 'rotate(-45deg)' }}
          className="absolute w-px h-28 bg-gradient-to-b from-white/90 to-transparent animate-shootStar" />
      ))}
    </div>
  );
});

// ── Mouse-following glow orb ──
const MouseGlow = memo(function MouseGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        x: e.clientX - innerWidth / 2,
        y: e.clientY - innerHeight / 2,
        duration: 1.4, ease: 'power2.out',
      });
    };
    addEventListener('mousemove', move);
    return () => removeEventListener('mousemove', move);
  }, []);
  return (
    <div ref={ref} className="fixed pointer-events-none z-0"
      style={{
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(50,150,255,0.07) 0%, rgba(80,200,200,0.04) 40%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'mouseGlow 3s ease-in-out infinite',
      }}
    />
  );
});

// ── Floating decorative planets ──
const FloatingPlanets = memo(function FloatingPlanets() {
  return (
    <div className="fixed inset-0 z-1 pointer-events-none overflow-hidden select-none">
      {/* Saturn-like ringed planet — top right */}
      <div className="absolute animate-float hidden sm:block" style={{ top: '10%', right: '6%', animationDuration: '7s', animationDelay: '0s' }}>
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <ellipse cx="29" cy="29" rx="14" ry="14" fill="rgba(255,185,90,0.28)" stroke="rgba(255,210,120,0.45)" strokeWidth="1"/>
          <ellipse cx="29" cy="29" rx="24" ry="8" fill="none" stroke="rgba(255,200,100,0.28)" strokeWidth="2" transform="rotate(-22,29,29)"/>
          <circle cx="22" cy="23" r="3" fill="rgba(255,230,160,0.18)"/>
        </svg>
      </div>

      {/* Small glowing moon — left mid */}
      <div className="absolute rounded-full animate-float hidden sm:block"
        style={{
          bottom: '38%', left: '4%', width: 22, height: 22,
          background: 'radial-gradient(circle at 35% 35%, rgba(200,220,255,0.38), rgba(150,180,240,0.18))',
          border: '1px solid rgba(200,220,255,0.35)',
          boxShadow: '0 0 14px rgba(150,180,255,0.3)',
          animationDuration: '5.5s', animationDelay: '1.2s',
        }} />

      {/* Mars-like red planet — right lower */}
      <div className="absolute rounded-full animate-float hidden md:block"
        style={{
          top: '62%', right: '4%', width: 34, height: 34,
          background: 'radial-gradient(circle at 32% 32%, rgba(255,120,70,0.38), rgba(180,50,30,0.22))',
          border: '1px solid rgba(255,120,70,0.25)',
          boxShadow: '0 0 18px rgba(255,80,40,0.2)',
          animationDuration: '8.5s', animationDelay: '2.5s',
        }} />

      {/* Tiny ice planet — top left */}
      <div className="absolute rounded-full animate-float hidden lg:block"
        style={{
          top: '22%', left: '7%', width: 18, height: 18,
          background: 'radial-gradient(circle at 40% 35%, rgba(150,230,255,0.45), rgba(80,170,220,0.25))',
          border: '1px solid rgba(150,230,255,0.3)',
          boxShadow: '0 0 12px rgba(100,200,255,0.3)',
          animationDuration: '6s', animationDelay: '0.5s',
        }} />

      {/* Aurora bands — bottom of screen */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none hidden sm:block"
        style={{ background: 'linear-gradient(to top, rgba(0,180,120,0.04), transparent)', animation: 'auroraWave 6s ease-in-out infinite' }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none hidden sm:block"
        style={{ background: 'linear-gradient(to top, rgba(50,100,200,0.05), transparent)', animation: 'auroraWave 8s ease-in-out infinite 2s' }} />
    </div>
  );
});

// ── Kid Character ──
const KidCharacter = memo(function KidCharacter() {
  return (
    <svg viewBox="0 0 100 170" fill="none" style={{ filter: 'drop-shadow(0 0 20px rgba(100,200,255,0.5))' }}>
      <style>{`
        .kb{animation:kidBob 2.8s ease-in-out infinite}
        .kll{transform-origin:42px 125px;animation:legSwing .65s ease-in-out infinite}
        .klr{transform-origin:58px 125px;animation:legSwing .65s ease-in-out infinite reverse}
        .kal{transform-origin:28px 90px;animation:armSwing .65s ease-in-out infinite}
        .kar{transform-origin:72px 90px;animation:armSwing .65s ease-in-out infinite reverse}
        .kf1{transform-origin:39px 118px;animation:flamePulse .38s ease-in-out infinite}
        .kf2{transform-origin:61px 118px;animation:flamePulse .38s ease-in-out infinite .12s}
        .ke{animation:blink 4.5s ease-in-out infinite}
      `}</style>
      <g className="kb">
        <rect x="34" y="80" width="27" height="35" rx="5" fill="#1e2d40" stroke="#2a4060" strokeWidth="1"/>
        <rect x="27" y="84" width="9" height="22" rx="3" fill="#243045" stroke="#2a4060" strokeWidth=".8"/>
        <rect x="64" y="84" width="9" height="22" rx="3" fill="#243045" stroke="#2a4060" strokeWidth=".8"/>
        <ellipse cx="31.5" cy="108" rx="5" ry="3" fill="#4af" className="kf1"/>
        <ellipse cx="68.5" cy="108" rx="5" ry="3" fill="#4af" className="kf2"/>
        <rect x="28" y="79" width="44" height="44" rx="9" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1.5"/>
        <rect x="36" y="87" width="28" height="19" rx="3" fill="#a0c4e8" stroke="#6090c0" strokeWidth=".8"/>
        <circle cx="44" cy="97" r="2.8" fill="#4af"/>
        <circle cx="56" cy="97" r="2.8" fill="#f84"/>
        <circle cx="82" cy="93" r="10" fill="#1a6bcc"/>
        <path d="M74 89 Q78 86 84 88 Q89 86 93 91 Q89 96 83 94 Q78 96 73 92Z" fill="#2a8b3a" opacity=".85"/>
        <circle cx="82" cy="93" r="10" fill="none" stroke="rgba(100,200,255,.5)" strokeWidth=".8">
          <animate attributeName="stroke-opacity" values=".5;.1;.5" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="50" cy="42" r="28" fill="rgba(200,230,255,.1)" stroke="#88b4d4" strokeWidth="2"/>
        <ellipse cx="50" cy="42" rx="23" ry="21" fill="rgba(12,50,140,.3)" stroke="rgba(80,160,255,.6)" strokeWidth="1.5"/>
        <circle cx="50" cy="42" r="16.5" fill="#ffd0a0"/>
        <g className="ke">
          <ellipse cx="43" cy="38" rx="3.8" ry="3.2" fill="#2a1500"/>
          <ellipse cx="57" cy="38" rx="3.8" ry="3.2" fill="#2a1500"/>
          <circle cx="44.5" cy="36.5" r="1.3" fill="white"/>
          <circle cx="58.5" cy="36.5" r="1.3" fill="white"/>
        </g>
        <path d="M43 47 Q50 54 57 47" stroke="#c06020" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <ellipse cx="40" cy="44" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <ellipse cx="60" cy="44" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <ellipse cx="39" cy="30" rx="7" ry="4" fill="white" opacity=".12" transform="rotate(-18,39,30)"/>
        <line x1="50" y1="15" x2="50" y2="7" stroke="#88b4d4" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="50" cy="5.5" r="3.5" fill="#4af">
          <animate attributeName="r" values="3.5;5;3.5" dur="1.1s" repeatCount="indefinite"/>
          <animate attributeName="fill" values="#4af;white;#4af" dur="1.1s" repeatCount="indefinite"/>
        </circle>
      </g>
      <g className="kal"><rect x="9" y="83" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="10" cy="96" rx="6.5" ry="5.5" fill="#9ab8d0"/></g>
      <g className="kar"><rect x="72" y="83" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="90" cy="96" rx="6.5" ry="5.5" fill="#9ab8d0"/></g>
      <g className="kll"><rect x="34" y="121" width="13" height="24" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="31" y="139" width="18" height="8" rx="3" fill="#9ab8d0"/></g>
      <g className="klr"><rect x="53" y="121" width="13" height="24" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="51" y="139" width="18" height="8" rx="3" fill="#9ab8d0"/></g>
    </svg>
  );
});

// ── Astronaut Character ──
const AstroCharacter = memo(function AstroCharacter() {
  return (
    <svg viewBox="0 0 110 185" fill="none" style={{ filter: 'drop-shadow(0 0 26px rgba(80,220,200,0.55))' }}>
      <style>{`
        .ab{animation:astroBob 3.4s ease-in-out infinite}
        .af1{transform-origin:25px 138px;animation:flamePulse .35s ease-in-out infinite}
        .af2{transform-origin:85px 138px;animation:flamePulse .35s ease-in-out infinite .1s}
        .ao{transform-origin:55px 50px;animation:orbitRing 9s linear infinite}
        .ae{animation:blink 5s ease-in-out infinite 1.2s}
      `}</style>
      <g className="ab">
        <rect x="32" y="96" width="46" height="52" rx="7" fill="#1a2d40" stroke="#2a4060" strokeWidth="1.2"/>
        <rect x="17" y="101" width="16" height="35" rx="4" fill="#1e3550" stroke="#2a4565" strokeWidth="1"/>
        <rect x="77" y="101" width="16" height="35" rx="4" fill="#1e3550" stroke="#2a4565" strokeWidth="1"/>
        <ellipse cx="25" cy="138" rx="7" ry="4" fill="#2fd" className="af1"/>
        <ellipse cx="85" cy="138" rx="7" ry="4" fill="#2fd" className="af2"/>
        <rect x="25" y="94" width="60" height="57" rx="11" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.5"/>
        <rect x="25" y="111" width="60" height="7" fill="#c00" opacity=".7"/>
        <text x="55" y="117" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="monospace" fontWeight="bold">NASA</text>
        <rect x="35" y="121" width="40" height="23" rx="4" fill="#070f20" stroke="#2a4566" strokeWidth=".8"/>
        <rect x="38" y="124" width="9" height="6" rx="1" fill="#4af" opacity=".9"/>
        <rect x="50" y="124" width="9" height="6" rx="1" fill="#2fd" opacity=".9"/>
        <rect x="62" y="124" width="7" height="6" rx="1" fill="#f84" opacity=".9"/>
        <rect x="38" y="133" width="30" height="2" rx="1" fill="#4af" opacity=".3"/>
        <rect x="38" y="137" width="20" height="2" rx="1" fill="#4af" opacity=".18"/>
        <rect x="8" y="97" width="20" height="13" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2" transform="rotate(26,18,103)"/>
        <rect x="82" y="97" width="20" height="13" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2" transform="rotate(-26,92,103)"/>
        <ellipse cx="10" cy="116" rx="9.5" ry="7" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <ellipse cx="100" cy="116" rx="9.5" ry="7" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <path d="M96 109 Q101 105 105 109 Q107 114 101 117" stroke="#80aacc" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        <rect x="35" y="146" width="15" height="28" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2"/>
        <rect x="60" y="146" width="15" height="28" rx="6" fill="#daeeff" stroke="#88bbdd" strokeWidth="1.2"/>
        <rect x="31" y="167" width="22" height="11" rx="4" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <rect x="57" y="167" width="22" height="11" rx="4" fill="#b0ccdd" stroke="#80aacc" strokeWidth="1"/>
        <circle cx="55" cy="50" r="34" fill="rgba(180,220,255,.1)" stroke="#88bbdd" strokeWidth="2.5"/>
        <circle cx="55" cy="50" r="30" fill="rgba(4,14,45,.45)" stroke="rgba(80,180,255,.5)" strokeWidth="1.5"/>
        <ellipse cx="55" cy="50" rx="25" ry="23" fill="rgba(20,80,160,.28)" stroke="rgba(80,160,255,.7)" strokeWidth="1.5"/>
        <circle cx="55" cy="50" r="20" fill="#e8c090"/>
        <g className="ae">
          <ellipse cx="47" cy="45" rx="4.5" ry="3.5" fill="#1a1f40"/>
          <ellipse cx="63" cy="45" rx="4.5" ry="3.5" fill="#1a1f40"/>
          <circle cx="48.5" cy="43.5" r="1.8" fill="white"/>
          <circle cx="64.5" cy="43.5" r="1.8" fill="white"/>
        </g>
        <path d="M46 57 Q55 65 64 57" stroke="#c06820" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <ellipse cx="42" cy="36" rx="10" ry="6" fill="white" opacity=".1" transform="rotate(-20,42,36)"/>
        <line x1="55" y1="18" x2="55" y2="9" stroke="#88bbdd" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="55" cy="7" r="4.5" fill="#2fd">
          <animate attributeName="r" values="4.5;6.5;4.5" dur="1.3s" repeatCount="indefinite"/>
          <animate attributeName="fill" values="#2fd;white;#2fd" dur="1.3s" repeatCount="indefinite"/>
        </circle>
        <ellipse cx="55" cy="50" rx="40" ry="13" fill="none" stroke="rgba(100,200,255,.18)" strokeWidth="1" strokeDasharray="5 4" className="ao"/>
      </g>
    </svg>
  );
});

// ── Speech bubble ──
const SpeechBubble = memo(function SpeechBubble({ text, speaker, side }) {
  return (
    <motion.div key={text}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className={`absolute bottom-full mb-3 pointer-events-none z-20 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ maxWidth: 'min(240px,36vw)' }}>
      <div className={`relative px-4 py-3 rounded-2xl text-[11px] sm:text-[13px] leading-relaxed font-semibold backdrop-blur-2xl shadow-2xl
        ${speaker === 'kid'
          ? 'bg-gradient-to-br from-amber-950/95 to-yellow-900/85 border border-yellow-500/22 text-yellow-50'
          : 'bg-gradient-to-br from-blue-950/95 to-teal-900/85 border border-teal-500/22 text-teal-50'}`}>
        <div className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${speaker === 'kid' ? 'text-yellow-300' : 'text-teal-300'}`}>
          {speaker === 'kid' ? '⭐ Astro-Kid' : '🚀 Commander'}
        </div>
        {text}
        <div className={`absolute -bottom-2 w-3 h-3 rotate-45 ${side === 'left' ? 'left-5' : 'right-5'}
          ${speaker === 'kid' ? 'bg-amber-950/95 border-b border-r border-yellow-500/22' : 'bg-blue-950/95 border-b border-r border-teal-500/22'}`} />
      </div>
    </motion.div>
  );
});

// ── HERO ──────────────────────────────────────────────────────────────
export default function Hero() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [starsData, setStarsData] = useState([]);
  const [ready, setReady] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [storyIdx, setStoryIdx] = useState(0);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  const titleRef = useRef(null);
  const kidWrapRef = useRef(null);
  const astroWrapRef = useRef(null);

  const isMobile = dimensions.width < 768;
  const isSmall = dimensions.width < 480;

  const showToast = useCallback(msg => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const handleClick = useCallback(loc => {
    setSelectedLoc(loc); setModalOpen(true); showToast(`📍 ${loc.name}`);
  }, [showToast]);

  const handleClose = useCallback(() => {
    setModalOpen(false); setTimeout(() => setSelectedLoc(null), 300);
  }, []);

  const randomLoc = useCallback(() => {
    handleClick(locations[Math.floor(Math.random() * locations.length)]);
  }, [handleClick]);

  useEffect(() => {
    const id = setInterval(() => setStoryIdx(i => (i + 1) % STORY.length), 5200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let t;
    const h = () => { clearTimeout(t); t = setTimeout(() => setDimensions({ width: innerWidth, height: innerHeight }), 100); };
    h(); addEventListener('resize', h); return () => { removeEventListener('resize', h); clearTimeout(t); };
  }, []);

  useEffect(() => {
    setStarsData(generateStarsData(isMobile ? 600 : 1600));
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, [isMobile]);

  // ── God-level GSAP entrance + continuous effects ──
  useGSAP(() => {
    if (!ready) return;

    const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'power3.out' } });

    // Letter-by-letter title explosion
    tl.from('.title-char', {
      y: -90, opacity: 0, rotation: gsap.utils.wrap([-35, 35]),
      scale: 0.15, filter: 'blur(8px)',
      stagger: { amount: 0.65, from: 'center' },
      duration: 0.75, ease: 'back.out(3)',
    })
    // Subtitle fade-up with blur clear
    .from('.hero-subtitle', {
      y: 22, opacity: 0, filter: 'blur(6px)',
      duration: 0.6, ease: 'power2.out',
    }, '-=0.35')
    // Story dots from center
    .from('.story-dot', {
      scale: 0, opacity: 0, rotation: 180,
      stagger: { amount: 0.4, from: 'center' },
      duration: 0.35, ease: 'back.out(4)',
    }, '-=0.4')
    // Kid — elastic swoop from left
    .from(kidWrapRef.current, {
      x: -220, opacity: 0, rotation: -28, scale: 0.5,
      duration: 1.1, ease: 'elastic.out(1, 0.42)',
    }, '-=0.4')
    // Astronaut — elastic swoop from right
    .from(astroWrapRef.current, {
      x: 220, opacity: 0, rotation: 28, scale: 0.5,
      duration: 1.1, ease: 'elastic.out(1, 0.42)',
    }, '-=1.05')
    // CTA buttons pop up
    .from('.hero-cta-btn', {
      y: 70, opacity: 0, scale: 0.35,
      stagger: 0.12, duration: 0.65, ease: 'back.out(2.8)',
    }, '-=0.6')
    .from('.hero-mobile-cta', {
      scale: 0, opacity: 0,
      stagger: 0.09, duration: 0.45, ease: 'back.out(2.2)',
    }, '-=0.5')
    // Hint bar
    .from('.hero-hint', {
      y: 20, opacity: 0, duration: 0.4,
    }, '-=0.3');

    // ── Continuous effects ──

    // Main CTA breathes
    gsap.to('.hero-main-cta', {
      boxShadow: '0 0 50px rgba(50,200,150,0.7)',
      scale: 1.06, duration: 1.0,
      repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.8,
    });

    // Title chars shimmer one by one repeatedly
    gsap.to('.title-char', {
      filter: 'brightness(1.8)',
      stagger: { amount: 1.5, repeat: -1 },
      duration: 0.3, yoyo: true, ease: 'power1.inOut',
      delay: 2.5,
    });

    // Kid character "wave" every 6s
    gsap.to(kidWrapRef.current, {
      rotation: 5, duration: 0.5, ease: 'power2.inOut',
      repeat: -1, repeatDelay: 5.5, yoyo: true, delay: 4,
    });

    // Astronaut "nod" every 7s
    gsap.to(astroWrapRef.current, {
      rotation: -6, scale: 1.04, duration: 0.6, ease: 'power2.inOut',
      repeat: -1, repeatDelay: 6.4, yoyo: true, delay: 5,
    });

  }, { dependencies: [ready] });

  if (!ready || dimensions.width === 0) return (
    <div className="fixed inset-0 bg-[#020614] flex flex-col items-center justify-center gap-5">
      <div className="relative w-20 h-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-400" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-4 border-teal-500/20 border-b-teal-400" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-liftOff">🚀</div>
      </div>
      <motion.p animate={{ opacity: [.4, 1, .4] }} transition={{ duration: 1.8, repeat: Infinity }}
        className="text-blue-300 text-xs tracking-widest uppercase font-semibold">Loading the Universe…</motion.p>
    </div>
  );

  const line = STORY[storyIdx];

  return (
    <>
      <Navbar />

      {/* Layered backgrounds — nebula > starfield > gradients */}
      <NebulaCanvas />
      <CanvasStarfield />
      <MouseGlow />
      <ShootingStars />
      <FloatingPlanets />

      {/* Deep space directional gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_-5%,rgba(25,55,155,.38),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_88%_90%,rgba(0,65,90,.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_8%_78%,rgba(60,10,115,.15),transparent_60%)]" />
      </div>

      {/* Globe */}
      <section className="fixed inset-0 z-10 flex items-center justify-center">
        <GlobeComponent
          dimensions={dimensions}
          starsData={starsData}
          onLocationClick={handleClick}
          orbitalPeriodMs={isMobile ? 16000 : 13000}
          orbitInclinationDeg={35}
          orbitAltitudeRatio={isMobile ? 2.8 : 2.5}
        />
      </section>

      {/* Title — letter-by-letter GSAP targets */}
      <div ref={titleRef}
        className="fixed top-[68px] sm:top-[74px] left-1/2 -translate-x-1/2 z-20 text-center px-4 pointer-events-none w-full max-w-xl">
        <h1 className="text-lg sm:text-[1.85rem] md:text-4xl font-black tracking-tight leading-tight">
          {TITLE_TEXT.split('').map((ch, i) => (
            <span key={i} className="title-char gradient-text-animated"
              style={{ display: 'inline-block', animationDelay: `${i * 0.08}s` }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h1>
        <p className="hero-subtitle mt-1 text-white/42 text-[10px] sm:text-sm tracking-wide">
          25 years of NASA Terra satellite data, explored through storytelling
        </p>
      </div>

      {/* Story progress dots */}
      <div className="fixed z-20 flex gap-2 pointer-events-none"
        style={{ top: isMobile ? 134 : 148, left: '50%', transform: 'translateX(-50%)' }}>
        {STORY.map((_, i) => (
          <motion.div key={i}
            animate={{ width: i === storyIdx ? 22 : 8, opacity: i === storyIdx ? 1 : .25 }}
            transition={{ duration: .3 }}
            className={`story-dot h-1.5 rounded-full ${i === storyIdx ? 'bg-teal-400 shadow-[0_0_8px_#2fd]' : 'bg-white/30'}`} />
        ))}
      </div>

      {/* Characters + CTAs — mobile responsive layout */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-end justify-between
                      px-2 xs:px-3 sm:px-8 md:px-10
                      pb-2 sm:pb-4 pointer-events-none">

        {/* Kid */}
        <div className="relative flex flex-col items-start">
          <AnimatePresence mode="wait">
            {line.speaker === 'kid' && !isSmall && (
              <SpeechBubble key={`k${storyIdx}`} text={line.text} speaker="kid" side="left" />
            )}
          </AnimatePresence>
          <div ref={kidWrapRef}
            className="w-[72px] xs:w-[82px] sm:w-[105px] md:w-[115px]
                       h-[100px] xs:h-[114px] sm:h-[148px] md:h-[158px]
                       animate-kidBob">
            <KidCharacter />
          </div>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex flex-col items-center gap-2 pb-4 pointer-events-auto">
          <motion.button onClick={randomLoc}
            whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(50,180,255,.6)' }}
            whileTap={{ scale: .92 }}
            className="hero-cta-btn hero-main-cta flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg">
            <Shuffle size={13} /> Random Country
          </motion.button>
          <Link to="/story">
            <motion.div
              whileHover={{ scale: 1.08, boxShadow: '0 0 22px rgba(80,230,180,.45)' }}
              whileTap={{ scale: .92 }}
              className="hero-cta-btn flex items-center gap-2 bg-teal-500/15 border border-teal-400/38 text-teal-200 text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer backdrop-blur-sm">
              <BookOpen size={13} /> Animated Stories
            </motion.div>
          </Link>
          <Link to="/space-game">
            <motion.div
              whileHover={{ scale: 1.08, boxShadow: '0 0 22px rgba(160,80,255,.45)' }}
              whileTap={{ scale: .92 }}
              className="hero-cta-btn flex items-center gap-2 bg-purple-500/15 border border-purple-400/38 text-purple-200 text-xs font-bold px-5 py-2.5 rounded-full cursor-pointer backdrop-blur-sm">
              <Gamepad2 size={13} /> Space Game
            </motion.div>
          </Link>
        </div>

        {/* Astronaut */}
        <div className="relative flex flex-col items-end">
          <AnimatePresence mode="wait">
            {line.speaker === 'astro' && !isSmall && (
              <SpeechBubble key={`a${storyIdx}`} text={line.text} speaker="astro" side="right" />
            )}
          </AnimatePresence>
          <div ref={astroWrapRef}
            className="w-[80px] xs:w-[90px] sm:w-[115px] md:w-[125px]
                       h-[110px] xs:h-[124px] sm:h-[158px] md:h-[170px]
                       animate-astroBob">
            <AstroCharacter />
          </div>
        </div>
      </div>

      {/* Mobile speech bubble — center below title on tiny screens */}
      {isSmall && (
        <AnimatePresence mode="wait">
          <motion.div key={storyIdx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed z-25 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ top: 158, width: 'min(88vw, 320px)' }}>
            <div className={`px-4 py-2.5 rounded-2xl text-[11px] font-semibold backdrop-blur-2xl shadow-xl border text-center
              ${line.speaker === 'kid' ? 'bg-amber-950/90 border-yellow-500/20 text-yellow-50' : 'bg-blue-950/90 border-teal-500/20 text-teal-50'}`}>
              <span className={`text-[8px] font-black uppercase tracking-widest mr-1.5 ${line.speaker === 'kid' ? 'text-yellow-300' : 'text-teal-300'}`}>
                {line.speaker === 'kid' ? '⭐' : '🚀'}
              </span>
              {line.text}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Hint bar — desktop */}
      <div className="hero-hint fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden sm:block">
        <div className="bg-black/30 backdrop-blur-md rounded-full px-5 py-2 border border-white/10">
          <span className="text-white/38 text-[11px] tracking-wide">🌍 Tap locations · Drag to rotate · Scroll to zoom</span>
        </div>
      </div>

      {/* Mobile CTAs — above characters */}
      <div className="fixed bottom-[108px] xs:bottom-[118px] left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:hidden pointer-events-auto">
        <motion.button onClick={randomLoc} whileTap={{ scale: .88 }}
          className="hero-mobile-cta flex items-center gap-1.5 bg-blue-600 text-white text-[11px] font-bold px-3 py-2 rounded-full shadow-lg">
          <Shuffle size={11} /> Random
        </motion.button>
        <Link to="/story">
          <motion.div whileTap={{ scale: .88 }}
            className="hero-mobile-cta flex items-center gap-1.5 bg-teal-600 text-white text-[11px] font-bold px-3 py-2 rounded-full cursor-pointer">
            <BookOpen size={11} /> Story
          </motion.div>
        </Link>
        <Link to="/space-game">
          <motion.div whileTap={{ scale: .88 }}
            className="hero-mobile-cta flex items-center gap-1.5 bg-purple-600 text-white text-[11px] font-bold px-3 py-2 rounded-full cursor-pointer">
            <Gamepad2 size={11} /> Game
          </motion.div>
        </Link>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: .82 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: .85 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-blue-900/92 border border-blue-400/28 text-blue-100 text-sm font-semibold px-5 py-2.5 rounded-full backdrop-blur-xl shadow-xl pointer-events-none">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <LocationModal location={selectedLoc} isOpen={modalOpen} onClose={handleClose} />
    </>
  );
}
