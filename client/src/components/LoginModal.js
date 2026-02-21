import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { X, ShieldCheck, Terminal, Zap } from "lucide-react";

function LoginModal({ close }) {
  const navigate = useNavigate(); // Initialize navigation

  const handleInitiateLink = (e) => {
    e.preventDefault();
    // Here you would typically add authentication logic
    // For now, we transition directly to the onboarding sequence
    navigate("/onboarding"); 
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-[600] p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-zinc-950 border border-red-900/40 p-8 md:p-10 rounded-sm w-full max-w-[450px] relative overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.1)]"
      >
        <div className="absolute top-0 right-0 p-2 opacity-[0.03] pointer-events-none">
            <Zap size={200} className="text-red-600" />
        </div>

        <button
          onClick={close}
          className="absolute right-6 top-6 text-zinc-600 hover:text-red-600 transition-colors duration-300"
        >
          <X size={24} />
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-normal italic text-red-600 mb-2" style={{ fontFamily: "'Dancing Script', cursive" }}>
            Aura
          </h1>
          <h2 className="text-2xl font-black uppercase italic text-white tracking-tighter" style={{ fontFamily: 'Oswald' }}>
            Protocol Activation
          </h2>
          <div className="h-[1px] w-12 bg-red-600 mt-4 shadow-[0_0_10px_#dc2626]" />
        </div>

        <form className="space-y-6 relative z-10" onSubmit={handleInitiateLink}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Terminal size={12} className="text-red-900" /> Identity_Link
            </label>
            <input
              type="email"
              required
              placeholder="s24cseu1228@bennett.edu.in" // Using your college email
              className="w-full p-4 bg-black border border-red-900/20 text-white rounded-none focus:border-red-600 focus:outline-none focus:shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-all duration-300 placeholder:text-zinc-800 text-sm font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={12} className="text-red-900" /> Encryption_Key
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-4 bg-black border border-red-900/20 text-white rounded-none focus:border-red-600 focus:outline-none focus:shadow-[0_0_20px_rgba(220,38,38,0.1)] transition-all duration-300 placeholder:text-zinc-800 text-sm font-mono"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="group relative w-full bg-red-600 hover:bg-red-700 text-black py-4 rounded-none font-black uppercase tracking-[0.4em] text-xs transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Initiate Link</span>
              <motion.div 
                className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"
              />
            </button>
            <p className="text-center mt-6 text-[8px] text-zinc-600 uppercase tracking-[0.5em] italic">
              System Secure // Encrypted Connection Active
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginModal;