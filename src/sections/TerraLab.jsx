import { useRef, useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import Navbar from './Navbar';

/* ── Terra Instruments data ── */
const INSTRUMENTS = [
  {
    id: 'ASTER',
    emoji: '🌡️',
    color: '#ff6b6b',
    glow: 'rgba(255,107,107,.4)',
    bg: 'from-red-900/40 to-orange-900/30',
    border: 'border-red-500/30',
    full: 'Advanced Spaceborne Thermal\nEmission & Reflection Radiometer',
    desc: 'Creates ultra-detailed temperature and surface maps of Earth. Detects volcanic heat, glacier melt, and city heat islands from 705 km altitude.',
    bands: 14,
    resolution: '15–90 m',
    facts: [
      'Detects surface temperature within 1°C accuracy',
      'Monitors 140+ active volcanoes continuously',
      'Maps every glacier retreat since 2000',
      'Reveals urban heat islands 10°C hotter than forests',
      'Built by Japanese Space Agency (JAXA)',
    ],
    gauge: { label: 'Thermal precision', pct: 92 },
    stat: { value: '140+', label: 'Volcanoes monitored' },
  },
  {
    id: 'CERES',
    emoji: '☀️',
    color: '#ffd43b',
    glow: 'rgba(255,212,59,.38)',
    bg: 'from-yellow-900/40 to-amber-900/30',
    border: 'border-yellow-500/30',
    full: 'Clouds and the Earth\'s\nRadiant Energy System',
    desc: 'Measures how much solar energy Earth absorbs and emits back to space. The critical sensor for understanding and proving climate change.',
    bands: 3,
    resolution: '20 km',
    facts: [
      'Tracks Earth\'s 340 W/m² solar input balance',
      'Detects energy imbalances as small as 0.1 W/m²',
      'Proved Earth retains more heat than it emits',
      'Monitors global cloud coverage 24/7',
      'Has run without interruption since 2000',
    ],
    gauge: { label: 'Energy balance accuracy', pct: 97 },
    stat: { value: '340 W/m²', label: 'Solar energy tracked' },
  },
  {
    id: 'MISR',
    emoji: '📸',
    color: '#74c0fc',
    glow: 'rgba(116,192,252,.38)',
    bg: 'from-blue-900/40 to-sky-900/30',
    border: 'border-blue-500/30',
    full: 'Multi-angle Imaging\nSpectroRadiometer',
    desc: 'Nine cameras capture Earth from nine different angles simultaneously — forward, nadir, and backward. Builds 3D maps of pollution and smoke.',
    bands: 36,
    resolution: '275 m – 1.1 km',
    facts: [
      'Nine cameras at angles: 70.5°, 60°, 45.6°, 26.1°, 0° (repeat both sides)',
      'Measures aerosol particles in full 3D space',
      'Tracks wildfire smoke paths across continents',
      'Monitors ocean surface roughness from space',
      'Detects smog concentration above cities globally',
    ],
    gauge: { label: 'Aerosol 3D accuracy', pct: 88 },
    stat: { value: '9 cams', label: 'Simultaneous views' },
  },
  {
    id: 'MODIS',
    emoji: '🌿',
    color: '#51cf66',
    glow: 'rgba(81,207,102,.38)',
    bg: 'from-green-900/40 to-teal-900/30',
    border: 'border-green-500/30',
    full: 'Moderate Resolution Imaging\nSpectroradiometer',
    desc: 'Terra\'s most prolific instrument — scans the entire Earth every 1–2 days across 36 spectral bands. Monitors forests, fires, oceans, and snow globally.',
    bands: 36,
    resolution: '250 m – 1 km',
    facts: [
      'Scans the entire Earth surface every 1–2 days',
      'Detected 2.3M km² of forest lost in 20 years',
      'Monitors every significant wildfire on Earth in real time',
      'Tracks phytoplankton blooms in all oceans',
      'Provides daily snow and ice cover maps globally',
    ],
    gauge: { label: 'Earth coverage frequency', pct: 100 },
    stat: { value: '2.3M km²', label: 'Forest loss detected' },
  },
];

/* ── Mission Timeline ── */
const TIMELINE = [
  { year: '1999', icon: '🚀', event: 'Terra Launch', desc: 'Launched Dec 18, 1999 from Vandenberg AFB on an Atlas IIAS rocket. All instruments activated successfully.' },
  { year: '2000', icon: '🌍', event: 'First Full Data', desc: 'MODIS delivers first complete global imagery. Scientists see Earth\'s entire surface for the first time daily.' },
  { year: '2002', icon: '🌳', event: 'Amazon Deforestation Alert', desc: 'MODIS detects unprecedented Amazon deforestation rates. Data triggers global conservation response.' },
  { year: '2003', icon: '🔥', event: 'California Wildfires', desc: 'ASTER and MODIS track 14 simultaneous wildfires across southern California in real time — reshaping disaster response.' },
  { year: '2010', icon: '🌊', event: 'Gulf Oil Spill', desc: 'Terra monitors the Deepwater Horizon disaster — tracking oil spread across the Gulf of Mexico daily.' },
  { year: '2013', icon: '❄️', event: 'Arctic Record Low', desc: 'MODIS documents record-low Arctic sea ice. MISR confirms aerosol changes over melting ice fields.' },
  { year: '2019', icon: '🌋', event: '140 Volcanoes', desc: 'ASTER surpasses monitoring 140 active volcanoes. Provides early warning of eruption risks in remote areas.' },
  { year: '2024', icon: '⭐', event: '25 Years & Counting', desc: 'Terra celebrates 25 continuous years of Earth observation — still active, still discovering.' },
];

/* ── Gauge component ── */
function Gauge({ pct, color }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      setTimeout(() => setW(pct), 200);
    }, { threshold: .3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct]);
  return (
    <div ref={ref} className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        animate={{ width: `${w}%` }}
        transition={{ duration: 1.2, ease: [.22,1,.36,1] }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

/* ── Instrument Card ── */
function InstrumentCard({ inst, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const cardRef = useRef(null);
  useGSAP(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: .94 },
      {
        opacity: 1, y: 0, scale: 1, duration: .65, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: cardRef.current, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  }, []);

  return (
    <div ref={cardRef} className={`rounded-2xl sm:rounded-3xl border ${inst.border} bg-gradient-to-br ${inst.bg} backdrop-blur-sm overflow-hidden`}
      style={{ boxShadow: open ? `0 0 40px ${inst.glow}` : 'none', transition: 'box-shadow .4s ease' }}>

      {/* Header — always visible */}
      <button className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
        onClick={() => setOpen(v => !v)}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 border"
          style={{ background: `${inst.color}22`, borderColor: `${inst.color}44`, boxShadow: `0 0 18px ${inst.glow}` }}>
          {inst.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-black text-white">{inst.id}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: `${inst.color}22`, color: inst.color }}>
              {inst.bands} bands
            </span>
            <span className="text-[10px] text-white/35 font-semibold">{inst.resolution}</span>
          </div>
          <p className="text-white/50 text-xs sm:text-sm mt-0.5 whitespace-pre-line leading-snug">{inst.full}</p>
        </div>
        <ChevronDown size={20} className={`text-white/40 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: .35, ease: [.22,1,.36,1] }}
            className="overflow-hidden">
            <div className="px-5 sm:px-6 pb-6 border-t border-white/8 pt-4 space-y-5">

              {/* Description */}
              <p className="text-white/70 text-sm sm:text-base leading-relaxed">{inst.desc}</p>

              {/* Gauge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-wide">{inst.gauge.label}</span>
                  <span className="text-sm font-black" style={{ color: inst.color }}>{inst.gauge.pct}%</span>
                </div>
                <Gauge pct={inst.gauge.pct} color={inst.color} />
              </div>

              {/* Key stat */}
              <div className="inline-flex items-center gap-3 rounded-xl px-4 py-3 border"
                style={{ background: `${inst.color}12`, borderColor: `${inst.color}30` }}>
                <span className="text-2xl font-black" style={{ color: inst.color }}>{inst.stat.value}</span>
                <span className="text-white/55 text-sm">{inst.stat.label}</span>
              </div>

              {/* Facts list */}
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-white/35 mb-3">Key discoveries</p>
                <ul className="space-y-2">
                  {inst.facts.map((f, i) => (
                    <motion.li key={i}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * .07 }}
                      className="flex items-start gap-2.5 text-sm text-white/70">
                      <span style={{ color: inst.color }} className="mt-0.5 text-xs flex-shrink-0">▶</span>
                      {f}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ target, suffix = '', prefix = '' }) {
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
        setVal(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(anim);
      };
      requestAnimationFrame(anim);
    }, { threshold: .2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ── Timeline Item ── */
function TimelineItem({ item, idx }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, x: idx % 2 === 0 ? -50 : 50 },
      {
        opacity: 1, x: 0, duration: .6, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', toggleActions: 'play none none none' },
        delay: .1,
      }
    );
  }, []);
  return (
    <div ref={ref} className={`flex gap-4 sm:gap-6 ${idx % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
      {/* Year badge */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-xl shadow-[0_0_18px_rgba(50,180,255,.45)]">
          {item.icon}
        </div>
        <div className="w-0.5 flex-1 bg-gradient-to-b from-blue-500/50 to-transparent" />
      </div>
      {/* Card */}
      <div className="flex-1 pb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/8 hover:border-white/20 transition-all hover:shadow-[0_0_24px_rgba(50,150,255,.15)]">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-blue-400 font-black text-sm">{item.year}</span>
            <span className="bg-white/8 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">{item.event}</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Nebula background ── */
const NebulaBg = memo(function NebulaBg() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;
    const orbs = Array.from({ length: 10 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 100 + Math.random() * 180,
      vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .16,
      hue: [210, 160, 280, 190][Math.floor(Math.random() * 4)],
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0, id;
    const draw = () => {
      t += .002; ctx.clearRect(0, 0, W, H);
      for (const o of orbs) {
        o.x = (o.x + o.vx + W) % W; o.y = (o.y + o.vy + H) % H;
        const a = .025 + .012 * Math.sin(t + o.ph);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},65%,55%,${a})`); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.28); ctx.fill();
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

/* ── MAIN ── */
export default function TerraLab() {
  const heroRef = useRef(null);
  const [activeTab, setActiveTab] = useState('instruments');

  useGSAP(() => {
    if (!heroRef.current) return;
    const tl = gsap.timeline({ delay: .15 });
    tl.from('.lab-badge', { y: -25, opacity: 0, duration: .45, ease: 'back.out(2)' })
      .from('.lab-title-char', { y: -80, opacity: 0, rotation: gsap.utils.wrap([-30, 30]), scale: .15, stagger: .03, duration: .7, ease: 'back.out(3)' }, '-=.25')
      .from('.lab-sub', { y: 20, opacity: 0, duration: .5 }, '-=.35')
      .from('.lab-tab', { scale: 0, opacity: 0, stagger: .09, duration: .4, ease: 'back.out(2.5)' }, '-=.25')
      .from('.lab-stat-num', { y: 30, opacity: 0, stagger: .1, duration: .5, ease: 'power2.out' }, '-=.2');
  }, []);

  const QUICK_STATS = [
    { n: 25, s: 'yrs', l: 'Operational', icon: '🛸' },
    { n: 4, s: '', l: 'Instruments', icon: '🔬' },
    { n: 89, s: 'TB', l: 'Data Collected', icon: '💾' },
    { n: 140, s: '+', l: 'Volcanoes Tracked', icon: '🌋' },
  ];

  return (
    <div className="min-h-screen bg-[#020614] text-white">
      <NebulaBg />
      <Navbar />

      <div className="relative z-10">

        {/* Hero */}
        <section ref={heroRef} className="pt-28 pb-10 px-4 text-center max-w-5xl mx-auto">
          <div className="lab-badge inline-flex items-center gap-2 bg-teal-500/12 border border-teal-400/25 text-teal-300 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            🔬 Terra Science Lab
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4">
            {'Terra Lab'.split('').map((ch, i) => (
              <span key={i} className="lab-title-char gradient-text-animated inline-block" style={{ animationDelay: `${i * .1}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>
          <p className="lab-sub text-white/50 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            25 years of NASA Terra's four science instruments — ASTER, CERES, MISR, and MODIS — revealed through interactive data and stories.
          </p>

          {/* Quick stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-10">
            {QUICK_STATS.map((s, i) => (
              <div key={i} className="lab-stat-num glass rounded-2xl p-3 sm:p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  <Counter target={s.n} suffix={s.s} />{s.s ? '' : ''}
                </div>
                <p className="text-white/40 text-[11px] font-semibold">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[['instruments', '🔬 Instruments'], ['timeline', '📅 Timeline'], ['compare', '📊 Compare']].map(([k, l]) => (
              <motion.button key={k} onClick={() => setActiveTab(k)}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                className={`lab-tab px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === k
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white/8 border border-white/15 text-white/65 hover:bg-white/14'}`}>
                {l}
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── INSTRUMENTS TAB ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'instruments' && (
            <motion.section key="instruments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 pb-16 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-teal-400 to-blue-400" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">Four Instruments, One Satellite</h2>
              </div>
              {INSTRUMENTS.map((inst, i) => (
                <InstrumentCard key={inst.id} inst={inst} defaultOpen={i === 0} />
              ))}
              <div className="pt-4 text-center">
                <a href="https://terra.nasa.gov/about/terra-instruments" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
                  <ExternalLink size={13} /> Full instrument details on terra.nasa.gov
                </a>
              </div>
            </motion.section>
          )}

          {/* ── TIMELINE TAB ── */}
          {activeTab === 'timeline' && (
            <motion.section key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 pb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-purple-400" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">25 Years of Discovery</h2>
              </div>
              <div className="space-y-0">
                {TIMELINE.map((item, idx) => (
                  <TimelineItem key={item.year} item={item} idx={idx} />
                ))}
              </div>
            </motion.section>
          )}

          {/* ── COMPARE TAB ── */}
          {activeTab === 'compare' && (
            <motion.section key="compare" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 pb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-green-400 to-teal-400" />
                <h2 className="text-2xl sm:text-3xl font-black text-white">Instrument Comparison</h2>
              </div>

              {/* Comparison table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-5 py-3.5 text-white/50 font-semibold text-xs uppercase tracking-wide">Instrument</th>
                      <th className="text-left px-5 py-3.5 text-white/50 font-semibold text-xs uppercase tracking-wide">Resolution</th>
                      <th className="text-left px-5 py-3.5 text-white/50 font-semibold text-xs uppercase tracking-wide">Spectral Bands</th>
                      <th className="text-left px-5 py-3.5 text-white/50 font-semibold text-xs uppercase tracking-wide">Primary Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTRUMENTS.map((inst, i) => (
                      <motion.tr key={inst.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * .1 }}
                        className="border-b border-white/6 hover:bg-white/4 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{inst.emoji}</span>
                            <div>
                              <div className="font-black text-white">{inst.id}</div>
                              <div className="text-[10px] text-white/35">NASA Terra</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold" style={{ color: inst.color }}>{inst.resolution}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: Math.min(inst.bands, 12) }).map((_, j) => (
                                <div key={j} className="w-1.5 h-5 rounded-sm" style={{ background: inst.color, opacity: .3 + (.7 * j / 12) }} />
                              ))}
                              {inst.bands > 12 && <span className="text-white/40 text-xs ml-1">+{inst.bands - 12}</span>}
                            </div>
                            <span className="text-white/60">{inst.bands}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-white/65 max-w-[200px]">
                          {['Surface temp & volcanoes', 'Earth\'s energy budget', 'Aerosols & pollution 3D', 'Global vegetation & fires'][i]}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Combined coverage visual */}
              <div className="mt-8 bg-white/4 rounded-2xl border border-white/10 p-6">
                <h3 className="text-white font-black text-lg mb-5">What Terra Measures Together</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Surface Temperature', val: 98, color: '#ff6b6b', from: 'ASTER' },
                    { label: 'Vegetation Health', val: 100, color: '#51cf66', from: 'MODIS' },
                    { label: 'Atmospheric Aerosols', val: 88, color: '#74c0fc', from: 'MISR' },
                    { label: 'Solar Energy Balance', val: 97, color: '#ffd43b', from: 'CERES' },
                    { label: 'Ocean Color & Temp', val: 94, color: '#51cf66', from: 'MODIS' },
                    { label: 'Cloud Properties', val: 96, color: '#ffd43b', from: 'CERES + MISR' },
                  ].map((row, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs font-semibold">{row.label}</span>
                        <span className="text-[10px] font-black" style={{ color: row.color }}>{row.from}</span>
                      </div>
                      <Gauge pct={row.val} color={row.color} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Explore Terra's World</h3>
            <p className="text-white/50 text-sm sm:text-base mb-7">
              Read animated stories by country, check live NASA data, or test your knowledge in the space game
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/story">
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold px-6 py-3 rounded-full cursor-pointer shadow-xl">
                  📖 Read Stories <ChevronRight size={14} />
                </motion.div>
              </Link>
              <Link to="/discover">
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 text-blue-200 font-bold px-6 py-3 rounded-full cursor-pointer hover:bg-blue-500/25 transition-all">
                  🛸 NASA Live <ChevronRight size={14} />
                </motion.div>
              </Link>
              <Link to="/space-game">
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-purple-500/15 border border-purple-400/25 text-purple-200 font-bold px-6 py-3 rounded-full cursor-pointer hover:bg-purple-500/25 transition-all">
                  🚀 Space Game
                </motion.div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
