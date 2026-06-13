import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2, Rocket, Sparkles, Leaf, Users,
  Layers, ShieldCheck, ChevronDown,
} from "lucide-react";

const fade = (d = 0, y = 14) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, delay: d },
});

const Counter = ({ to = 100, duration = 1400, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.floor(to * (1 - Math.cos(p * Math.PI)) / 2));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, duration]);
  return <span>{val.toLocaleString()}{suffix}</span>;
};

const Pillar = ({ icon: Icon, title, desc, color }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/8 transition-colors">
    <div className={`inline-flex items-center justify-center rounded-lg ${color} w-10 h-10 mb-3`}>
      <Icon className="text-black" size={18} />
    </div>
    <h3 className="text-white font-semibold">{title}</h3>
    <p className="text-white/70 text-sm mt-1">{desc}</p>
  </div>
);

const QA = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-left px-4 py-3" aria-expanded={open}>
        <span className="text-white font-medium text-sm">{q}</span>
        <ChevronDown className={`text-white/60 transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`} size={16}/>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="px-4 pb-4 text-white/65 text-sm leading-relaxed">{a}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function About() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(20,50,140,.3),transparent_70%)]"/>
      </div>

      <main id="main" className="relative z-10">
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-6 pt-28 pb-16">
          <motion.div {...fade(0)}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {["NASA Space Apps 2025","Open Source","Terra – 25 years"].map((tag, i) => (
                <span key={i} className={`text-xs font-semibold text-black px-3 py-1 rounded-full ${["bg-teal-300/90","bg-blue-300/90","bg-purple-300/90"][i]}`}>{tag}</span>
              ))}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              About{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300">
                CosmoMinds
              </span>
            </h1>
            <p className="mt-3 max-w-3xl text-white/80 leading-relaxed">
              We turn complex Earth data into playful, kid-friendly stories and interactive maps. Our mission:
              spark climate curiosity and action — one flipbook, one globe, one child at a time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-5 py-2.5 font-semibold hover:bg-white/90 cursor-pointer">
                  <Rocket size={15}/> Try Terra Explorer
                </motion.div>
              </Link>
              <a href="#team">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: .96 }}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 text-white px-5 py-2.5 hover:bg-white/10 cursor-pointer">
                  <Users size={15}/> Meet the team
                </motion.div>
              </a>
            </div>
          </motion.div>
        </section>

        {/* PILLARS */}
        <section className="mx-auto max-w-6xl px-6 pb-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "Story first", desc: "Beautiful narratives that make kids feel, think, and ask better questions about their world.", color: "bg-teal-300" },
            { icon: Globe2,   title: "Data you can touch", desc: "An interactive globe powered by Terra-era insights — temperature, floods, forests, and more.", color: "bg-blue-300" },
            { icon: Leaf,     title: "Hope in action", desc: "Every story ends with simple steps kids can take — plant, protect, participate.", color: "bg-purple-300" },
          ].map((p, i) => (
            <motion.div key={p.title} {...fade(i * 0.06)}>
              <Pillar {...p}/>
            </motion.div>
          ))}
        </section>

        {/* METRICS */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <motion.div {...fade(0.05)}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 grid gap-6 sm:grid-cols-4">
            {[
              { to: 8,    suffix: "+",   label: "Country storybooks" },
              { to: 25,   suffix: " yrs", label: "Terra-era timeline" },
              { to: 14,   suffix: "",    label: "Data layers & metrics" },
              { to: 5000, suffix: "+",   label: "Kids we aim to reach" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-white">
                  <Counter to={s.to} suffix={s.suffix}/>
                </div>
                <div className="text-white/60 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* HOW WE BUILT IT */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <motion.h2 className="text-white text-2xl font-bold mb-4" {...fade(0)}>How we built it</motion.h2>
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div {...fade(0.05)} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="text-teal-300" size={18}/>
                <span className="text-white font-semibold">Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["React","React Router DOM","Vite","Tailwind","Framer Motion","Three.js","Globe.gl","Chart.js"].map(t => (
                  <span key={t} className="text-xs text-black bg-white px-2 py-1 rounded-md font-semibold">{t}</span>
                ))}
              </div>
              <p className="text-white/70 text-sm mt-3">Flipbook storytelling meets 3D Earth — designed to be fast, responsive, and delightful.</p>
            </motion.div>

            <motion.div {...fade(0.1)} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="text-blue-300" size={18}/>
                <span className="text-white font-semibold">Principles</span>
              </div>
              <ul className="text-white/75 text-sm list-disc pl-5 space-y-1.5">
                <li>Kid-friendly language, science-accurate framing</li>
                <li>Hopeful arcs: from problem → action → promise</li>
                <li>Accessible UI, keyboard & screen-reader friendly</li>
              </ul>
            </motion.div>
          </div>
        </section>

        {/* PROJECT DESCRIPTION */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <motion.h2 className="text-white text-2xl font-bold mb-4" {...fade(0)}>Detailed Project Description</motion.h2>
          <motion.div {...fade(0.05)}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/75 text-sm space-y-4 leading-relaxed max-h-[600px] overflow-y-auto">
            <p><strong className="text-white">Terra Celebration</strong> is an interactive web-based visualization platform designed to bring global climate and environmental data to life. Using high-resolution satellite imagery and derived datasets from NASA's Terra satellites (ASTER, MODIS, MISR, CERES), the project presents 25 years of environmental data for six countries.</p>
            <p>The platform combines scientific rigor with visual storytelling, enabling users to explore climate trends, urbanization, vegetation, and disaster impacts interactively.</p>
            <h3 className="text-white font-semibold text-base mt-4">AI-Powered Features</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white/90">Q&A Chatbot:</strong> Users can ask climate and environment-related questions and receive instant answers using AI trained on Terra data and related resources.</li>
            </ul>
            <h3 className="text-white font-semibold text-base mt-4">Problems We Solve</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Making satellite data accessible for non-experts</li>
              <li>Raising community awareness about climate impacts and solutions</li>
              <li>Supporting policy guidance with consolidated analytics</li>
              <li>Providing educational tools for students and researchers</li>
            </ul>
          </motion.div>
        </section>

        {/* TEAM */}
        <section id="team" className="mx-auto max-w-6xl px-6 pb-20">
          <motion.h2 className="text-white text-2xl font-bold mb-5" {...fade(0)}>Team</motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "ASIF ZAMAN",      role: "AI/ML Engineer",       img: "https://i.ibb.co.com/DHmLW7K0/Whats-App-Image-2025-09-23-at-10-30-29.jpg" },
              { name: "AFRIDI AKBAR IFTY", role: "Full-Stack Developer", img: "https://i.ibb.co.com/ynHZtbpw/Whats-App-Image-2025-09-23-at-10-30-29-1.jpg" },
              { name: "ROBIUL HASAN",    role: "Project Storyteller",   img: "https://i.ibb.co.com/xkzbkTK/Whats-App-Image-2025-09-23-at-10-30-29-2.jpg" },
              { name: "MEHRAB-AL-HASAN", role: "Video Editor",          img: "https://i.ibb.co.com/1GsMC4wL/Whats-App-Image-2025-09-23-at-10-32-05.jpg" },
              { name: "ABRAR HOSSAIN",   role: "UI/UX Designer",        img: "https://i.ibb.co.com/cKNNDfqL/Whats-App-Image-2025-09-23-at-10-30-00.jpg" },
              { name: "KAZI TAHERA JANNAT", role: "Researcher",         img: "https://i.ibb.co.com/Wp57yvJK/Whats-App-Image-2025-09-23-at-10-30-28.jpg" },
            ].map((p, i) => (
              <motion.div key={p.name} {...fade(0.05 + i * 0.05)}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={p.img} alt={p.name}
                    className="w-14 h-14 rounded-xl object-cover border border-white/15 flex-shrink-0"
                    onError={e => { e.currentTarget.src = "/assets/grid1.png"; }}/>
                  <div>
                    <div className="text-white font-semibold text-sm">{p.name}</div>
                    <div className="text-white/55 text-xs mt-0.5">{p.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
