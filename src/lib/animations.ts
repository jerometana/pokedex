import type { Variants } from "framer-motion";

export const slideEase = [0.2, 0.8, 0.2, 1] as const;

export const artVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 70 : dir < 0 ? -70 : 0,
    rotate: dir * 4,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: slideEase },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -70 : dir < 0 ? 70 : 0,
    rotate: -dir * 4,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.28, ease: slideEase },
  }),
};
