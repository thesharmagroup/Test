// A simple code-drawn presenter (half body) in plain SVG.
// Mouth opens from the voice loudness, eyes blink, body bobs, and the arms move
// between gesture poses from the same cue list the sprite avatars use
// ({ at: seconds, pose: "explain" }). Shirt colours come from your brand.
// Edit SKIN / HAIR below, or the shapes, to make the character yours.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brand-context";
import type { PoseCue } from "./SpritePlayer";

const SKIN = "#C98E62";
const SKIN_SHADE = "#B07850";
const HAIR = "#1F1A17";

type Arm = { upper: number; fore: number; finger?: boolean; thumb?: boolean };
type Pose = { l: Arm; r: Arm };

// Angles in degrees from straight down; positive = away from the body.
const down: Arm = { upper: 8, fore: 4 };
const POSES: Record<string, Pose> = {
  idle: { l: down, r: down },
  explain: { l: { upper: 28, fore: 118 }, r: { upper: 28, fore: 118 } },
  "finger-up": { l: down, r: { upper: 22, fore: 172, finger: true } },
  one: { l: down, r: { upper: 22, fore: 172, finger: true } },
  two: { l: { upper: 22, fore: 172, finger: true }, r: { upper: 22, fore: 172, finger: true } },
  "point-right": { l: down, r: { upper: 72, fore: 92, finger: true } },
  "point-down": { l: down, r: { upper: 36, fore: 40, finger: true } },
  shrug: { l: { upper: 42, fore: 148 }, r: { upper: 42, fore: 148 } },
  "thumbs-up": { l: down, r: { upper: 18, fore: 160, thumb: true } },
  present: { l: down, r: { upper: 52, fore: 104 } },
  thinking: { l: down, r: { upper: -26, fore: 205 } },
  wave: { l: down, r: { upper: 42, fore: 162 } },
};

const pick = (name: string | number): Pose => (typeof name === "string" && POSES[name]) || POSES.idle;

/** 0 = eyes open, 1 = eyes shut. A quick blink about every 3 seconds. */
const blinkAt = (frame: number) => {
  const p = (frame + 40) % 96;
  return p < 6 ? 1 - Math.abs(p - 3) / 3 : 0;
};

const UPPER = 64;
const FORE = 58;
const BLEND = 8; // frames to move from one pose to the next

type Props = { mouth: number; cues?: PoseCue[]; size?: number; style?: React.CSSProperties };

export const FlatPerson: React.FC<Props> = ({ mouth, cues = [{ at: 0, pose: "idle" }], size = 340, style }) => {
  const b = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Current and previous cue, so the arms glide instead of jumping.
  const sorted = [...cues].sort((x, y) => x.at - y.at);
  let i = 0;
  for (let k = 0; k < sorted.length; k++) if (sorted[k].at <= t) i = k;
  const cur = sorted[i] ?? { at: 0, pose: "idle" };
  const prev = sorted[i - 1] ?? cur;
  const mix = interpolate(frame - Math.round(cur.at * fps), [0, BLEND], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const a = pick(prev.pose);
  const z = pick(cur.pose);
  const lerp = (p: number, q: number) => p + (q - p) * mix;
  const wave = cur.pose === "wave" ? Math.sin(frame / 3) * 14 : 0;
  const arm = (p: Arm, q: Arm, extra = 0): Arm => ({
    upper: lerp(p.upper, q.upper),
    fore: lerp(p.fore, q.fore) + extra,
    finger: mix > 0.6 ? q.finger : p.finger,
    thumb: mix > 0.6 ? q.thumb : p.thumb,
  });
  const L = arm(a.l, z.l);
  const R = arm(a.r, z.r, wave);

  const blink = blinkAt(frame);
  const bob = Math.sin(frame / 14) * 4;
  const tilt = Math.sin(frame / 23) * 2;
  const open = Math.max(0, Math.min(1, mouth));
  const dark = b.colors.text;

  const drawArm = (side: 1 | -1, s: Arm) => {
    const sx = 200 + side * 88;
    const sy = 268;
    const r1 = (s.upper * Math.PI) / 180;
    const r2 = (s.fore * Math.PI) / 180;
    const ex = sx + side * UPPER * Math.sin(r1);
    const ey = sy + UPPER * Math.cos(r1);
    const hx = ex + side * FORE * Math.sin(r2);
    const hy = ey + FORE * Math.cos(r2);
    const fx = hx + side * 20 * Math.sin(r2);
    const fy = hy + 20 * Math.cos(r2);
    return (
      <g>
        <path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={b.colors.accent} strokeWidth="34" strokeLinecap="round" fill="none" />
        <path d={`M${ex} ${ey} L${hx} ${hy}`} stroke={SKIN} strokeWidth="26" strokeLinecap="round" fill="none" />
        {s.finger ? <path d={`M${hx} ${hy} L${fx} ${fy}`} stroke={SKIN} strokeWidth="9" strokeLinecap="round" /> : null}
        {s.thumb ? <path d={`M${hx} ${hy} L${hx} ${hy - 24}`} stroke={SKIN} strokeWidth="10" strokeLinecap="round" /> : null}
        <circle cx={hx} cy={hy} r="17" fill={SKIN} />
        <circle cx={hx} cy={hy} r="17" fill={SKIN_SHADE} opacity="0.25" />
      </g>
    );
  };

  return (
    <div data-el="avatar" data-kind="avatar" style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 400 400" width={size} height={size} style={{ overflow: "visible" }}>
        <g transform={`translate(0 ${bob})`}>
          {/* torso (t-shirt) */}
          <path d="M96 400 L96 318 Q96 252 160 246 L240 246 Q304 252 304 318 L304 400 Z" fill={b.colors.accent} />
          <path d="M172 246 Q200 274 228 246" fill={SKIN} />
          <circle cx="252" cy="300" r="10" fill={b.colors.accent2} />
          {/* arms behind/over torso */}
          {drawArm(-1, L)}
          {drawArm(1, R)}
          {/* neck */}
          <rect x="182" y="206" width="36" height="46" rx="14" fill={SKIN_SHADE} />
          {/* head */}
          <g transform={`rotate(${tilt} 200 150)`}>
            <circle cx="128" cy="154" r="14" fill={SKIN_SHADE} />
            <circle cx="272" cy="154" r="14" fill={SKIN_SHADE} />
            <ellipse cx="200" cy="148" rx="72" ry="80" fill={SKIN} />
            {/* light beard */}
            <path d="M134 162 Q140 230 200 234 Q260 230 266 162 Q256 214 200 216 Q144 214 134 162 Z" fill={HAIR} opacity="0.5" />
            {/* hair */}
            <path d="M126 150 Q118 70 200 62 Q284 66 274 150 Q266 108 238 100 Q208 116 162 104 Q136 114 126 150 Z" fill={HAIR} />
            {/* eyebrows */}
            <path d="M156 122 Q172 114 186 121" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M214 121 Q228 114 244 122" stroke={HAIR} strokeWidth="7" strokeLinecap="round" fill="none" />
            {/* eyes */}
            <ellipse cx="172" cy="146" rx="8" ry={10 * (1 - 0.9 * blink)} fill={dark} />
            <ellipse cx="228" cy="146" rx="8" ry={10 * (1 - 0.9 * blink)} fill={dark} />
            {blink < 0.3 ? (
              <>
                <circle cx="169" cy="142" r="2.6" fill="#fff" />
                <circle cx="225" cy="142" r="2.6" fill="#fff" />
              </>
            ) : null}
            {/* nose */}
            <path d="M200 152 Q194 172 202 176" stroke={SKIN_SHADE} strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* mouth */}
            {open < 0.08 ? (
              <path d="M182 196 Q200 208 218 196" fill="none" stroke={dark} strokeWidth="6" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx="200" cy={198 + 5 * open} rx={18 - 3 * open} ry={4 + 14 * open} fill="#3A1F1A" />
                {open > 0.45 ? <ellipse cx="200" cy={204 + 9 * open} rx="9" ry={3 + 4 * open} fill="#D9706B" /> : null}
              </>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
