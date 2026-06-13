import { useEffect, useState, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Telescope, Globe2, Flame, Leaf, Thermometer, Wind, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import Navbar from './Navbar';

const DEMO_KEY = 'DEMO_KEY';
const APOD_URL  = `https://api.nasa.gov/planetary/apod?api_key=${DEMO_KEY}`;
const EPIC_URL  = `https://api.nasa.gov/EPIC/api/natural/images?api_key=${DEMO_KEY}`;

const epicImgUrl = (img) => {
  const [y, m, d] = img.date.slice(0, 10).split('-');
  return `https://epic.gsfc.nasa.gov/archive/natural/${y}/${m}/${d}/png/${img.image}.png`;
};

/* ── NASA Terra climate facts — always shown even without API ── */
const TERRA_FACTS = [
  { icon: '🌡️', sensor: 'ASTER', value: '1.2°C', label: 'Warming detected by Terra since 1999' },
  { icon: '🌳', sensor: 'MODIS', value: '2.3M km²', label: 'Forest lost, tracked from space' },
  { icon: '❄️', sensor: 'MODIS', value: '−13%', label: 'Arctic sea ice lost per decade' },
  { icon: '☀️', sensor: 'CERES', value: '340 W/m²', label: 'Solar energy hitting Earth daily' },
  { icon: '🌋', sensor: 'ASTER', value: '140+', label: 'Active volcanoes monitored right now' },
  { icon: '💨', sensor: 'MISR',  value: '9 cameras', label: 'MISR captures aerosols in 3D' },
  { icon: '🌊', sensor: 'MODIS', value: '0.3°C', label: 'Ocean surface warming since 2000' },
  { icon: '🏙️', sensor: 'ASTER', value: '+10°C', label: 'City heat vs nearby forests' },
  { icon: '🛸', sensor: 'Terra', value: '25 yrs', label: 'Continuous Earth observation' },
  { icon: '📡', sensor: 'MODIS', value: 'Daily',  label: 'Full Earth scan frequency' },
];

const SENSOR_COLORS = { ASTER: '#ff6b6b', MODIS: '#51cf66', CERES: '#ffd43b', MISR: '#74c0fc', Terra: '#a78bfa' };

/* ── Scrolling ticker ── */
const FactTicker = memo(function FactTicker() {
  const trackRef = useRef(null);
  useGSAP(() => {
    if (!trackRef.current) return;
    const w = trackRef.current.scrollWidth / 2;
    gsap.to(trackRef.current, {
      x: -w, duration: 38, ease: 'none', repeat: -1,
    });
  }, []);
  const items = [...TERRA_FACTS, ...TERRA_FACTS];
  return (
    <div className="overflow-hidden py-2 bg-black/40 border-y border-white/8 backdrop-blur-sm">
      <div ref={trackRef} className="flex gap-8 whitespace-nowrap w-max">
        {items.map((f, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-[11px] font-bold">
            <span style={{ color: SENSOR_COLORS[f.sensor] || '#4af' }}>{f.sensor}</span>
            <span className="text-white/80">{f.icon} {f.value} — {f.label}</span>
            <span className="text-white/20">·</span>
          </span>
        ))}
      </div>
    </div>
  );
});

/* ── Animated nebula background ── */
const NebulaBg = memo(function NebulaBg() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;
    const orbs = Array.from({ length: 12 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 120 + Math.random() * 200,
      vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .18,
      hue: [210, 260, 180, 290][Math.floor(Math.random() * 4)],
      ph: Math.random() * Math.PI * 2,
    }));
    let t = 0, id;
    const draw = () => {
      t += .002; ctx.clearRect(0, 0, W, H);
      for (const o of orbs) {
        o.x = (o.x + o.vx + W) % W; o.y = (o.y + o.vy + H) % H;
        const a = .028 + .015 * Math.sin(t + o.ph);
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},70%,55%,${a})`); g.addColorStop(1, 'transparent');
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

/* ── APOD Section ── */
function ApodCard({ data, loading, error }) {
  const cardRef = useRef(null);
  useGSAP(() => {
    if (!data || !cardRef.current) return;
    const tl = gsap.timeline();
    tl.from('.apod-img-wrap', { scale: 1.1, opacity: 0, duration: 1.1, ease: 'power3.out' })
      .from('.apod-badge', { y: -25, opacity: 0, stagger: .12, duration: .5, ease: 'back.out(2)' }, '-=.7')
      .from('.apod-title', { y: 30, opacity: 0, duration: .6, ease: 'power2.out' }, '-=.5')
      .from('.apod-desc', { y: 20, opacity: 0, duration: .5, ease: 'power2.out' }, '-=.35')
      .from('.apod-action', { scale: 0, opacity: 0, stagger: .1, duration: .45, ease: 'back.out(2.5)' }, '-=.25');
  }, { dependencies: [data] });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        className="w-14 h-14 rounded-full border-4 border-blue-500/20 border-t-blue-400" />
      <p className="text-blue-300/60 text-sm tracking-wide">Fetching from NASA…</p>
    </div>
  );
  if (error) return (
    <div className="text-center py-16 text-white/40 text-sm">
      <div className="text-4xl mb-3">🛸</div>
      <p>Could not reach NASA API right now.</p>
      <p className="text-[11px] mt-1 text-white/25">{error}</p>
    </div>
  );
  if (!data) return null;

  return (
    <div ref={cardRef} className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
      {/* Image */}
      <div className="apod-img-wrap relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl
                      shadow-blue-900/40 border border-white/10 group">
        {data.media_type === 'video' ? (
          <div className="aspect-video bg-black/60 flex items-center justify-center rounded-2xl">
            <a href={data.url} target="_blank" rel="noreferrer"
              className="text-white/60 hover:text-white flex flex-col items-center gap-3 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-2xl">▶️</span>
              </div>
              <span className="text-sm font-semibold">Watch Video</span>
            </a>
          </div>
        ) : (
          <img src={data.hdurl || data.url} alt={data.title}
            className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
            style={{ maxHeight: 480 }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <span className="bg-black/60 backdrop-blur-md text-white/70 text-[10px] px-2.5 py-1 rounded-full border border-white/10">
            📅 {data.date}
          </span>
          {data.copyright && (
            <span className="bg-black/60 backdrop-blur-md text-white/50 text-[10px] px-2.5 py-1 rounded-full border border-white/10">
              © {data.copyright.replace('\n','').trim()}
            </span>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="apod-badge bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            🛸 NASA APOD
          </span>
          <span className="apod-badge bg-white/8 border border-white/12 text-white/55 text-[10px] font-bold px-3 py-1 rounded-full">
            Live API
          </span>
        </div>
        <h2 className="apod-title text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
          {data.title}
        </h2>
        <p className="apod-desc text-white/60 text-sm sm:text-base leading-relaxed line-clamp-5">
          {data.explanation}
        </p>
        <div className="flex gap-3 flex-wrap">
          <a href={data.hdurl || data.url} target="_blank" rel="noreferrer"
            className="apod-action inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-full hover:shadow-[0_0_24px_rgba(50,180,255,.5)] transition-all">
            <ExternalLink size={13} /> View Full Image
          </a>
          <Link to="/story"
            className="apod-action inline-flex items-center gap-2 bg-white/8 border border-white/15 text-white/80 text-sm font-bold px-5 py-2.5 rounded-full hover:bg-white/15 transition-all">
            Read Stories <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── EPIC Earth Photos ── */
function EpicGrid({ images, loading, error }) {
  const gridRef = useRef(null);
  useGSAP(() => {
    if (!images?.length || !gridRef.current) return;
    gsap.fromTo('.epic-card',
      { opacity: 0, y: 40, scale: .88 },
      { opacity: 1, y: 0, scale: 1, stagger: .1, duration: .65, ease: 'back.out(1.4)', delay: .2 }
    );
  }, { dependencies: [images] });

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/8 animate-pulse" />
      ))}
    </div>
  );
  if (error || !images?.length) return (
    <div className="text-center py-10 text-white/35 text-sm">
      <div className="text-4xl mb-2">🌍</div>
      <p>EPIC images temporarily unavailable</p>
      <p className="text-[11px] text-white/20 mt-1">{error}</p>
    </div>
  );

  return (
    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {images.slice(0, 6).map((img, i) => (
        <div key={i} className="epic-card relative rounded-2xl overflow-hidden aspect-square group cursor-pointer border border-white/10
                                hover:border-blue-400/40 transition-all hover:shadow-[0_0_30px_rgba(50,150,255,.25)]"
          onClick={() => window.open(epicImgUrl(img), '_blank')}>
          <img src={epicImgUrl(img)} alt="Earth from DSCOVR"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-[10px] font-bold">{img.date.slice(0, 10)}</p>
            <p className="text-white/60 text-[9px] line-clamp-1">{img.caption}</p>
          </div>
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5">
            <span className="text-[8px] text-teal-300 font-bold">EPIC</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Climate Stats Grid ── */
const STATS = [
  { icon: <Thermometer size={20}/>, value: '+1.2', unit: '°C', label: 'Global warming since 1999', color: 'from-red-500 to-orange-400', sensor: 'ASTER' },
  { icon: <Leaf size={20}/>, value: '2.3M', unit: 'km²', label: 'Forest lost in 20 years', color: 'from-green-500 to-teal-400', sensor: 'MODIS' },
  { icon: <Globe2 size={20}/>, value: '−13', unit: '%', label: 'Arctic ice lost per decade', color: 'from-blue-400 to-cyan-300', sensor: 'MODIS' },
  { icon: <Flame size={20}/>, value: '140+', unit: '', label: 'Volcanoes monitored daily', color: 'from-orange-500 to-yellow-400', sensor: 'ASTER' },
  { icon: <Wind size={20}/>, value: '9', unit: 'cams', label: 'MISR aerosol capture angles', color: 'from-purple-500 to-blue-400', sensor: 'MISR' },
  { icon: <Telescope size={20}/>, value: '25+', unit: 'yrs', label: 'Terra\'s Earth watch streak', color: 'from-teal-500 to-blue-500', sensor: 'Terra' },
];

function AnimatedStat({ stat, idx }) {
  const ref = useRef(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 30, scale: .85 },
      {
        opacity: 1, y: 0, scale: 1, duration: .55, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: ref.current, start: 'top 88%', toggleActions: 'play none none none' },
        delay: idx * .1,
      }
    );
  }, []);
  const [val, setVal] = useState(0);
  const numericValue = parseFloat(stat.value.replace(/[^0-9.-]/g, ''));
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      observer.disconnect();
      const dur = 1200, start = performance.now();
      const animate = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(+(numericValue * eased).toFixed(1));
        if (p < 1) requestAnimationFrame(animate);
        else setVal(numericValue);
      };
      requestAnimationFrame(animate);
    }, { threshold: .2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericValue]);

  return (
    <div ref={ref} className={`bg-gradient-to-br ${stat.color} p-px rounded-2xl group hover:scale-105 transition-transform duration-300`}>
      <div className="bg-[#060d20] rounded-2xl p-5 h-full flex flex-col gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20 flex items-center justify-center text-white`}>
          {stat.icon}
        </div>
        <div>
          <div className="text-3xl font-black text-white">
            {stat.value.includes('+') || stat.value.includes('−') || stat.value.startsWith('-') || isNaN(numericValue)
              ? stat.value
              : (stat.value.includes('M') ? `${val.toFixed(1)}M` :
                 stat.value.includes('+') ? `${Math.round(val)}+` :
                 stat.value)
            }
            {stat.unit && <span className="text-lg text-white/55 ml-1">{stat.unit}</span>}
          </div>
          <p className="text-white/55 text-sm mt-1 leading-snug">{stat.label}</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest mt-auto"
          style={{ color: SENSOR_COLORS[stat.sensor] }}>
          {stat.sensor}
        </span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function NasaDiscover() {
  const [apod, setApod] = useState(null);
  const [apodLoading, setApodLoading] = useState(true);
  const [apodError, setApodError] = useState(null);
  const [epic, setEpic] = useState(null);
  const [epicLoading, setEpicLoading] = useState(true);
  const [epicError, setEpicError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const headerRef = useRef(null);

  const fetchAll = async () => {
    setApodLoading(true); setEpicLoading(true);
    setApodError(null); setEpicError(null);
    try {
      const r = await fetch(APOD_URL);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setApod(await r.json());
    } catch (e) { setApodError(e.message); }
    finally { setApodLoading(false); }
    try {
      const r = await fetch(EPIC_URL);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const all = await r.json();
      setEpic(Array.isArray(all) ? all : []);
    } catch (e) { setEpicError(e.message); }
    finally { setEpicLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  useGSAP(() => {
    if (!headerRef.current) return;
    const tl = gsap.timeline({ delay: .15 });
    tl.from('.disco-label', { y: -20, opacity: 0, duration: .5, ease: 'back.out(2)' })
      .from('.disco-title span', { y: -60, opacity: 0, rotation: gsap.utils.wrap([-25, 25]), scale: .2, stagger: .03, duration: .65, ease: 'back.out(3)' }, '-=.3')
      .from('.disco-sub', { y: 20, opacity: 0, duration: .5, ease: 'power2.out' }, '-=.3')
      .from('.disco-cta', { scale: 0, opacity: 0, stagger: .1, duration: .45, ease: 'back.out(2.5)' }, '-=.2');
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-[#020614] text-white">
      <NebulaBg />
      <Navbar />

      <div className="relative z-10">
        {/* Hero header */}
        <section ref={headerRef} className="pt-28 pb-12 px-4 text-center max-w-4xl mx-auto">
          <div className="disco-label inline-flex items-center gap-2 bg-blue-500/12 border border-blue-400/25 text-blue-300 text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            🛸 Live NASA Data
          </div>
          <h1 className="disco-title text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4">
            {'NASA Discover'.split('').map((ch, i) => (
              <span key={i} className="gradient-text-animated inline-block" style={{ animationDelay: `${i * .09}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>
          <p className="disco-sub text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-7">
            Real imagery and data pulled live from NASA APIs — APOD, EPIC, and 25 years of Terra science.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <motion.button onClick={refresh} disabled={refreshing}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
              className="disco-cta flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold px-6 py-3 rounded-full shadow-xl hover:shadow-[0_0_30px_rgba(50,180,255,.45)] transition-all disabled:opacity-60">
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing…' : 'Refresh Data'}
            </motion.button>
            <Link to="/terra-lab">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                className="disco-cta flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-6 py-3 rounded-full hover:bg-white/14 transition-all cursor-pointer">
                🔬 Terra Lab <ArrowRight size={13} />
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Fact ticker */}
        <FactTicker />

        {/* APOD Section */}
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-teal-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white">Astronomy Picture of the Day</h2>
            <span className="bg-green-500/15 border border-green-400/30 text-green-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
              LIVE
            </span>
          </div>
          <ApodCard data={apod} loading={apodLoading} error={apodError} />
        </section>

        {/* Climate Stats */}
        <section className="bg-black/25 border-y border-white/8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-teal-400 to-green-400" />
              <h2 className="text-2xl sm:text-3xl font-black text-white">25 Years of Terra Data</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {STATS.map((s, i) => <AnimatedStat key={i} stat={s} idx={i} />)}
            </div>
          </div>
        </section>

        {/* EPIC Earth Section */}
        <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Earth From Space</h2>
                <p className="text-white/40 text-sm">Real photos by NASA EPIC camera aboard DSCOVR satellite</p>
              </div>
            </div>
            {epic?.length > 0 && (
              <span className="bg-green-500/12 border border-green-400/25 text-green-300 text-[10px] font-bold px-3 py-1.5 rounded-full">
                🟢 {epic.length} images available
              </span>
            )}
          </div>
          <EpicGrid images={epic} loading={epicLoading} error={epicError} />
          {epic?.length > 0 && !epicLoading && (
            <div className="mt-5 text-center">
              <p className="text-white/30 text-xs">
                📅 Latest batch: {epic[0]?.date?.slice(0, 10)} — Click any photo to view full resolution
              </p>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 pb-20 text-center">
          <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">Want to explore more?</h3>
            <p className="text-white/50 mb-7 text-sm sm:text-base">
              Dive into interactive stories, space games, and the Terra instrument lab
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/story">
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold px-6 py-3 rounded-full cursor-pointer shadow-xl">
                  📖 Animated Stories
                </motion.div>
              </Link>
              <Link to="/terra-lab">
                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
                  className="flex items-center gap-2 bg-white/8 border border-white/15 text-white font-bold px-6 py-3 rounded-full cursor-pointer hover:bg-white/14 transition-all">
                  🔬 Terra Lab
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
