"use client";

import { createContext, useContext, type MouseEvent } from "react";

// When set (dialog mode), in-app links to other Pokémon swap the dialog content
// instead of doing a full page navigation. When null (standalone /pokemon/<id>
// page), links behave as normal <a href> navigations.
export const NavigateContext = createContext<((id: number) => void) | null>(null);

export function usePokeNavigate() {
  return useContext(NavigateContext);
}

// Intercept a plain left-click; let modified clicks (cmd/ctrl/shift/alt) through
// so "open in new tab" still hits the real static page.
export function pokeNavClick(
  e: MouseEvent,
  id: number,
  nav: ((id: number) => void) | null,
) {
  if (!nav) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  nav(id);
}
