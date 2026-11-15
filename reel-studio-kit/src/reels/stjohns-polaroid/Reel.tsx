// Reel "stjohns-polaroid": scrapbook "photo dump". 110 bpm bright pop bed.
// Polaroids drop onto a paper table on the beat (tape on top, handwritten Caveat captions),
// the last two stay underneath like a pile. Marker-pen title and doodles drawn on.
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame } from "remotion";
import { brand as myBrand } from "../../brand";
import { FONTS } from "../../fonts";
import { Music, ReelFrame, SfxTrack, type ReelProps, type SfxCue } from "../../components";
import { FPS, SAFE_BOX } from "../../layout";
import { Grain, MEDIA, Media, beats, rand, type MediaKey } from "../stjohns-trip/shared";

const { at } = beats(110);
const INTRO = 4;
const PER = 3; // beats per polaroid
const OUTRO = 6;

type Snap = { m: MediaKey; cap: string; trim?: number };
const SNAPS: Snap[] = [
  { m: "letsgoo", cap: "lets gooo!!" },
  { m: "aircanada1", cap: "YYZ, 9:19 am" },
  { m: "taxi", cap: "taxiing...", trim: 2 },
  { m: "takeoff", cap: "wheels up" },
  { m: "air2", cap: "toronto from up here" },
  { m: "snack", cap: "snack time :)" },
  { m: "landing", cap: "hello St. John's!" },
  { m: "pippy", cap: "Pippy Park" },
  { m: "fort", cap: "Fort Townshend" },
  { m: "cityhall", cap: "City Hall at night" },
  { m: "signal", cap: "Signal Hill views" },
];
const startOf = (i: number) => at(INTRO + i * PER);
const END = INTRO + SNAPS.length * PER + OUTRO;
export const durationInFrames = at(END);

const SFX: SfxCue[] = SNAPS.map((_, i) => ({ name: "pop" as const, at: startOf(i) + 7, volume: 0.35 }));

// polaroid geometry (9:16 photo, kept whole)
const PW = 548;
const PH = 974;
const PAD = 26;
const STRIP = 140;
const CW = PW + PAD * 2;
const CH = PH + PAD + STRIP;
const LEFT = (1080 - CW) / 2;
const TOP = 300;

const tilt = (i: number) => (rand(i * 5 + 1) - 0.5) * 9;
const offX = (i: number) => (rand(i * 9 + 2) - 0.5) * 40;

const Polaroid: React.FC<{ snap: Snap; i: number }> = ({ snap, i }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f, fps: FPS, config: { damping: 13, stiffness: 140, mass: 0.8 } });
  const y = interpolate(s, [0, 1], [-1500, 0]);
  const rot = interpolate(s, [0, 1], [tilt(i) * 3 + (i % 2 ? 18 : -18), tilt(i)]);
  const shadow = interpolate(s, [0, 1], [70, 28]);
  // ink caption writes on after landing
  const write = interpolate(f, [10, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: LEFT + offX(i),
        top: TOP,
        width: CW,
        height: CH,
        background: "#fdfcf7",
        boxShadow: `0 ${shadow}px ${shadow * 2}px rgba(60,40,20,0.35), 0 2px 4px rgba(0,0,0,0.15)`,
        transform: `translateY(${y}px) rotate(${rot}deg)`,
      }}
    >
      <div style={{ position: "absolute", left: PAD, top: PAD, width: PW, height: PH, overflow: "hidden", background: "#222" }}>
        <Media src={MEDIA[snap.m]} trimStart={snap.trim} />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 40px rgba(0,0,0,0.25)" }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: CW,
          top: PAD + PH + 18,
          textAlign: "center",
          fontFamily: FONTS.Caveat,
          fontWeight: 700,
          fontSize: 68,
          color: "#24324a",
          clipPath: `inset(0 ${100 - write * 100}% 0 0)`,
          whiteSpace: "nowrap",
        }}
      >
        {snap.cap}
      </div>
      {/* tape */}
      <div style={{ position: "absolute", left: CW / 2 - 90, top: -26, width: 180, height: 56, background: "rgba(246,226,170,0.78)", transform: `rotate(${-tilt(i) * 0.8 - 3}deg)`, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }} />
    </div>
  );
};

/** Hand-drawn style underline / heart, drawn on with a stroke reveal. */
const Doodle: React.FC<{ d: string; len: number; from: number; dur: number; color: string; width?: number; style?: React.CSSProperties; w: number; h: number }> = ({ d, len, from, dur, color, width = 8, style, w, h }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  return (
    <svg width={w} height={h} style={{ position: "absolute", overflow: "visible", ...style }}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

const Paper: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 35%, #f6efe2 0%, #eadfcb 70%, #dccdb2 100%)" }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(120,90,50,0.10) 1.6px, transparent 1.6px)", backgroundSize: "34px 34px" }} />
    <Grain opacity={0.1} blend="multiply" />
  </AbsoluteFill>
);

const IntroTitle: React.FC = () => {
  const f = useCurrentFrame();
  const inP = spring({ frame: f, fps: FPS, config: { damping: 12, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <div data-el="title" data-kind="content" style={{ position: "absolute", left: SAFE_BOX.x, width: SAFE_BOX.width, top: 640, textAlign: "center" }}>
        <div style={{ display: "inline-block", fontFamily: FONTS.Marker, fontSize: 128, color: "#e2453c", transform: `rotate(-4deg) scale(${inP})`, lineHeight: 1 }}>photo dump</div>
        <div style={{ fontFamily: FONTS.Caveat, fontWeight: 700, fontSize: 72, color: "#24324a", marginTop: 70, opacity: interpolate(f, [12, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          St. John's, NL · Nov 2026
        </div>
      </div>
      <Doodle d="M 0 20 C 120 0, 260 34, 420 12 S 640 20, 700 6" len={760} from={8} dur={14} color="#e2453c" w={720} h={40} style={{ left: 180, top: 830 }} />
      <Doodle d="M 0 60 C 60 0, 140 0, 200 40 L 230 30 L 214 62 L 196 34" len={330} from={18} dur={14} color="#24324a" width={6} w={240} h={80} style={{ left: 760, top: 540 }} />
    </AbsoluteFill>
  );
};

const OutroTitle: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `rgba(246,239,226,${0.82 * o})` }}>
      <div data-el="title" data-kind="content" style={{ position: "absolute", left: SAFE_BOX.x, width: SAFE_BOX.width, top: 700, textAlign: "center", opacity: o }}>
        <div style={{ fontFamily: FONTS.Caveat, fontWeight: 700, fontSize: 88, color: "#24324a", lineHeight: 1.05 }}>see you again,</div>
        <div style={{ display: "inline-block", fontFamily: FONTS.Marker, fontSize: 116, color: "#e2453c", transform: "rotate(-3deg)", marginTop: 20 }}>St. John's</div>
      </div>
      <Doodle d="M 60 100 C 0 50, 20 0, 60 20 C 100 0, 120 50, 60 100 Z" len={330} from={8} dur={16} color="#e2453c" width={7} w={120} h={110} style={{ left: 480, top: 1090 }} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = ({ brand = myBrand, debugSafeZones, probe }) => (
  <ReelFrame brand={{ ...brand, colors: { ...brand.colors, bg: "#efe6da" } }} debugSafeZones={debugSafeZones} probe={probe}>
    <Music src="music/polaroid-bed.wav" level={1} fadeInFrames={4} fadeOutFrames={30} />
    <SfxTrack cues={SFX} />
    <Paper />
    <Sequence durationInFrames={at(INTRO)}>
      <IntroTitle />
    </Sequence>
    {SNAPS.map((s, i) => {
      // each polaroid stays for its own slot plus the next two (pile), then leaves
      const from = startOf(i);
      const until = i === SNAPS.length - 1 ? durationInFrames : Math.min(durationInFrames, startOf(i + 3));
      const own = (i + 1 < SNAPS.length ? startOf(i + 1) : at(INTRO + SNAPS.length * PER)) - from;
      return (
        <Sequence key={i} from={from} durationInFrames={until - from} name={s.m}>
          <Polaroid snap={s} i={i} />
          {/* only the top polaroid is measured by the layout check */}
          <Sequence durationInFrames={own}>
            <ProbeBox i={i} />
          </Sequence>
        </Sequence>
      );
    })}
    <Sequence from={at(INTRO + SNAPS.length * PER)}>
      <OutroTitle />
    </Sequence>
  </ReelFrame>
);

/** Invisible box with the settled polaroid's bounds, so `npm run check` sees the top card. */
const ProbeBox: React.FC<{ i: number }> = ({ i }) => (
  <div data-el="card" data-kind="content" style={{ position: "absolute", left: LEFT + offX(i), top: TOP, width: CW, height: CH, pointerEvents: "none" }} />
);
