"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
  }

  const base =
    variant === "primary"
      ? "bg-white text-black hover:bg-white/90"
      : "glass text-white hover:bg-white/10";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      data-cursor-hover
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 ease-out ${base} ${className}`}
      style={{ transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), background-color 0.3s" }}
    >
      {children}
    </motion.a>
  );
}
