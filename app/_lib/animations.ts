import type { Variants } from "framer-motion";

export const slideEase = [0.2, 0.8, 0.2, 1] as const;

let pendingNavDir: 1 | -1 | 0 = 0;
export function setNavDir(d: 1 | -1 | 0) {
  pendingNavDir = d;
}
export function consumeNavDir(): 1 | -1 | 0 {
  const d = pendingNavDir;
  pendingNavDir = 0;
  return d;
}

export const heroVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : dir < 0 ? -80 : 0,
    opacity: 0,
    scaleX: 0.82,
    scaleY: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    transition: { duration: 0.5, ease: slideEase },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : dir < 0 ? 80 : 0,
    opacity: 0,
    scaleX: 0.82,
    scaleY: 0.96,
    transition: { duration: 0.26, ease: slideEase },
  }),
};

export const stackRowVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 140 : dir < 0 ? -140 : 0,
  }),
  center: {
    x: 0,
    transition: { duration: 0.55, ease: slideEase },
  },
};

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

export const detailVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 24 : dir < 0 ? -24 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: slideEase, delay: 0.05 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -24 : dir < 0 ? 24 : 0,
    opacity: 0,
    transition: { duration: 0.22, ease: slideEase },
  }),
};
