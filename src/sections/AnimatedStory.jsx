import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Gamepad2, RotateCcw, Home } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Navbar from './Navbar';

/* ── Data loaders ── */
const LOADERS = {
  'Bangladesh':    ()=>import('../data/terraBookData_bgd'),
  'Kenya':         ()=>import('../data/terraBookData_ken'),
  'Japan':         ()=>import('../data/terraBookData_jpn'),
  'Argentina':     ()=>import('../data/terraBookData_arg'),
  'United States': ()=>import('../data/terraBookData_usa'),
  'Australia':     ()=>import('../data/terraBookData_aus'),
  'Brazil':        ()=>import('../data/terraBookData_bra'),
  'Canada':        ()=>import('../data/terraBookData_can'),
  'Chile':         ()=>import('../data/terraBookData_chl'),
  'United Kingdom':()=>import('../data/terraBookData_uk'),
};
const EMOJIS  ={'Bangladesh':'🇧🇩','Kenya':'🇰🇪','Japan':'🇯🇵','Argentina':'🇦🇷','United States':'🇺🇸','Australia':'🇦🇺','Brazil':'🇧🇷','Canada':'🇨🇦','Chile':'🇨🇱','United Kingdom':'🇬🇧'};

// Country-specific theme: gradient colors + particle type
const THEMES = {
  'Bangladesh':    { from:'#0a2d4a', to:'#0d4a2a', particle:'rain',     accent:'#4af' },
  'Kenya':         { from:'#3d1a00', to:'#5c2e0a', particle:'dust',     accent:'#f8a030' },
  'Japan':         { from:'#2d0a1a', to:'#4a1a2d', particle:'blossom',  accent:'#ffaacc' },
  'Argentina':     { from:'#0a1a3d', to:'#1a0a3d', particle:'snow',     accent:'#88aaff' },
  'United States': { from:'#0a1a3d', to:'#3d0a0a', particle:'stars',    accent:'#4af' },
  'Australia':     { from:'#3d1a00', to:'#4a0a0a', particle:'dust',     accent:'#f8a060' },
  'Brazil':        { from:'#0a3d0a', to:'#2d3d00', particle:'leaf',     accent:'#4af840' },
  'Canada':        { from:'#0a1a3d', to:'#0a2d1a', particle:'snow',     accent:'#88ddff' },
  'Chile':         { from:'#0a1a3d', to:'#1a0a3d', particle:'blossom',  accent:'#c084fc' },
  'United Kingdom':{ from:'#0a0f2d', to:'#0a1a2d', particle:'rain',     accent:'#60a5fa' },
};

/* ── Environment Particle Canvas — per-country atmosphere ── */
const EnvParticles = memo(function EnvParticles({ type, accent }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;

    const makeParticle = () => {
      if (type === 'rain') return {
        x: Math.random() * W, y: -20, len: 12 + Math.random() * 10,
        speed: 8 + Math.random() * 6, opacity: 0.1 + Math.random() * 0.18, drift: Math.random() * 0.5,
      };
      if (type === 'snow') return {
        x: Math.random() * W, y: -10, r: 1.5 + Math.random() * 3,
        speed: 0.8 + Math.random() * 1.2, drift: (Math.random() - 0.5) * 0.5,
        opacity: 0.2 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2,
      };
      if (type === 'blossom') return {
        x: Math.random() * W, y: -10, r: 3 + Math.random() * 4,
        speed: 0.6 + Math.random() * 0.8, drift: (Math.random() - 0.5) * 0.8,
        rotation: Math.random() * 6.28, rotSpeed: (Math.random() - 0.5) * 0.08,
        opacity: 0.25 + Math.random() * 0.45,
      };
      if (type === 'dust') return {
        x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.5,
        vx: 0.4 + Math.random() * 0.6, vy: (Math.random() - 0.5) * 0.2,
        opacity: 0.06 + Math.random() * 0.12, phase: Math.random() * Math.PI * 2,
      };
      if (type === 'leaf') return {
        x: Math.random() * W, y: -10, r: 3 + Math.random() * 5,
        speed: 0.7 + Math.random() * 0.9, drift: (Math.random() - 0.5) * 0.9,
        rotation: Math.random() * 6.28, rotSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 0.2 + Math.random() * 0.4, hue: 90 + Math.random() * 60,
      };
      // stars
      return {
        x: Math.random() * W, y: Math.random() * H, r: 0.8 + Math.random() * 1.6,
        opacity: 0.1 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2,
        speed: 0,
      };
    };

    const count = type === 'stars' ? 180 : type === 'dust' ? 120 : 65;
    let particles = Array.from({ length: count }, makeParticle);
    let t = 0, id;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (type === 'rain') {
          p.x += p.drift; p.y += p.speed;
          if (p.y > H + 20) particles[i] = makeParticle();
          ctx.strokeStyle = accent;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 2, p.y + p.len); ctx.stroke();
        } else if (type === 'snow') {
          p.x += p.drift + 0.4 * Math.sin(t + p.phase); p.y += p.speed;
          if (p.y > H + 20) particles[i] = makeParticle();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        } else if (type === 'blossom') {
          p.x += p.drift; p.y += p.speed; p.rotation += p.rotSpeed;
          if (p.y > H + 20) particles[i] = makeParticle();
          ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
          ctx.fillStyle = accent;
          for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.ellipse(p.r * 0.6, 0, p.r * 0.7, p.r * 0.4, 0, 0, 6.28);
            ctx.fill(); ctx.rotate(1.257);
          }
        } else if (type === 'dust') {
          p.x += p.vx; p.opacity = 0.06 + 0.05 * Math.sin(t * 0.5 + p.phase);
          if (p.x > W + 10) { p.x = -10; p.y = Math.random() * H; }
          ctx.fillStyle = accent;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        } else if (type === 'leaf') {
          p.x += p.drift + 0.3 * Math.sin(t * 0.8 + p.rotation); p.y += p.speed; p.rotation += p.rotSpeed;
          if (p.y > H + 20) particles[i] = makeParticle();
          ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
          ctx.fillStyle = `hsl(${p.hue},70%,45%)`;
          ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, 6.28); ctx.fill();
        } else {
          // stars — twinkle in place
          const a = p.opacity * (0.6 + 0.4 * Math.sin(t * 1.5 + p.phase));
          ctx.globalAlpha = a;
          ctx.fillStyle = '#c8e0ff';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill();
        }
        ctx.restore();
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
    addEventListener('resize', resize);
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize); };
  }, [type, accent]);

  return <canvas ref={ref} className="fixed inset-0 z-1 pointer-events-none" />;
});

/* ── Film Grain ── */
const FilmGrain = memo(function FilmGrain() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let W = c.width = innerWidth, H = c.height = innerHeight;
    let id;
    const draw = () => {
      const img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 25) | 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 8;
      }
      ctx.putImageData(img, 0, 0);
      id = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
    addEventListener('resize', resize);
    return () => { cancelAnimationFrame(id); removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-2 pointer-events-none" style={{ mixBlendMode: 'overlay' }} />;
});

/* ── Typewriter ── */
function Typewriter({ text, speed = 18, onDone }) {
  const [shown, setShown] = useState('');
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    setShown(''); setFinished(false);
    if (!text) { setFinished(true); onDone?.(); return; }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setFinished(true); onDone?.(); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span>{shown}{!finished && <span className="animate-pulse text-teal-400 ml-px">▋</span>}</span>;
}

/* ── Kid SVG ── */
const KidSVG = memo(function KidSVG({ mood = 'happy', talking = false }) {
  const mouth = mood === 'happy' ? 'M43 48 Q50 55 57 48' : mood === 'sad' ? 'M43 52 Q50 46 57 52' : 'M43 49 Q50 52 57 49';
  return (
    <svg viewBox="0 0 100 170" fill="none" style={{ filter: 'drop-shadow(0 8px 24px rgba(100,200,255,0.55))' }}>
      <style>{`
        .ks-body{animation:kidBob 2.5s ease-in-out infinite}
        .ks-fl1{transform-origin:39px 118px;animation:flamePulse 0.38s ease-in-out infinite}
        .ks-fl2{transform-origin:61px 118px;animation:flamePulse 0.38s ease-in-out infinite 0.12s}
        .ks-arm1{transform-origin:28px 90px;animation:armSwing 0.7s ease-in-out infinite}
        .ks-arm2{transform-origin:72px 90px;animation:armSwing 0.7s ease-in-out infinite reverse}
        .ks-leg1{transform-origin:42px 125px;animation:legSwing 0.7s ease-in-out infinite}
        .ks-leg2{transform-origin:58px 125px;animation:legSwing 0.7s ease-in-out infinite reverse}
        .ks-eye{animation:blink 4s ease-in-out infinite}
        .ks-talk1{animation:talkDot 0.55s ease-in-out infinite}
        .ks-talk2{animation:talkDot 0.55s ease-in-out infinite 0.18s}
        .ks-talk3{animation:talkDot 0.55s ease-in-out infinite 0.36s}
      `}</style>
      <g className="ks-body">
        <rect x="33" y="80" width="28" height="36" rx="5" fill="#2a3545" stroke="#3a5060" strokeWidth="1"/>
        <ellipse cx="39" cy="118" rx="5" ry="3" fill="#4af" className="ks-fl1"/>
        <ellipse cx="61" cy="118" rx="5" ry="3" fill="#4af" className="ks-fl2"/>
        <rect x="28" y="80" width="44" height="44" rx="9" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1.5"/>
        <rect x="36" y="88" width="28" height="18" rx="3" fill="#a0c4e8"/>
        <circle cx="44" cy="97" r="2.5" fill="#4af"/><circle cx="56" cy="97" r="2.5" fill="#f84"/>
        <circle cx="50" cy="43" r="27" fill="rgba(200,230,255,.1)" stroke="#88b4d4" strokeWidth="2"/>
        <ellipse cx="50" cy="43" rx="22" ry="20" fill="rgba(15,60,150,.27)" stroke="rgba(80,160,255,.6)" strokeWidth="1.5"/>
        <circle cx="50" cy="43" r="16" fill="#ffd0a0"/>
        <g className="ks-eye">
          <ellipse cx="43" cy="39" rx="3.5" ry="2.8" fill="#2a1500"/>
          <ellipse cx="57" cy="39" rx="3.5" ry="2.8" fill="#2a1500"/>
          <circle cx="44.3" cy="37.8" r="1.2" fill="white"/>
          <circle cx="58.3" cy="37.8" r="1.2" fill="white"/>
        </g>
        <path d={mouth} stroke="#c06020" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <ellipse cx="40" cy="45" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <ellipse cx="60" cy="45" rx="3" ry="2" fill="#ffaaaa" opacity=".5"/>
        <line x1="50" y1="17" x2="50" y2="9" stroke="#88b4d4" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="50" cy="7" r="3.2" fill="#4af">
          <animate attributeName="r" values="3.2;4.8;3.2" dur="1.1s" repeatCount="indefinite"/>
          <animate attributeName="fill" values="#4af;white;#4af" dur="1.1s" repeatCount="indefinite"/>
        </circle>
        {talking && <>
          <circle cx="68" cy="22" r="2.5" fill="white" opacity=".7" className="ks-talk1"/>
          <circle cx="75" cy="16" r="3" fill="white" opacity=".6" className="ks-talk2"/>
          <circle cx="83" cy="11" r="3.5" fill="white" opacity=".5" className="ks-talk3"/>
        </>}
      </g>
      <g className="ks-arm1"><rect x="10" y="84" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="11" cy="97" rx="6" ry="5" fill="#9ab8d0"/></g>
      <g className="ks-arm2"><rect x="71" y="84" width="19" height="10" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><ellipse cx="89" cy="97" rx="6" ry="5" fill="#9ab8d0"/></g>
      <g className="ks-leg1"><rect x="35" y="122" width="12" height="23" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="32" y="140" width="17" height="8" rx="3" fill="#9ab8d0"/></g>
      <g className="ks-leg2"><rect x="53" y="122" width="12" height="23" rx="5" fill="#c8dff0" stroke="#88b4d4" strokeWidth="1"/><rect x="51" y="140" width="17" height="8" rx="3" fill="#9ab8d0"/></g>
    </svg>
  );
});

/* ── Quiz ── */
function buildQuiz(country, pages) {
  const pool = [
    {q:`Which country did we just explore in this story?`, opts:[country,'Australia','Brazil','Japan'], correct:0},
    {q:`What does NASA's Terra satellite help us study?`, opts:['Weather forecasts for cities','Earth\'s environment, forests, and climate','Space stations','Ocean fish'], correct:1},
    {q:`Which NASA sensor measures surface temperature?`, opts:['MODIS','CERES','MISR','ASTER'], correct:3},
    {q:`What does MODIS monitor from space?`, opts:['City traffic','Forests, fires, and vegetation','Cloud rainfall','Moon craters'], correct:1},
    {q:`Why do cities feel hotter than forests?`, opts:['Cities are higher up','Concrete traps heat (urban heat island)','Factories make extra heat','Clouds avoid cities'], correct:1},
    {q:`What is climate change?`, opts:['Seasons changing yearly','Long-term shifts caused by greenhouse gases','Daily weather','Rain becoming snow'], correct:1},
    {q:`How do trees help our planet?`, opts:['They produce electricity','They absorb CO₂ and cool Earth','They make cars run better','Only give us fruit'], correct:1},
    {q:`Name of NASA's Earth-observing satellite explored here?`, opts:['Apollo','Voyager','Terra','Hubble'], correct:2},
  ];
  return pool.slice(0, 5);
}

function QuizPage({ country, pages, onRestart }) {
  const questions = useMemo(() => buildQuiz(country, pages), [country]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const optionsRef = useRef(null);
  const doneRef = useRef(null);
  const theme = THEMES[country] || THEMES['Bangladesh'];
  const q = questions[qIdx];
  const pct = Math.round((score / questions.length) * 100);
  const medal = pct >= 80 ? '🏆' : pct >= 60 ? '🥈' : '🌱';

  useGSAP(() => {
    if (!optionsRef.current) return;
    gsap.fromTo(optionsRef.current.children,
      { x: -40, opacity: 0, scale: 0.9 },
      { x: 0, opacity: 1, scale: 1, stagger: 0.09, duration: 0.42, ease: 'back.out(1.6)', delay: 0.1 }
    );
  }, { dependencies: [qIdx] });

  useGSAP(() => {
    if (!done || !doneRef.current) return;
    const tl = gsap.timeline({ delay: 0.1 });
    tl.from('.q-medal', { scale: 0, rotation: -360, duration: 1.2, ease: 'elastic.out(1, 0.32)' })
      .from('.q-card', { y: 60, opacity: 0, scale: 0.6, duration: 0.7, ease: 'back.out(2.2)' }, '-=0.6')
      .from('.q-btn', { y: 30, opacity: 0, scale: 0.7, stagger: 0.1, duration: 0.5, ease: 'back.out(2)' }, '-=0.3');
  }, { dependencies: [done] });

  const confetti = useMemo(() => Array.from({ length: 32 }, (_, i) => ({
    color: ['#ffd700','#ff6b6b','#4af','#2fd','#ff9900','#c084fc','#f472b6','#34d399'][i % 8],
    left: `${(i * 3.1) % 97}%`,
    dur: `${1.6 + Math.random() * 1.8}s`,
    delay: `${i * 0.06}s`,
    x: (i % 2 ? 1 : -1) * (Math.random() * 90 + 20),
    size: 7 + Math.random() * 8,
  })), []);

  const choose = useCallback((i, el) => {
    if (selected !== null) return;
    const correct = i === q.correct;
    setSelected(i);
    if (correct) setScore(s => s + 1);
    setShowExplain(true);
    if (el) {
      if (correct) gsap.to(el, { scale: 1.07, boxShadow: '0 0 35px rgba(50,210,150,.85)', duration: 0.2, yoyo: true, repeat: 1 });
      else gsap.to(el, { x: [-10, 10, -8, 8, -4, 4, 0], duration: 0.4, ease: 'power2.out' });
    }
    setTimeout(() => {
      setShowExplain(false);
      setTimeout(() => {
        if (qIdx < questions.length - 1) { setQIdx(qi => qi + 1); setSelected(null); }
        else setDone(true);
      }, 200);
    }, 1900);
  }, [selected, q, qIdx, questions.length]);

  if (done) return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
      <Navbar />
      <EnvParticles type={theme.particle} accent={theme.accent} />
      {confetti.map((c, i) => (
        <div key={i} style={{
          position: 'fixed', left: c.left, top: '-24px', width: c.size, height: c.size,
          borderRadius: '50%', background: c.color,
          animation: `confettiFall ${c.dur} ${c.delay} ease-in forwards`,
          transform: `translateX(${c.x}px)`, zIndex: 50,
        }} />
      ))}
      <div ref={doneRef} className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 pt-20">
        <div className="text-center max-w-md w-full">
          <div className="q-medal text-8xl mb-5 select-none">{medal}</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-1">Quiz Complete!</h2>
          <p className="text-white/50 mb-6 text-sm">{EMOJIS[country]} {country} adventure finished</p>
          <div className="q-card glass rounded-3xl p-7 mb-6">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-300 mb-1">
              {score}/{questions.length}
            </div>
            <div className="text-white/45 text-sm mb-5">correct answers</div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-5">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-400"
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: 0.6, ease: [.22,1,.36,1] }} />
            </div>
            <p className="text-white font-bold text-sm">
              {pct === 100 ? '🌟 Perfect! You\'re a Terra Expert!' : pct >= 80 ? '🎉 Brilliant! You learned so much!' : pct >= 60 ? '👍 Good job! Keep exploring!' : '📚 Great start! Read the story again!'}
            </p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.button onClick={onRestart} whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
              className="q-btn flex items-center gap-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold px-6 py-3 rounded-full shadow-xl">
              <RotateCcw size={14} /> Read Again
            </motion.button>
            <Link to="/"><motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
              className="q-btn flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-6 py-3 rounded-full cursor-pointer">
              <Home size={14} /> Globe
            </motion.div></Link>
            <Link to="/space-game"><motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: .94 }}
              className="q-btn flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-200 font-bold px-6 py-3 rounded-full cursor-pointer">
              <Gamepad2 size={14} /> Space Game
            </motion.div></Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
      <Navbar />
      <EnvParticles type={theme.particle} accent={theme.accent} />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 pt-20">
        <div className="w-full max-w-xl">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-6">
            {questions.map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${i < qIdx ? 'bg-teal-400' : i === qIdx ? 'bg-blue-400 animate-pulse' : 'bg-white/15'}`} />
            ))}
          </div>

          <div className="text-center mb-5">
            <div className="text-white/40 text-[11px] uppercase tracking-widest mb-1">🎓 Quiz — {EMOJIS[country]} {country}</div>
            <div className="text-white/55 text-sm font-semibold">Question {qIdx + 1} of {questions.length}</div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={qIdx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: .35, ease: [.22,1,.36,1] }}
              className="glass rounded-3xl p-5 sm:p-6 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-[64px] sm:w-[78px] flex-shrink-0 animate-kidBob">
                  <KidSVG mood="happy" talking={selected === null} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-yellow-300 mb-2">⭐ Astro-Kid asks:</div>
                  <p className="text-white font-bold text-base sm:text-lg leading-snug">{q.q}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <div ref={optionsRef} className="grid grid-cols-1 gap-2.5">
            {q.opts.map((opt, i) => {
              let cls = 'border-white/15 bg-white/5 text-white/85 hover:bg-white/12 hover:border-white/30 cursor-pointer';
              let icon = ['A','B','C','D'][i];
              if (selected !== null) {
                if (i === q.correct) { cls = 'border-teal-400/60 bg-teal-500/20 text-white'; icon = '✓'; }
                else if (i === selected) { cls = 'border-red-400/60 bg-red-500/20 text-white'; icon = '✗'; }
                else { cls = 'border-white/8 bg-white/3 text-white/30'; }
              }
              return (
                <motion.button key={`${qIdx}-${i}`}
                  onClick={e => choose(i, e.currentTarget)}
                  whileHover={selected === null ? { scale: 1.02, x: 6 } : {}}
                  whileTap={selected === null ? { scale: .97 } : {}}
                  disabled={selected !== null}
                  className={`border rounded-2xl px-4 py-4 text-left text-sm font-semibold transition-all flex items-center gap-3 ${cls}`}>
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 border
                    ${selected !== null && i === q.correct ? 'bg-teal-500 border-teal-400 text-white' : selected === i && i !== q.correct ? 'bg-red-500 border-red-400 text-white' : 'bg-white/10 border-white/20'}`}>
                    {icon}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {selected !== null && i === q.correct && <span className="text-lg animate-popIn">🌟</span>}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplain && selected !== null && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mt-3 rounded-2xl px-4 py-3 text-sm font-bold border ${selected === q.correct ? 'bg-teal-900/60 border-teal-400/30 text-teal-100' : 'bg-red-900/60 border-red-400/30 text-red-100'}`}>
                {selected === q.correct ? '🎉 Correct! Brilliant!' : '💪 Not quite — but now you know!'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN STORY — CINEMATIC FULL-SCREEN MODE
   ══════════════════════════════════════════════════ */
export default function AnimatedStory() {
  const [params] = useSearchParams();
  const initCountry = params.get('country') || 'Bangladesh';
  const [country, setCountry] = useState(initCountry);
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageIdx, setPageIdx] = useState(-1);
  const [typingDone, setTypingDone] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [direction, setDirection] = useState(1); // 1=forward, -1=back

  const sceneRef = useRef(null);     // full scene wrapper
  const textBlockRef = useRef(null); // bottom text panel
  const kidRef = useRef(null);       // kid character
  const imgRef = useRef(null);       // scene image
  const tagRef = useRef(null);       // NASA data tag

  const theme = THEMES[country] || THEMES['Bangladesh'];

  useEffect(() => {
    setLoading(true); setPageIdx(-1); setTypingDone(false); setShowQuiz(false);
    const loader = LOADERS[country];
    if (!loader) { setLoading(false); return; }
    loader().then(m => { setBookData(m.default || m.bookData); setLoading(false); });
  }, [country]);

  const pages = useMemo(() => bookData?.countries?.[0]?.pages || [], [bookData]);
  const totalPages = pages.length;
  const currentPage = pages[pageIdx] || null;
  const isLast = pageIdx === totalPages - 1;
  const coverImg = bookData?.countries?.[0]?.coverImage;

  const kidMood = useMemo(() => {
    if (!currentPage) return 'happy';
    const t = currentPage.story.toLowerCase();
    if (['plant','hope','green','grow','future','promis'].some(w => t.includes(w))) return 'excited';
    if (['flood','heat','burn','gone','empty','die','dry'].some(w => t.includes(w))) return 'sad';
    return 'happy';
  }, [currentPage]);

  // ── GSAP: cinematic scene-change transition ──
  useGSAP(() => {
    if (loading || !textBlockRef.current) return;
    const tl = gsap.timeline();

    // Text block swoops in from bottom
    tl.fromTo(textBlockRef.current,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }
    );
    // Chapter badge drops in
    if (tagRef.current) {
      tl.fromTo(tagRef.current,
        { y: -30, opacity: 0, scale: 0.7 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.5)' }, '-=0.45'
      );
    }
    // Text lines stagger in
    tl.fromTo('.story-text-word',
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.015, duration: 0.4, ease: 'power2.out' }, '-=0.35'
    );
    // Kid enters
    if (kidRef.current) {
      tl.fromTo(kidRef.current,
        { x: -120, opacity: 0, rotation: -15, scale: 0.55 },
        { x: 0, opacity: 1, rotation: 0, scale: 1, duration: 0.85, ease: 'elastic.out(1, 0.45)' }, '-=0.55'
      );
    }
    // Data tag from right
    tl.fromTo('.nasa-tag',
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.1, duration: 0.42, ease: 'back.out(1.8)' }, '-=0.6'
    );
  }, { dependencies: [pageIdx, loading] });

  const goNext = useCallback(() => {
    if (!typingDone && pageIdx >= 0) { setTypingDone(true); return; }
    if (isLast) { setShowQuiz(true); return; }
    setDirection(1);
    setPageIdx(p => Math.min(p + 1, totalPages - 1));
    setTypingDone(false);
  }, [typingDone, isLast, totalPages, pageIdx]);

  const goPrev = useCallback(() => {
    if (pageIdx <= -1) return;
    setDirection(-1);
    setPageIdx(p => p - 1);
    setTypingDone(false); setShowQuiz(false);
  }, [pageIdx]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') goPrev();
    };
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, [goNext, goPrev]);

  if (showQuiz) return <QuizPage country={country} pages={pages} onRestart={() => { setPageIdx(-1); setShowQuiz(false); setTypingDone(false); }} />;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #020614, #0a1a30)' }}>
      <div className="flex flex-col items-center gap-5">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-400" />
        <motion.p animate={{ opacity: [.4, 1, .4] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="text-blue-300 text-xs uppercase tracking-widest">Loading Story…</motion.p>
      </div>
    </div>
  );

  const currentImg = pageIdx === -1 ? coverImg : currentPage?.image;
  const storyText = pageIdx === -1
    ? `Hi! I'm Astro-Kid! 👋 Let's explore ${country} together! Press Next to begin our adventure! 🚀`
    : currentPage?.story || '';

  return (
    <div ref={sceneRef} className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${theme.from} 0%, ${theme.to} 100%)` }}>

      {/* ── Layers ── */}
      <EnvParticles type={theme.particle} accent={theme.accent} />
      <FilmGrain />
      <Navbar />

      {/* ── Full-screen scene image with cinematic overlays ── */}
      <div className="absolute inset-0 z-3">
        <AnimatePresence mode="wait">
          <motion.div key={pageIdx}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0">
            {currentImg ? (
              <img src={currentImg} alt="" className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[120px] sm:text-[160px] opacity-20 animate-float select-none">
                  {EMOJIS[country]}
                </span>
              </div>
            )}
            {/* Cinematic letterbox bars */}
            <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-black/85 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/97 via-black/75 to-transparent pointer-events-none" />
            {/* Vignette sides */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Country picker — scrollable pill row ── */}
      <div className="absolute z-20 left-0 right-0 flex items-center gap-1.5 px-3 sm:px-6 overflow-x-auto hide-scrollbar"
        style={{ top: 68 }}>
        {Object.keys(LOADERS).map(c => (
          <motion.button key={c} onClick={() => setCountry(c)}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: .92 }}
            className={`flex-shrink-0 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${country === c ? 'bg-white text-black shadow-lg' : 'bg-black/40 text-white/60 border border-white/15 hover:bg-black/60 hover:text-white/90'}`}>
            {EMOJIS[c]} <span className="hidden xs:inline">{c}</span>
          </motion.button>
        ))}
      </div>

      {/* ── Bottom cinematic story panel ── */}
      <div ref={textBlockRef} className="absolute z-20 left-0 right-0 bottom-0 px-3 sm:px-6 md:px-10 pb-3 sm:pb-5">

        {/* Chapter / year tag — top of text area */}
        <div ref={tagRef} className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            {pageIdx === -1 ? `${EMOJIS[country]} ${country}` : `📖 Chapter ${pageIdx + 1} / ${totalPages}`}
          </span>
          {pageIdx >= 0 && currentPage?.year && (
            <span className="nasa-tag bg-black/40 backdrop-blur-md border border-white/15 text-teal-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              🛰 {currentPage.year}
            </span>
          )}
          {pageIdx === -1 && bookData?.title && (
            <span className="nasa-tag text-white/50 text-[11px] font-semibold hidden sm:inline truncate max-w-xs">
              {bookData.title}
            </span>
          )}
        </div>

        {/* Page progress dots */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {Array.from({ length: totalPages }).map((_, i) => (
            <motion.button key={i} onClick={() => { setPageIdx(i); setTypingDone(false); }}
              animate={{ width: i === pageIdx ? 22 : 7, backgroundColor: i <= pageIdx ? theme.accent : 'rgba(255,255,255,0.15)' }}
              transition={{ duration: .3 }}
              className="h-1.5 rounded-full cursor-pointer" />
          ))}
        </div>

        {/* Main story row: kid + speech bubble */}
        <div className="flex items-end gap-3 sm:gap-5 mb-3">
          {/* Kid */}
          <div ref={kidRef} className="flex-shrink-0 w-[68px] xs:w-[80px] sm:w-[100px] md:w-[115px]"
            style={{ height: 'auto' }}>
            <div className="animate-kidBob">
              <KidSVG mood={kidMood} talking={!typingDone && pageIdx >= 0} />
            </div>
          </div>

          {/* Speech bubble — main story text */}
          <div className="flex-1 min-w-0">
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/18 rounded-2xl sm:rounded-3xl px-4 sm:px-5 py-3 sm:py-4 shadow-2xl">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1.5"
                style={{ color: theme.accent }}>
                {pageIdx === -1 ? '⭐ Astro-Kid' : `⭐ Astro-Kid · ${currentPage?.title || 'says'}`}
              </div>
              <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                {typingDone && pageIdx >= 0
                  ? storyText
                  : <Typewriter text={storyText} onDone={() => setTypingDone(true)} speed={16} />
                }
              </p>
              {/* Speech bubble tail */}
              <div className="absolute -left-2.5 bottom-5 w-4 h-4 bg-black/60 border-b border-l border-white/18 rotate-45" />
            </div>

            {/* Caption below bubble */}
            {currentPage?.caption && pageIdx >= 0 && (
              <p className="text-white/35 text-[11px] italic mt-1.5 ml-2 leading-snug hidden sm:block">
                📷 {currentPage.caption}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <motion.button onClick={goPrev} disabled={pageIdx <= -1}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: .93 }}
            className="flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/18 text-white/65 disabled:opacity-20 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold hover:bg-white/18 transition-all disabled:pointer-events-none flex-shrink-0">
            <ChevronLeft size={15} /> <span className="hidden xs:inline">Back</span>
          </motion.button>

          <motion.button onClick={goNext}
            whileHover={{ scale: 1.04, boxShadow: `0 0 40px ${theme.accent}88` }}
            whileTap={{ scale: .95 }}
            className="flex-1 flex items-center justify-center gap-2 text-white font-black px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-xl transition-all"
            style={{ background: `linear-gradient(90deg, ${theme.accent}cc, ${theme.accent}88)` }}>
            {!typingDone && pageIdx >= 0
              ? '⏩ Read All'
              : isLast
                ? '🎓 Take the Quiz!'
                : pageIdx === -1
                  ? <><span>Start Story!</span><ChevronRight size={15}/></>
                  : <><span>Next</span><ChevronRight size={15}/></>
            }
          </motion.button>

          <Link to="/space-game" className="flex-shrink-0">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: .93 }}
              className="bg-purple-500/20 backdrop-blur-md border border-purple-400/25 text-purple-200 text-xs font-bold px-3.5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl cursor-pointer flex items-center gap-1.5">
              <Gamepad2 size={14} /> <span className="hidden sm:inline">Game</span>
            </motion.div>
          </Link>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-white/18 text-[9px] mt-2 hidden sm:block">
          ← → arrow keys · Space to advance
        </p>
      </div>
    </div>
  );
}
