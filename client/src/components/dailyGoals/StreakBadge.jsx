import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
const StreakBadge = ({ count }) => {
  if (count < 1) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,179,8,0.1))",
        border: "1px solid rgba(249,115,22,0.3)",
      }}
    >
      <Flame size={14} color="#f97316" />
      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#fb923c", fontFamily: "monospace" }}>
        {count} DAY STREAK
      </span>
    </motion.div>
  );
};

export default StreakBadge;