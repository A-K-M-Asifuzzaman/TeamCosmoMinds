import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020614] flex flex-col items-center justify-center gap-6 text-white px-6">
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}
        className="text-center">
        <div className="text-8xl mb-4">🌌</div>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300 mb-3">404</h1>
        <p className="text-white/60 text-lg mb-8">Lost in space! This page doesn't exist.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold px-6 py-3 rounded-full shadow-lg cursor-pointer">
              <Home size={16}/> Go Home
            </motion.div>
          </Link>
          <Link to="/">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-6 py-3 rounded-full cursor-pointer">
              <Rocket size={16}/> Terra Explorer
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
