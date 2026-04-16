"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function SuccessConfetti() {
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (hasPlayedRef.current) {
      return;
    }

    hasPlayedRef.current = true;

    const defaults = {
      ticks: 260,
      spread: 68,
      gravity: 0.8,
      zIndex: 100,
    };

    confetti({
      ...defaults,
      particleCount: 80,
      origin: { x: 0.2, y: 0.7 },
    });

    confetti({
      ...defaults,
      particleCount: 80,
      origin: { x: 0.8, y: 0.7 },
    });
  }, []);

  return null;
}
