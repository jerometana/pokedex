"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakerIcon } from "./icons";

export function CryButton({ src, name }: { src: string | null; name: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!src) return;
    const a = new Audio(src);
    a.preload = "none";
    a.volume = 0.5;
    const onEnd = () => setPlaying(false);
    const onErr = () => {
      setPlaying(false);
      setErrored(true);
    };
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onErr);
    audioRef.current = a;
    return () => {
      a.pause();
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onErr);
      audioRef.current = null;
    };
  }, [src]);

  if (!src || errored) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      a.currentTime = 0;
      setPlaying(false);
      return;
    }
    a.currentTime = 0;
    a.play()
      .then(() => setPlaying(true))
      .catch(() => setErrored(true));
  };

  return (
    <button
      type="button"
      className={`cry-btn${playing ? " is-playing" : ""}`}
      onClick={toggle}
      aria-label={playing ? `Stop ${name}'s cry` : `Play ${name}'s cry`}
      title={playing ? "Stop cry" : "Play cry"}
    >
      <SpeakerIcon size={22} />
    </button>
  );
}
