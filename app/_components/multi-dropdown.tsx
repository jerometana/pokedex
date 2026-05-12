"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { slideEase } from "../_lib/animations";
import { CheckIcon, ChevronDown, SearchIcon } from "./icons";

export function MultiDropdown<T extends string | number>({
  label,
  options,
  selected,
  onToggle,
  onClear,
  renderOption,
  renderTriggerChip,
  searchable = false,
  width = 260,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: Set<T>;
  onToggle: (v: T) => void;
  onClear: () => void;
  renderOption?: (o: { value: T; label: string }, on: boolean) => ReactNode;
  renderTriggerChip?: (o: { value: T; label: string }) => ReactNode;
  searchable?: boolean;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    if (searchable) {
      const tm = setTimeout(() => searchRef.current?.focus(), 30);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
        clearTimeout(tm);
      };
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, searchable]);

  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setQ("");
  }

  const count = selected.size;
  const selectedOpts = options.filter((o) => selected.has(o.value));
  const filteredOpts = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;

  const PREVIEW_MAX = 2;
  const previewOpts = selectedOpts.slice(0, PREVIEW_MAX);
  const overflow = selectedOpts.length - previewOpts.length;

  return (
    <div className="dd" ref={rootRef}>
      <button
        type="button"
        className={`dd-trigger ${count > 0 ? "active" : ""} ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="dd-label">{label}</span>
        {count === 0 ? (
          <span className="dd-summary muted">All</span>
        ) : (
          <span className="dd-chips">
            {previewOpts.map((o) => (
              <span key={String(o.value)} className="dd-chip">
                {renderTriggerChip ? renderTriggerChip(o) : o.label}
              </span>
            ))}
            {overflow > 0 && (
              <span className="dd-chip dd-chip-more">+{overflow}</span>
            )}
          </span>
        )}
        <span className={`dd-chev ${open ? "up" : ""}`} aria-hidden>
          <ChevronDown />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="dd-menu"
            role="listbox"
            style={{ width }}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: slideEase }}
          >
            <div className="dd-menu-head">
              <span>
                {label}
                {count > 0 && <span className="dd-count">{count}</span>}
              </span>
              {count > 0 && (
                <button type="button" className="dd-clear" onClick={onClear}>
                  Clear
                </button>
              )}
            </div>
            {searchable && (
              <div className="dd-search">
                <SearchIcon size={13} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}`}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            )}
            <div className="dd-menu-list">
              {filteredOpts.length === 0 ? (
                <div className="dd-empty">No match</div>
              ) : (
                filteredOpts.map((o) => {
                  const on = selected.has(o.value);
                  return (
                    <button
                      key={String(o.value)}
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={`dd-opt ${on ? "on" : ""}`}
                      onClick={() => onToggle(o.value)}
                    >
                      <span
                        className={`dd-check ${on ? "on" : ""}`}
                        aria-hidden
                      >
                        {on && <CheckIcon />}
                      </span>
                      {renderOption ? (
                        renderOption(o, on)
                      ) : (
                        <span>{o.label}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
