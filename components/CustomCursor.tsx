"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!isFinePointer || prefersReduced || !wrapRef.current) return;

    wrapRef.current.style.display = "block";
    document.documentElement.classList.add("custom-cursor-active");

    function move(e: PointerEvent) {
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    }

    function setHover(hovering: boolean) {
      if (!dotRef.current) return;
      dotRef.current.style.width = hovering ? "44px" : "10px";
      dotRef.current.style.height = hovering ? "44px" : "10px";
      dotRef.current.style.marginLeft = hovering ? "-22px" : "-5px";
      dotRef.current.style.marginTop = hovering ? "-22px" : "-5px";
    }

    function onOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      setHover(!!target.closest("a, button, [data-cursor-hover]"));
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", onOver);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden mix-blend-difference"
      aria-hidden
    >
      <div
        ref={dotRef}
        className="rounded-full bg-white transition-[width,height,margin] duration-200 ease-out"
        style={{ width: 10, height: 10, marginLeft: -5, marginTop: -5 }}
      />
    </div>
  );
}
