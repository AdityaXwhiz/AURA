
import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
const MotivationalToast = ({ message, xpGained, onDone }) => (
  <motion.div
    initial={{ opacity: 0, y: 60, scale: 0.85 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -30, scale: 0.9 }}
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    style={{
      position: "fixed",
      bottom: "2rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9998,
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem 1.75rem",
      borderRadius: "16px",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      background: "linear-gradient(135deg, rgba(15,15,15,0.95) 0%, rgba(30,10,10,0.95) 100%)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(239,68,68,0.15)",
      maxWidth: "90vw",
    }}
    onAnimationComplete={() => {
      setTimeout(onDone, 2200);
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        background: "linear-gradient(135deg, #ef4444, #b91c1c)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Zap size={20} color="#fff" />
    </div>
    <div>
      <p style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem", margin: 0 }}>{message}</p>
      {xpGained > 0 && (
        <p style={{ color: "#f87171", fontSize: "0.75rem", fontWeight: 700, margin: "2px 0 0 0", fontFamily: "monospace" }}>
          +{xpGained} XP EARNED
        </p>
      )}
    </div>
  </motion.div>
);

export default MotivationalToast;