"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

export type Mode = "light" | "dark";
export type Density = "cozy" | "compact";
export type Accent = "minimal" | "subtle" | "full";

export type Tweaks = {
  mode: Mode;
  accent: Accent;
  density: Density;
  typeScale: number;
};

const TWEAK_DEFAULTS: Tweaks = {
  mode: "light",
  accent: "subtle",
  density: "cozy",
  typeScale: 100,
};

const TWEAKS_KEY = "pokedex.tweaks";

export function useTweaks() {
  const [t, setT] = useState<Tweaks>(TWEAK_DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TWEAKS_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setT({ ...TWEAK_DEFAULTS, ...JSON.parse(raw) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TWEAKS_KEY, JSON.stringify(t));
    } catch {}
  }, [t]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = t.mode;
    root.style.setProperty("--type-scale", (t.typeScale / 100).toString());
  }, [t.mode, t.typeScale]);

  const setTweak = useCallback(
    <K extends keyof Tweaks>(k: K, v: Tweaks[K]) =>
      setT((prev) => ({ ...prev, [k]: v })),
    [],
  );

  return { t, setTweak };
}

export function accentStrengthFor(accent: Accent): number {
  return accent === "minimal" ? 0 : accent === "subtle" ? 0.55 : 1;
}

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          className={value === o.value ? "on" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="tweaks-section">
      <div className="tweaks-section-h">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="tweaks-row">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function TweaksPanel({
  t,
  setTweak,
}: {
  t: Tweaks;
  setTweak: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void;
}) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 720) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, []);
  if (!open) {
    return (
      <button
        className="tweaks-panel"
        style={{ width: "auto", padding: "10px 14px", cursor: "pointer" }}
        onClick={() => setOpen(true)}
      >
        Tweaks
      </button>
    );
  }
  return (
    <aside className="tweaks-panel" aria-label="Tweaks">
      <div className="tweaks-head">
        <span>Tweaks</span>
        <button
          className="tweaks-toggle"
          onClick={() => setOpen(false)}
          aria-label="Hide"
        >
          ×
        </button>
      </div>
      <div className="tweaks-body">
        <Section title="Theme">
          <Row label="Mode">
            <Seg
              value={t.mode}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
              onChange={(v) => setTweak("mode", v)}
            />
          </Row>
          <Row label="Accent">
            <Seg
              value={t.accent}
              options={[
                { value: "minimal", label: "Minimal" },
                { value: "subtle", label: "Subtle" },
                { value: "full", label: "Tinted" },
              ]}
              onChange={(v) => setTweak("accent", v)}
            />
          </Row>
        </Section>
        <Section title="Layout">
          <Row label="Density">
            <Seg
              value={t.density}
              options={[
                { value: "cozy", label: "Cozy" },
                { value: "compact", label: "Compact" },
              ]}
              onChange={(v) => setTweak("density", v)}
            />
          </Row>
          <Row label={`Type scale ${t.typeScale}%`}>
            <input
              type="range"
              min={88}
              max={116}
              step={2}
              value={t.typeScale}
              onChange={(e) => setTweak("typeScale", Number(e.target.value))}
            />
          </Row>
        </Section>
      </div>
    </aside>
  );
}
