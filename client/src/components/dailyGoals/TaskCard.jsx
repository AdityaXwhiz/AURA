import React from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
const XP_PER_TASK = 15;
const TaskCard = ({
  title,
  description,
  done,
  icon: Icon,
  category,
  onComplete,
  index = 0,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.95 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={!done ? { scale: 1.02, y: -2 } : {}}
    style={{
      position: "relative",
      padding: "1.25rem",
      borderRadius: "16px",
      border: done ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(63,63,70,0.4)",
      background: done
        ? "linear-gradient(135deg, rgba(22,101,52,0.15) 0%, rgba(5,46,22,0.1) 100%)"
        : "linear-gradient(135deg, rgba(24,24,27,0.8) 0%, rgba(15,15,15,0.9) 100%)",
      backdropFilter: "blur(12px)",
      cursor: done ? "default" : "pointer",
      overflow: "hidden",
      transition: "border-color 0.3s, box-shadow 0.3s",
      boxShadow: done
        ? "0 0 20px rgba(34,197,94,0.08)"
        : "0 4px 20px rgba(0,0,0,0.3)",
    }}
    onClick={() => {
      if (!done && onComplete) {
        onComplete();
      }
    }}
  >
    {/* Glow effect on completion */}
    {done && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle at center, rgba(34,197,94,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
    )}

    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", position: "relative", zIndex: 1 }}>
      {/* Category Icon */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          background: done
            ? "linear-gradient(135deg, #166534, #15803d)"
            : "linear-gradient(135deg, rgba(63,63,70,0.5), rgba(39,39,42,0.5))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: done ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(63,63,70,0.3)",
        }}
      >
        {Icon && <Icon size={18} color={done ? "#4ade80" : "#a1a1aa"} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.6rem",
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: done ? "#4ade80" : "#ef4444",
            marginBottom: "4px",
            fontWeight: 700,
          }}
        >
          {category}
        </p>
        <p
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            color: done ? "rgba(255,255,255,0.5)" : "#fff",
            textDecoration: done ? "line-through" : "none",
            lineHeight: 1.3,
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              fontSize: "0.8rem",
              color: done ? "rgba(161,161,170,0.4)" : "#71717a",
              marginTop: "4px",
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        )}

        {/* XP badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "8px",
            padding: "3px 10px",
            borderRadius: "20px",
            background: done ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
            border: done ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <Star size={10} color={done ? "#4ade80" : "#f87171"} />
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              fontFamily: "monospace",
              color: done ? "#4ade80" : "#f87171",
            }}
          >
            {done ? "COMPLETED" : `+${XP_PER_TASK} XP`}
          </span>
        </div>
      </div>

      {/* Check Button */}
      <motion.div
        whileHover={!done ? { scale: 1.15 } : {}}
        whileTap={!done ? { scale: 0.9 } : {}}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: done
            ? "linear-gradient(135deg, #16a34a, #15803d)"
            : "rgba(39,39,42,0.6)",
          border: done
            ? "2px solid #22c55e"
            : "2px solid rgba(63,63,70,0.5)",
          boxShadow: done ? "0 0 15px rgba(34,197,94,0.3)" : "none",
          cursor: done ? "default" : "pointer",
          transition: "all 0.3s",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!done && onComplete) {
            onComplete();
          }
        }}
      >
        {done ? (
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <Check size={18} color="#fff" strokeWidth={3} />
          </motion.div>
        ) : (
          <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(113,113,122,0.4)" }} />
        )}
      </motion.div>
    </div>
  </motion.div>
);

export default TaskCard;