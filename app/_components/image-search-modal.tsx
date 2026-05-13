"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  preloadImageSearch,
  searchByImage,
  type ImageSearchResult,
  type SearchStage,
} from "@/lib/image-search";
import { CameraIcon, CloseIcon } from "./icons";

type Phase =
  | { kind: "idle" }
  | { kind: "running"; stage: SearchStage }
  | { kind: "error"; message: string };

const STAGE_LABELS: Record<SearchStage, string> = {
  model: "Loading model…",
  embeddings: "Loading sprite index…",
  embed: "Reading your image…",
  rank: "Ranking matches…",
};

export function ImageSearchModal({
  open,
  onClose,
  onResults,
}: {
  open: boolean;
  onClose: () => void;
  onResults: (results: ImageSearchResult[], previewUrl: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) preloadImageSearch();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPhase({ kind: "idle" });
      setPreview((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
      setDragOver(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleFile = useCallback(
    async (file: File | Blob) => {
      if (!(file instanceof Blob) || !file.type.startsWith("image/")) {
        setPhase({ kind: "error", message: "Please drop an image file." });
        return;
      }
      const url = URL.createObjectURL(file);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      try {
        const results = await searchByImage(file, (stage) =>
          setPhase({ kind: "running", stage }),
        );
        onResults(results, url);
        onClose();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setPhase({ kind: "error", message });
      }
    },
    [onResults, onClose],
  );

  useEffect(() => {
    if (!open) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            void handleFile(file);
            return;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, handleFile]);

  if (!open) return null;

  const running = phase.kind === "running";

  return (
    <div className="img-modal-backdrop" onClick={onClose}>
      <div
        className="img-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="img-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="img-modal-head">
          <h2 id="img-modal-title">Search by image</h2>
          <button
            className="clear-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div
          className={`img-drop${dragOver ? " is-over" : ""}${running ? " is-busy" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          onClick={() => !running && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />

          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="img-drop-preview" />
          ) : (
            <div className="img-drop-empty">
              <CameraIcon size={28} />
              <p className="img-drop-title">Drop, paste, or choose an image</p>
              <p className="img-drop-sub">
                We&apos;ll find Pokémon that look similar. First use downloads
                ~50&nbsp;MB; cached after.
              </p>
            </div>
          )}
        </div>

        {phase.kind === "running" && (
          <div className="img-status">
            <span className="img-spinner" /> {STAGE_LABELS[phase.stage]}
          </div>
        )}
        {phase.kind === "error" && (
          <div className="img-status img-status-error">{phase.message}</div>
        )}
      </div>
    </div>
  );
}
