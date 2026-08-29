"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function GradientBlob({
  colors = ["#7C3AED", "#DB2777", "#F97316"],
  className = "",
}: {
  colors?: string[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 25]);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <motion.div
        style={{ y, rotate }}
        className="absolute -top-1/3 left-1/2 h-[60vw] w-[60vw] max-h-[900px] max-w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-[110px]"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `conic-gradient(from 90deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`,
          }}
        />
      </motion.div>
    </div>
  );
}
