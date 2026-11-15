// Shared bits for the St. John's travel reels (stjohns-trip, stjohns-flash, stjohns-vhs, stjohns-polaroid).
// Media files live in public/travel/stjohns/ (kept out of git).
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { FPS } from "../../layout";

const P = "travel/stjohns/";
export const MEDIA = {
  letsgoo: P + "snap_pearson_letsgoo.jpg",
  pearsonVideo: P + "snap_pearson_video.mp4",
  pearsonWindow: P + "snap_pearson_window.jpg",
  taxi: P + "IMG_9045.mp4",
  aircanada1: P + "IMG_9047.jpg",
  aircanada2: P + "IMG_9048.jpg",
  takeoff: P + "IMG_9051.mp4",
  air1: P + "IMG_9052.jpg",
  air2: P + "IMG_9053.jpg",
  air3: P + "IMG_9054.jpg",
  air4: P + "IMG_9055.jpg",
  air5: P + "IMG_9056.jpg",
  air6: P + "IMG_9057.jpg",
  snack: P + "snap_inflight_snack.jpg",
  landing: P + "IMG_9064.mp4",
  pippy: P + "snap_pippy_park.jpg",
  fort: P + "snap_fort_townshend.jpg",
  cityhall: P + "snap_city_hall.jpg",
  signal: P + "snap_signal_hill.jpg",
} as const;
export type MediaKey = keyof typeof MEDIA;

export const isVideo = (src: string) => /\.(mp4|mov|webm)$/i.test(src);

/** Frames per beat (can be fractional) and a helper that rounds a beat number to a frame. */
export const beats = (bpm: number) => {
  const B = (60 / bpm) * FPS;
  return { B, at: (beat: number) => Math.round(beat * B) };
};

/** Which media folder to read from: the 1080p proxies (default) or the full-resolution set for 4K renders. */
export const MediaRoot = React.createContext<string>(P);

/** A photo or video filling its box. */
export const Media: React.FC<{ src: string; trimStart?: number; style?: React.CSSProperties }> = ({ src: raw, trimStart = 0, style }) => {
  const root = React.useContext(MediaRoot);
  const src = raw.startsWith(P) ? root + raw.slice(P.length) : raw;
  const fill: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block", ...style };
  return isVideo(src) ? <OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(trimStart * FPS)} style={fill} /> : <Img src={staticFile(src)} style={fill} />;
};

/** Animated film grain (SVG noise with a new seed every 2 frames). */
export const Grain: React.FC<{ opacity?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({ opacity = 0.12, blend = "overlay" }) => {
  const f = useCurrentFrame();
  const id = `grain-${Math.floor(f / 2) % 12}`;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: blend, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(f / 2) % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Small deterministic pseudo-random number in [0, 1) from an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
