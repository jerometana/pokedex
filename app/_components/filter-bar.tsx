"use client";

import {
  ALL_FORM_CATEGORIES,
  ALL_GENS,
  ALL_TYPES,
  FORM_LABELS,
  TYPE_COLORS,
  type FormCategory,
  type Gen as GenNum,
  type PokeType,
} from "@/lib/types";
import { romanize } from "../_lib/helpers";
import { CloseIcon, SearchIcon } from "./icons";
import { MultiDropdown } from "./multi-dropdown";
import { TypeChip } from "./type-chip";

const GEN_OPTIONS: { value: GenNum; label: string }[] = ALL_GENS.map((g) => ({
  value: g,
  label: `Gen ${romanize(g)}`,
}));

const TYPE_OPTIONS: { value: PokeType; label: string }[] = ALL_TYPES.map(
  (t) => ({
    value: t,
    label: t,
  }),
);

const FORM_OPTIONS: { value: FormCategory; label: string }[] =
  ALL_FORM_CATEGORIES.map((f) => ({ value: f, label: FORM_LABELS[f] }));

export function FilterBar({
  query,
  setQuery,
  activeTypes,
  toggleType,
  clearTypes,
  activeGens,
  toggleGen,
  clearGens,
  activeForms,
  toggleForm,
  clearForms,
  count,
}: {
  query: string;
  setQuery: (s: string) => void;
  activeTypes: Set<PokeType>;
  toggleType: (t: PokeType) => void;
  clearTypes: () => void;
  activeGens: Set<GenNum>;
  toggleGen: (g: GenNum) => void;
  clearGens: () => void;
  activeForms: Set<FormCategory>;
  toggleForm: (f: FormCategory) => void;
  clearForms: () => void;
  count: number;
}) {
  return (
    <header className="filter-bar">
      <div className="filter-bar-inner">
        <h1 className="hero-title">Pokédex</h1>

        <div className="search-wrap">
          <span style={{ color: "#94A3B8", display: "inline-flex" }}>
            <SearchIcon size={24} />
          </span>
          <input
            type="text"
            placeholder="Search by name or number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ fontSize: "1.2rem" }}
          />
          {query && (
            <button
              className="clear-btn"
              onClick={() => setQuery("")}
              aria-label="Clear"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-controls">
          <MultiDropdown
            label="Generation"
            options={GEN_OPTIONS}
            selected={activeGens}
            onToggle={toggleGen}
            onClear={clearGens}
            width={220}
          />
          <MultiDropdown
            label="Type"
            options={TYPE_OPTIONS}
            selected={activeTypes}
            onToggle={toggleType}
            onClear={clearTypes}
            searchable
            width={280}
            renderTriggerChip={(o) => <TypeChip type={o.value} />}
            renderOption={(o, on) => {
              const c = TYPE_COLORS[o.value];
              return (
                <span
                  className="dd-type"
                  style={
                    on
                      ? {
                          background: c.bg,
                          color: c.fg,
                          padding: "3px 10px",
                          borderRadius: 999,
                        }
                      : undefined
                  }
                >
                  <span
                    className="dd-type-dot"
                    style={{ background: c.chip }}
                  />
                  <span style={{ textTransform: "capitalize" }}>{o.label}</span>
                </span>
              );
            }}
          />
          <MultiDropdown
            label="Form"
            options={FORM_OPTIONS}
            selected={activeForms}
            onToggle={toggleForm}
            onClear={clearForms}
            width={200}
          />
          {(activeGens.size > 0 ||
            activeTypes.size > 0 ||
            activeForms.size > 0) && (
            <button
              type="button"
              className="filter-clear-all"
              onClick={() => {
                clearGens();
                clearTypes();
                clearForms();
              }}
            >
              <CloseIcon />
              Clear all
            </button>
          )}
        </div>
        <span className="filter-count">
          <span className="filter-count-num">{count}</span>
          {count === 1 ? "result" : "results"}
        </span>
      </div>
    </header>
  );
}
