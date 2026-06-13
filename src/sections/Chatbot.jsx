import { useRef, useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Trash2, Bot, User, Loader2, Sparkles, Globe2, Thermometer, Wind, Leaf } from "lucide-react";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Navbar from "./Navbar";

const API_BASE = "https://bot-five-liard.vercel.app";

function MarkdownText({ text }) {
  return (
    <div
      className="prose-space text-sm leading-relaxed"
      dangerouslySetInnerHTML={{
        __html: text
          .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
            `<pre><code class="lang-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/^### (.*)/gm, '<h3>$1</h3>')
          .replace(/^## (.*)/gm, '<h2>$1</h2>')
          .replace(/^# (.*)/gm, '<h1>$1</h1>')
          .replace(/^\- (.*)/gm, '<li>$1</li>')
          .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/^(?!<[h|u|p|l|p])(.+)/gm, '<p>$1</p>')
      }}
    />
  );
}

const SUGGESTIONS = [
  "What is the Terra satellite?",
  "Explain MODIS data",
  "How does ASTER work?",
  "What is CERES measuring?",
  "Tell me about MISR sensor",
];

export default function TerraChat() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your **NASA Terra AI guide** 🛸\n\nI can answer questions about **ASTER**, **CERES**, **MISR**, and **MODIS** — the four instruments aboard NASA's Terra satellite. What would you like to explore?" }
  ]);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const userMessage = (text || input).trim();
    if (!userMessage || busy) return;
    setMessages(m => [...m, { role: "user", content: userMessage }, { role: "assistant", content: "" }]);
    setInput(""); setBusy(true);
    const ctrl = new AbortController(); abortRef.current = ctrl;
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
        signal: ctrl.signal,
      });
      const reader = res.body?.getReader();
      if (!reader) {
        const t = await res.text();
        setMessages(m => { const o = [...m]; o[o.length - 1] = { role: "assistant", content: t }; return o; });
      } else {
        const dec = new TextDecoder(); let buf = "";
        while (true) {
          const { value, done } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true });
          const events = buf.split("\n\n"); buf = events.pop() || "";
          for (const ev of events) {
            if (!ev.startsWith("data: ")) continue;
            const data = ev.slice(6);
            if (data === "[DONE]" || data.startsWith("[ERROR]")) break;
            setMessages(m => { const o = [...m]; const l = o[o.length - 1]; if (l?.role === "assistant") o[o.length - 1] = { ...l, content: (l.content || "") + data }; return o; });
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages(m => { const o = [...m]; o[o.length - 1] = { role: "assistant", content: "⚠️ Connection error. Please try again." }; return o; });
      }
    } finally { setBusy(false); }
  }

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([{ role: "assistant", content: "Chat cleared. Ask me anything about NASA Terra! 🌍" }]);
    setBusy(false);
  };

  const headerRef = useRef(null);
  useGSAP(() => {
    if (!headerRef.current) return;
    const tl = gsap.timeline({ delay: .1 });
    tl.from('.chat-bot-icon', { scale: 0, rotation: -360, duration: 1.0, ease: 'elastic.out(1, 0.4)' })
      .from('.chat-title-char', { y: -55, opacity: 0, rotation: gsap.utils.wrap([-22, 22]), scale: .2, stagger: .04, duration: .6, ease: 'back.out(3)' }, '-=.55')
      .from('.chat-sub', { y: 18, opacity: 0, duration: .45 }, '-=.3')
      .from('.chat-sensor-pill', { scale: 0, opacity: 0, stagger: .08, duration: .4, ease: 'back.out(2.5)' }, '-=.2')
      .from('.chat-area', { y: 35, opacity: 0, duration: .55, ease: 'power2.out' }, '-=.2');
    gsap.to('.chat-bot-icon', {
      boxShadow: '0 0 40px rgba(50,200,180,.8)', scale: 1.08,
      duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5,
    });
  }, []);

  const SENSOR_PILLS = [
    { label: 'ASTER', icon: <Thermometer size={11}/>, color: '#ff6b6b', desc: 'Surface temperature' },
    { label: 'CERES', icon: <Globe2 size={11}/>, color: '#ffd43b', desc: 'Energy budget' },
    { label: 'MISR',  icon: <Wind size={11}/>, color: '#74c0fc', desc: 'Aerosols & 3D mapping' },
    { label: 'MODIS', icon: <Leaf size={11}/>, color: '#51cf66', desc: 'Vegetation & fires' },
  ];

  return (
    <div className="min-h-screen bg-[#020614] flex flex-col">
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(20,50,140,.45),transparent_68%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_90%_90%,rgba(0,60,90,.28),transparent_60%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_5%_85%,rgba(60,10,100,.18),transparent_60%)]"/>
      </div>

      <div className="relative z-10 flex flex-col flex-1 pt-16">
        {/* Header */}
        <div ref={headerRef} className="text-center py-7 sm:py-10 px-4">
          {/* Animated bot icon */}
          <div className="chat-bot-icon inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 items-center justify-center shadow-[0_0_25px_rgba(50,180,255,.55)] mb-4">
            <Bot size={26} className="text-white"/>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
            {'Terra AI Guide'.split('').map((ch, i) => (
              <span key={i} className="chat-title-char gradient-text-animated inline-block" style={{ animationDelay: `${i * .07}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </h1>
          <p className="chat-sub text-white/45 text-sm sm:text-base max-w-md mx-auto mb-5">
            Your AI guide to NASA Terra's four science instruments — ask me anything!
          </p>
          {/* Sensor pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SENSOR_PILLS.map(s => (
              <button key={s.label} onClick={() => send(`Tell me about ${s.label} instrument on NASA Terra`)}
                className="chat-sensor-pill inline-flex items-center gap-1.5 rounded-full border text-[11px] font-bold px-3 py-1.5 hover:opacity-80 transition-opacity"
                style={{ color: s.color, borderColor: `${s.color}55`, background: `${s.color}12` }}>
                {s.icon} {s.label}
                <span className="text-white/35 hidden sm:inline">— {s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-area flex-1 max-w-3xl w-full mx-auto px-4 flex flex-col gap-4 pb-4">
          {/* Messages */}
          <div ref={boxRef}
            className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 space-y-4 min-h-[300px] max-h-[calc(100vh-360px)]"
            style={{ scrollbarWidth: 'thin' }}>
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-gradient-to-br from-teal-500 to-blue-500 shadow-[0_0_12px_rgba(50,200,160,.4)]'
                  }`}>
                    {m.role === 'user' ? <User size={13} className="text-white"/> : <Bot size={13} className="text-white"/>}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600/80 to-blue-700/80 border border-blue-400/20 text-white rounded-tr-sm'
                      : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                  }`}>
                    {m.content === '' && busy && i === messages.length - 1
                      ? <div className="flex gap-1.5 py-1">{[0,1,2].map(j => <motion.div key={j} className="w-1.5 h-1.5 rounded-full bg-teal-400" animate={{ scale: [1,.5,1] }} transition={{ duration: .8, delay: j*.15, repeat: Infinity }}/>)}</div>
                      : m.role === 'assistant' ? <MarkdownText text={m.content || '...'}/> : <span>{m.content}</span>
                    }
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}
              className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/30 text-white/70 hover:text-white px-3 py-1.5 rounded-full transition-all">
                  {s}
                </button>
              ))}
            </motion.div>
          )}

          {/* Input row */}
          <div className="flex gap-2">
            <button onClick={clearChat} title="Clear chat"
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-400/30 text-white/50 hover:text-red-300 flex items-center justify-center transition-all">
              <Trash2 size={15}/>
            </button>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Ask about ASTER, CERES, MISR, MODIS…"
                disabled={busy}
                className="w-full h-10 bg-white/5 border border-white/15 hover:border-white/25 focus:border-teal-400/50 rounded-xl px-4 pr-11 text-sm text-white placeholder-white/30 outline-none transition-all backdrop-blur-sm"
              />
              <button onClick={() => send()}
                disabled={busy || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg flex items-center justify-center disabled:opacity-30 hover:shadow-[0_0_12px_rgba(50,180,255,.5)] transition-all">
                {busy ? <Loader2 size={12} className="text-white animate-spin"/> : <Send size={11} className="text-white"/>}
              </button>
            </div>
          </div>
          <p className="text-center text-white/25 text-[10px]">Powered by NASA Terra satellite instruments</p>
        </div>
      </div>
    </div>
  );
}
