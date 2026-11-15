// Reel "stjohns-vhs": vintage camcorder / VHS travel diary. 84 bpm lo-fi bed.
// Warm faded grade, grain, scanlines, vignette, light leaks, a tracking glitch on each cut,
// camcorder HUD (REC, timecode, date stamp) in VT323 and typewriter captions.
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { brand as myBrand } from "../../brand";
import { FONTS } from "../../fonts";
import { Music, ReelFrame, SfxTrack, type ReelProps, type SfxCue } from "../../components";
import { FPS, SAFE, SAFE_BOX, WIDTH } from "../../layout";
import { Grain, MEDIA, Media, beats, rand, type MediaKey } from "../stjohns-trip/shared";

const { at } = beats(84);

type Shot = { m: MediaKey; b: number; trim?: number; cap?: string; date?: string };
// Dates/times from the files' own metadata (12 Nov 2026, Toronto 9:19 am departure).
const SHOTS: Shot[] = [
  { m: "taxi", b: 4, trim: 1, cap: "toronto pearson, 9:19 am", date: "NOV. 12 2026" },
  { m: "letsgoo", b: 4 },
  { m: "aircanada1", b: 2, cap: "plane spotting" },
  { m: "takeoff", b: 4, cap: "wheels up" },
  { m: "air2", b: 2, cap: "toronto from above" },
  { m: "air5", b: 2 },
  { m: "snack", b: 4, cap: "in-flight snack" },
  { m: "landing", b: 4, cap: "hello, st. john's" },
  { m: "pippy", b: 4, cap: "pippy park" },
  { m: "fort", b: 4, cap: "fort townshend" },
  { m: "cityhall", b: 4, cap: "city hall, after dark" },
  { m: "signal", b: 6, cap: "signal hill. worth it." },
];
const STARTS = SHOTS.reduce<number[]>((a, s, i) => [...a, i === 0 ? 0 : a[i - 1] + SHOTS[i - 1].b], []);
const TOTAL_BEATS = STARTS[STARTS.length - 1] + SHOTS[SHOTS.length - 1].b;
export const durationInFrames = at(TOTAL_BEATS) + 24;

const SFX: SfxCue[] = STARTS.slice(1).map((b) => ({ name: "click" as const, at: at(b), volume: 0.18 }));

const VT: React.CSSProperties = { fontFamily: FONTS.VT323, color: "#fff", textShadow: "2px 0 0 rgba(255,0,60,0.65), -2px 0 0 rgba(0,200,255,0.6), 0 0 8px rgba(255,255,255,0.35)" };

const ShotView: React.FC<{ shot: Shot; idx: number; frames: number }> = ({ shot, idx, frames }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, frames], idx % 2 ? [1.08, 1.02] : [1.02, 1.08]);
  // tracking glitch on the first frames of every cut (not the first shot)
  const glitch = idx > 0 && f < 5;
  const jx = glitch ? (rand(idx * 7 + f) - 0.5) * 30 : 0;
  return (
    <AbsoluteFill data-el="shot" data-kind="content" data-fullbleed="" style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `translateX(${jx}px) scale(${zoom})`, filter: "sepia(0.22) saturate(1.18) contrast(1.06) brightness(1.03) blur(0.4px)" }}>
        <Media src={MEDIA[shot.m]} trimStart={shot.trim} />
      </AbsoluteFill>
      {glitch ? (
        <>
          <div style={{ position: "absolute", left: 0, width: WIDTH, top: 300 + rand(idx) * 1200, height: 70, background: "rgba(255,255,255,0.35)", mixBlendMode: "screen", filter: "blur(2px)" }} />
          <div style={{ position: "absolute", left: 0, width: WIDTH, top: 200 + rand(idx + 3) * 1400, height: 24, background: "linear-gradient(90deg, rgba(255,0,80,0.5), rgba(0,200,255,0.5))", mixBlendMode: "screen" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** Typewriter caption, one character every 2 frames. */
const TypeCaption: React.FC<{ text: string; frames: number; delay?: number }> = ({ text, frames, delay = 6 }) => {
  const f = useCurrentFrame();
  const shown = Math.max(0, Math.min(text.length, Math.floor((f - delay) / 2)));
  const out = interpolate(f, [frames - 6, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursor = Math.floor(f / 8) % 2 === 0;
  return (
    <div data-el="caption" data-kind="content" style={{ position: "absolute", left: SAFE_BOX.x, width: SAFE_BOX.width, top: 1200, textAlign: "center", opacity: out }}>
      <span style={{ ...VT, fontSize: 70, background: "rgba(0,0,0,0.35)", padding: "4px 18px" }}>
        {text.slice(0, shown)}
        <span style={{ opacity: cursor ? 1 : 0 }}>_</span>
        <span style={{ visibility: "hidden" }}>{text.slice(shown)}</span>
      </span>
    </div>
  );
};

const HUD: React.FC = () => {
  const f = useCurrentFrame();
  const sec = Math.floor(f / FPS);
  const tc = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}:${String(f % FPS).padStart(2, "0")}`;
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <>
      <div data-el="hud-rec" data-kind="content" style={{ position: "absolute", left: SAFE.left + 20, top: SAFE.top + 24, ...VT, fontSize: 64, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ width: 30, height: 30, borderRadius: 15, background: "#ff2a2a", opacity: blink ? 1 : 0.15, boxShadow: "0 0 14px #ff2a2a" }} />
        REC
      </div>
      <div data-el="hud-play" data-kind="content" style={{ position: "absolute", right: SAFE.right + 20, top: SAFE.top + 24, ...VT, fontSize: 64, display: "flex", alignItems: "center", gap: 12 }}>
        PLAY
        <span style={{ width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderLeft: "26px solid #fff" }} />
      </div>
      <div data-el="hud-tc" data-kind="content" style={{ position: "absolute", left: SAFE.left + 20, top: 1440, ...VT, fontSize: 56 }}>
        SP {tc}
      </div>
      <div data-el="hud-date" data-kind="content" style={{ position: "absolute", right: SAFE.right + 20, top: 1440, ...VT, fontSize: 56, color: "#ffb347" }}>
        NOV. 12 2026
      </div>
    </>
  );
};

const Overlays: React.FC = () => {
  const f = useCurrentFrame();
  const leakX = 50 + 40 * Math.sin(f / 50);
  const leak = 0.35 + 0.25 * Math.sin(f / 23);
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(60% 40% at ${leakX}% 15%, rgba(255,140,60,0.55), rgba(255,60,90,0.0) 70%)`, mixBlendMode: "screen", opacity: leak, pointerEvents: "none" }} />
      <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0px, rgba(0,0,0,0.13) 2px, transparent 2px, transparent 4px)", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
      <Grain opacity={0.16} />
    </>
  );
};

/** Opening: blue VHS "PLAY" screen for the first beats. */
const Intro: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [frames - 6, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#1a3cff", opacity: o, alignItems: "center", justifyContent: "center" }}>
      <div data-el="title" data-kind="content" style={{ ...VT, fontSize: 120, textAlign: "center", lineHeight: 1.05 }}>
        ST. JOHN'S
        <br />
        <span style={{ fontSize: 64 }}>TAPE 01 · NOV 2026</span>
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ brand = myBrand, debugSafeZones, probe }) => (
  <ReelFrame brand={{ ...brand, colors: { ...brand.colors, bg: "#000" } }} debugSafeZones={debugSafeZones} probe={probe}>
    <Music src="music/lofi-bed.wav" level={1} fadeInFrames={6} fadeOutFrames={30} />
    <SfxTrack cues={SFX} />
    {SHOTS.map((s, i) => {
      const from = at(STARTS[i]);
      const frames = at(STARTS[i] + s.b) - from + (i === SHOTS.length - 1 ? 24 : 0);
      return (
        <Sequence key={i} from={from} durationInFrames={frames} name={s.m}>
          <ShotView shot={s} idx={i} frames={frames} />
          {s.cap ? <TypeCaption text={s.cap} frames={frames} delay={i === 0 ? at(1.5) + 4 : 6} /> : null}
        </Sequence>
      );
    })}
    <Sequence durationInFrames={at(1.5)}>
      <Intro frames={at(1.5)} />
    </Sequence>
    <Overlays />
    <HUD />
    <Sequence from={durationInFrames - 24}>
      <FadeOut />
    </Sequence>
  </ReelFrame>
);

const FadeOut: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, 24], [0, 1], { extrapolateRight: "clamp" }) }} />;
};
