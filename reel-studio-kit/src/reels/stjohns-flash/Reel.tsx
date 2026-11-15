// Reel "stjohns-flash": trending beat-sync travel edit. 128 bpm.
// 0-8 beats: animated flight route Toronto (YYZ) -> St. John's (YYT) during the music build.
// Beat 8 (the drop): fast cuts on the beat, white flash + zoom punch + shake, big echo titles (Bebas Neue).
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { brand as myBrand } from "../../brand";
import { FONTS } from "../../fonts";
import { Music, ReelFrame, SfxTrack, type ReelProps, type SfxCue } from "../../components";
import { SAFE, SAFE_BOX } from "../../layout";
import { Grain, MEDIA, Media, MediaRoot, beats, rand, type MediaKey } from "../stjohns-trip/shared";

const { B, at } = beats(128);
const INTRO = 8;

type Shot = { m: MediaKey; b: number; trim?: number };
const SHOTS: Shot[] = [
  { m: "letsgoo", b: 2 },
  { m: "aircanada1", b: 2 },
  { m: "pearsonVideo", b: 2, trim: 0.5 },
  { m: "taxi", b: 4, trim: 2 },
  { m: "pearsonWindow", b: 2 },
  { m: "takeoff", b: 4 },
  { m: "air1", b: 1 },
  { m: "air2", b: 1 },
  { m: "air3", b: 1 },
  { m: "air4", b: 1 },
  { m: "air5", b: 1 },
  { m: "air6", b: 1 },
  { m: "snack", b: 2 },
  { m: "landing", b: 4 },
  { m: "pippy", b: 2 },
  { m: "fort", b: 2 },
  { m: "cityhall", b: 2 },
  { m: "signal", b: 6 },
];
const START_BEAT = SHOTS.reduce<number[]>((a, s, i) => [...a, i === 0 ? INTRO : a[i - 1] + SHOTS[i - 1].b], []);
const END_BEAT = START_BEAT[START_BEAT.length - 1] + SHOTS[SHOTS.length - 1].b;
export const durationInFrames = at(END_BEAT) + 20;

const beatOf = (m: MediaKey) => START_BEAT[SHOTS.findIndex((s) => s.m === m)];
// Big titles: [start beat, beats, text, small line]
const TITLES: [number, number, string, string?][] = [
  [beatOf("aircanada1"), 2, "LET'S GO"],
  [beatOf("takeoff"), 4, "TAKEOFF"],
  [beatOf("air1"), 6, "FROM ABOVE", "TORONTO, ON"],
  [beatOf("landing"), 4, "WE LANDED", "ST. JOHN'S, NL"],
  [beatOf("pippy"), 6, "EXPLORE"],
  [beatOf("signal"), 6, "ST. JOHN'S", "NEWFOUNDLAND · CANADA"],
];
const SECTION = new Set(TITLES.map((t) => t[0]));

const SFX: SfxCue[] = [
  { name: "whoosh", at: at(INTRO) - 10, volume: 0.35 },
  ...TITLES.slice(1).map(([b]) => ({ name: "whoosh" as const, at: at(b) - 8, volume: 0.25 })),
];

// ---------- intro: flight route ----------
const YYZ = { x: 250, y: 1290 };
const YYT = { x: 800, y: 700 };
const CTRL = { x: 260, y: 640 };
const bez = (p: number) => ({
  x: (1 - p) ** 2 * YYZ.x + 2 * (1 - p) * p * CTRL.x + p ** 2 * YYT.x,
  y: (1 - p) ** 2 * YYZ.y + 2 * (1 - p) * p * CTRL.y + p ** 2 * YYT.y,
});
const PATH = `M ${YYZ.x} ${YYZ.y} Q ${CTRL.x} ${CTRL.y} ${YYT.x} ${YYT.y}`;
const PATH_LEN = 1100; // >= the curve length, for the reveal mask

const Pin: React.FC<{ x: number; y: number; code: string; city: string; show: number; right?: boolean }> = ({ x, y, code, city, show, right }) => {
  const f = useCurrentFrame();
  const ring = (f % 30) / 30;
  return (
    <>
      <div style={{ position: "absolute", left: x - 18, top: y - 18, width: 36, height: 36, borderRadius: 18, background: "#ff3b5c", boxShadow: "0 0 30px #ff3b5c", transform: `scale(${show})` }} />
      <div style={{ position: "absolute", left: x - 18, top: y - 18, width: 36, height: 36, borderRadius: 18, border: "3px solid #ff3b5c", transform: `scale(${1 + ring * 2.2})`, opacity: (1 - ring) * show }} />
      <div
        data-el="pin-label"
        data-kind="content"
        style={{ position: "absolute", top: y + (right ? -150 : 40), left: right ? x - 330 : x - 40, width: 360, textAlign: right ? "right" : "left", opacity: show, color: "#fff", fontFamily: FONTS.Bebas }}
      >
        <div style={{ fontSize: 88, letterSpacing: 4, lineHeight: 0.9 }}>{code}</div>
        <div style={{ fontSize: 36, letterSpacing: 8, opacity: 0.8 }}>{city}</div>
      </div>
    </>
  );
};

const RouteIntro: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at(1.5), at(7)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const pt = bez(p);
  const ahead = bez(Math.min(1, p + 0.01));
  const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
  const titleIn = interpolate(f, [2, 14], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const zoom = interpolate(f, [0, at(INTRO)], [1, 1.12]);
  return (
    <AbsoluteFill data-el="route" data-kind="content" data-fullbleed="" style={{ background: "radial-gradient(120% 80% at 50% 40%, #16325f 0%, #0a1630 70%, #050b18 100%)", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.13) 2px, transparent 2px)", backgroundSize: "44px 44px" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: FONTS.Bebas, fontSize: 380, color: "rgba(255,255,255,0.04)", letterSpacing: 20 }}>CANADA</div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <mask id="reveal">
              <path d={PATH} stroke="#fff" strokeWidth={24} fill="none" strokeDasharray={PATH_LEN} strokeDashoffset={PATH_LEN * (1 - p)} />
            </mask>
          </defs>
          <path d={PATH} stroke="rgba(255,255,255,0.18)" strokeWidth={4} fill="none" strokeDasharray="2 22" strokeLinecap="round" />
          <path d={PATH} stroke="#fff" strokeWidth={7} fill="none" strokeDasharray="2 22" strokeLinecap="round" mask="url(#reveal)" />
          <g transform={`translate(${pt.x} ${pt.y}) rotate(${ang + 90}) scale(2.1)`} opacity={p > 0 && p < 1 ? 1 : p >= 1 ? 0 : 0.0}>
            <path d="M0 -22 C2 -22 3 -18 3 -14 L3 -5 L20 6 L20 10 L3 4 L3 14 L8 18 L8 21 L0 19 L-8 21 L-8 18 L-3 14 L-3 4 L-20 10 L-20 6 L-3 -5 L-3 -14 C-3 -18 -2 -22 0 -22 Z" fill="#fff" />
          </g>
        </svg>
        <Pin x={YYZ.x} y={YYZ.y} code="YYZ" city="TORONTO" show={interpolate(f, [4, 12], [0, 1], { extrapolateRight: "clamp" })} />
        <Pin x={YYT.x} y={YYT.y} code="YYT" city="ST. JOHN'S" show={interpolate(f, [at(6.5), at(7.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} right />
      </AbsoluteFill>
      <div
        data-el="title"
        data-kind="content"
        style={{ position: "absolute", left: SAFE_BOX.x, width: SAFE_BOX.width, top: SAFE.top + 40, textAlign: "center", color: "#fff", opacity: titleIn, transform: `translateY(${(1 - titleIn) * 30}px)` }}
      >
        <div style={{ fontFamily: FONTS.Bebas, fontSize: 40, letterSpacing: 14, color: "#ff8fa3" }}>12 · 11 · 2026</div>
        <div style={{ fontFamily: FONTS.Bebas, fontSize: 150, lineHeight: 0.95, letterSpacing: 6, textShadow: "0 0 40px rgba(255,59,92,0.45)" }}>TRAVEL DAY</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- shots ----------
const ShotView: React.FC<{ shot: Shot; idx: number; frames: number; section: boolean }> = ({ shot, idx, frames, section }) => {
  const f = useCurrentFrame();
  const punch = interpolate(f, [0, 6], [section ? 1.22 : 1.12, 1.0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const drift = interpolate(f, [0, frames], [1, 1.06]);
  const shake = section ? Math.max(0, 1 - f / 8) : 0;
  const sx = (rand(idx * 31 + f) - 0.5) * 26 * shake;
  const sy = (rand(idx * 17 + f * 3) - 0.5) * 26 * shake;
  return (
    <AbsoluteFill data-el="shot" data-kind="content" data-fullbleed="" style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${punch * drift})` }}>
        <Media src={MEDIA[shot.m]} trimStart={shot.trim} style={{ filter: "contrast(1.08) saturate(1.12)" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ strong: boolean }> = ({ strong }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(f, [0, strong ? 6 : 3], [strong ? 0.95 : 0.5, 0], { extrapolateRight: "clamp" }), pointerEvents: "none" }} />;
};

/** Big Bebas title with echo copies above and below (the "repeat text" trend). */
const EchoTitle: React.FC<{ text: string; sub?: string; frames: number; hold?: boolean }> = ({ text, sub, frames, hold }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  const out = hold ? 1 : interpolate(f, [frames - 4, frames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const echo = interpolate(f, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = text.length > 7 ? 176 : 230;
  const base: React.CSSProperties = { fontFamily: FONTS.Bebas, fontSize: size, lineHeight: 0.86, letterSpacing: interpolate(inP, [0, 1], [14, 4]), whiteSpace: "nowrap" };
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out, pointerEvents: "none" }}>
      {[-2, -1, 1, 2].map((k) => (
        <div key={k} style={{ ...base, position: "absolute", top: 960 - size * 0.43 + k * size * 0.86 * echo, color: "transparent", WebkitTextStroke: "3px rgba(255,255,255,0.75)", opacity: echo * (Math.abs(k) === 1 ? 0.55 : 0.25) }}>
          {text}
        </div>
      ))}
      <div
        data-el="title"
        data-kind="content"
        style={{ position: "absolute", top: 960 - size * 0.43, left: SAFE_BOX.x, width: SAFE_BOX.width, textAlign: "center", color: "#fff", filter: `blur(${(1 - inP) * 8}px)`, transform: `scale(${0.6 + 0.4 * inP})` }}
      >
        <div style={{ ...base, textShadow: "0 0 30px rgba(0,0,0,0.5), 0 0 60px rgba(255,59,92,0.35)" }}>{text}</div>
        {sub ? <div style={{ fontFamily: FONTS.Bebas, fontSize: 44, letterSpacing: 12, marginTop: 18, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ brand = myBrand, debugSafeZones, probe }) => (
  <ReelFrame brand={{ ...brand, colors: { ...brand.colors, bg: "#000" } }} debugSafeZones={debugSafeZones} probe={probe}>
    <Music src="music/flash-bed.wav" level={1} fadeInFrames={2} fadeOutFrames={20} />
    <SfxTrack cues={SFX} />
    <Sequence durationInFrames={at(INTRO)}>
      <RouteIntro />
    </Sequence>
    {SHOTS.map((s, i) => {
      const from = at(START_BEAT[i]);
      const frames = at(START_BEAT[i] + s.b) - from + (i === SHOTS.length - 1 ? 20 : 0);
      const section = SECTION.has(START_BEAT[i]) || i === 0;
      return (
        <Sequence key={i} from={from} durationInFrames={frames} name={s.m}>
          <ShotView shot={s} idx={i} frames={frames} section={section} />
          <Flash strong={section} />
        </Sequence>
      );
    })}
    {TITLES.map(([b, n, text, sub], i) => {
      const last = i === TITLES.length - 1;
      return (
        <Sequence key={`t${i}`} from={at(b)} durationInFrames={at(b + n) - at(b) + (last ? 20 : 0)} name={`title:${text}`}>
          <EchoTitle text={text} sub={sub} frames={at(b + n) - at(b)} hold={last} />
        </Sequence>
      );
    })}
    <Grain opacity={0.06} />
    <Sequence from={durationInFrames - 22}>
      <FadeOut />
    </Sequence>
  </ReelFrame>
);

const FadeOut: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, 22], [0, 1], { extrapolateRight: "clamp" }) }} />;
};

// keep B referenced for readers tuning the timing: one beat = B frames
export const FRAMES_PER_BEAT = B;

/** Same reel reading the full-resolution media (public/travel/stjohns-4k/). Render with --scale=2 for 2160x3840. */
export const Reel4K: React.FC<ReelProps> = (props) => (
  <MediaRoot.Provider value="travel/stjohns-4k/">
    <Reel {...props} />
  </MediaRoot.Provider>
);
