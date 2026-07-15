import React, { useEffect, useRef, useState } from "react";
const AnimatedXP = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;

    const duration = 600;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        prevRef.current = to;
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

export default AnimatedXP;