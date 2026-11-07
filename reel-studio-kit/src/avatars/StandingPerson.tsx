// A standing, full-body presenter in semi-realistic flat illustration (SVG).
// Same contract as the other avatars: mouth (0-1) from the voice, blinking,
// and gesture poses from the reel's cue list ({ at: seconds, pose: "explain" }).
// The box is 1 : 3 (width : height); pass the height as `size`.
// Edit the colour constants to restyle; the shirt uses the brand accent.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useBrand } from "../brand-context";
import type { PoseCue } from "./SpritePlayer";

const SKIN = "#C68A5E";
const SKIN_LIGHT = "#D9A27A";
const SKIN_DARK = "#A06E48";
const HAIR = "#1B1512";
const HAIR_LIGHT = "#3A2E28";
const JEANS = "#2E4A6E";
const JEANS_DARK = "#22374F";
const SHOE = "#2A2624";
const LIPS = "#9A5544";

type Arm = { upper: number; fore: number; finger?: boolean; thumb?: boolean };
type Pose = { l: Arm; r: Arm };

// Angles in degrees from straight down; positive = away from the body.
const down: Arm = { upper: 6, fore: 3 };
const POSES: Record<string, Pose> = {
  idle: { l: down, r: down },
  explain: { l: { upper: 12, fore: 135 }, r: { upper: 14, fore: 140 } },
  "finger-up": { l: down, r: { upper: 12, fore: 172, finger: true } },
  one: { l: down, r: { upper: 12, fore: 172, finger: true } },
  two: { l: { upper: 12, fore: 168, finger: true }, r: { upper: 12, fore: 172, finger: true } },
  three: { l: down, r: { upper: 12, fore: 172, finger: true } },
  "point-right": { l: down, r: { upper: 30, fore: 100, finger: true } },
  "point-left": { l: { upper: 30, fore: 100, finger: true }, r: down },
  "point-down": { l: down, r: { upper: 24, fore: 36, finger: true } },
  shrug: { l: { upper: 20, fore: 140 }, r: { upper: 28, fore: 148 } },
  "thumbs-up": { l: down, r: { upper: 12, fore: 160, thumb: true } },
  present: { l: down, r: { upper: 34, fore: 110 } },
  thinking: { l: { upper: -12, fore: -150 }, r: { upper: -14, fore: -160 } },
  "arms-crossed": { l: { upper: -12, fore: -150 }, r: { upper: -14, fore: -160 } },
  wave: { l: down, r: { upper: 38, fore: 165 } },
};
const pick = (name: string | number): Pose => (typeof name === "string" && POSES[name]) || POSES.idle;

/** 0 = eyes open, 1 = eyes shut. A quick blink about every 3 seconds. */
const blinkAt = (frame: number) => {
  const p = (frame + 40) % 96;
  return p < 6 ? 1 - Math.abs(p - 3) / 3 : 0;
};

const UPPER = 150;
const FORE = 132;
const BLEND = 9;

type Props = { mouth: number; cues?: PoseCue[]; size?: number; style?: React.CSSProperties };

export const StandingPerson: React.FC<Props> = ({ mouth, cues = [{ at: 0, pose: "idle" }], size = 1020, style }) => {
  const b = useBrand();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shirt = b.colors.accent;

  const sorted = [...cues].sort((x, y) => x.at - y.at);
  let i = 0;
  for (let k = 0; k < sorted.length; k++) if (sorted[k].at <= t) i = k;
  const cur = sorted[i] ?? { at: 0, pose: "idle" };
  const prev = sorted[i - 1] ?? cur;
  const raw = interpolate(frame - Math.round(cur.at * fps), [0, BLEND], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mix = raw * raw * (3 - 2 * raw); // ease in-out
  const a = pick(prev.pose);
  const z = pick(cur.pose);
  const lerp = (p: number, q: number) => p + (q - p) * mix;
  const wave = cur.pose === "wave" ? Math.sin(frame / 3) * 12 : 0;
  const idleSway = Math.sin(frame / 20) * 2;
  const arm = (p: Arm, q: Arm, extra = 0): Arm => ({
    upper: lerp(p.upper, q.upper) + idleSway * 0.4,
    fore: lerp(p.fore, q.fore) + extra + idleSway,
    finger: mix > 0.6 ? q.finger : p.finger,
    thumb: mix > 0.6 ? q.thumb : p.thumb,
  });
  const L = arm(a.l, z.l);
  const R = arm(a.r, z.r, wave);

  const blink = blinkAt(frame);
  const breathe = Math.sin(frame / 18) * 2.5;
  const headTilt = Math.sin(frame / 27) * 1.8;
  const open = Math.max(0, Math.min(1, mouth));

  const drawArm = (side: 1 | -1, s: Arm) => {
    const sx = 150 + side * 58;
    const sy = 272;
    const r1 = (s.upper * Math.PI) / 180;
    const r2 = (s.fore * Math.PI) / 180;
    const ex = sx + side * UPPER * Math.sin(r1);
    const ey = sy + UPPER * Math.cos(r1);
    const mx = sx + side * UPPER * 0.55 * Math.sin(r1);
    const my = sy + UPPER * 0.55 * Math.cos(r1);
    const hx = ex + side * FORE * Math.sin(r2);
    const hy = ey + FORE * Math.cos(r2);
    const ux = Math.sin(r2) * side;
    const uy = Math.cos(r2);
    const fx = hx + ux * 26;
    const fy = hy + uy * 26;
    return (
      <g>
        {/* upper arm: skin, then the sleeve over its top half */}
        <path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={SKIN} strokeWidth="34" strokeLinecap="round" />
        <path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={SKIN_DARK} strokeWidth="8" strokeLinecap="round" opacity="0.25" transform={`translate(${side * 8} 0)`} />
        <path d={`M${sx} ${sy} L${mx} ${my}`} stroke={shirt} strokeWidth="50" strokeLinecap="round" />
        <path d={`M${sx} ${sy} L${mx} ${my}`} stroke="#000" strokeWidth="12" strokeLinecap="round" opacity="0.12" transform={`translate(${side * 12} 2)`} />
        {/* forearm */}
        <path d={`M${ex} ${ey} L${hx} ${hy}`} stroke={SKIN} strokeWidth="30" strokeLinecap="round" />
        <path d={`M${ex} ${ey} L${hx} ${hy}`} stroke={SKIN_LIGHT} strokeWidth="7" strokeLinecap="round" opacity="0.6" transform={`translate(${-side * 6} 0)`} />
        {/* hand */}
        {s.finger ? <path d={`M${hx} ${hy} L${fx} ${fy}`} stroke={SKIN} strokeWidth="9" strokeLinecap="round" /> : null}
        {s.thumb ? <path d={`M${hx - 4} ${hy - 6} L${hx - 4} ${hy - 30}`} stroke={SKIN} strokeWidth="10" strokeLinecap="round" /> : null}
        <ellipse cx={hx + ux * 6} cy={hy + uy * 6} rx="19" ry="21" fill={SKIN} transform={`rotate(${(-Math.atan2(ux, uy) * 180) / Math.PI} ${hx} ${hy})`} />
        <ellipse cx={hx + ux * 8 + 4} cy={hy + uy * 8} rx="7" ry="10" fill={SKIN_DARK} opacity="0.3" />
      </g>
    );
  };

  const w = size / 3;
  return (
    <div data-el="avatar" data-kind="avatar" style={{ width: w, height: size, ...style }}>
      <svg viewBox="0 0 300 900" width={w} height={size} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="sp-shirt" x1="0" x2="1">
            <stop offset="0" stopColor={shirt} />
            <stop offset="0.55" stopColor={shirt} />
            <stop offset="1" stopColor="#000" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="sp-jeans" x1="0" x2="1">
            <stop offset="0" stopColor={JEANS} />
            <stop offset="1" stopColor={JEANS_DARK} />
          </linearGradient>
          <radialGradient id="sp-face" cx="0.42" cy="0.4" r="0.7">
            <stop offset="0" stopColor={SKIN_LIGHT} />
            <stop offset="0.7" stopColor={SKIN} />
            <stop offset="1" stopColor={SKIN_DARK} />
          </radialGradient>
          <linearGradient id="sp-hair" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor={HAIR_LIGHT} />
            <stop offset="0.5" stopColor={HAIR} />
          </linearGradient>
        </defs>

        {/* ground shadow */}
        <ellipse cx="150" cy="888" rx="100" ry="11" fill="#000" opacity="0.14" />

        {/* legs and shoes */}
        <path d="M96 516 L150 516 L147 864 L106 864 Z" fill="url(#sp-jeans)" />
        <path d="M150 516 L204 516 L194 864 L153 864 Z" fill="url(#sp-jeans)" />
        <path d="M149 540 L148 860" stroke={JEANS_DARK} strokeWidth="3" opacity="0.8" />
        <path d="M118 700 Q128 706 140 700" stroke="#000" strokeWidth="2" opacity="0.15" fill="none" />
        <path d="M160 700 Q172 706 184 700" stroke="#000" strokeWidth="2" opacity="0.15" fill="none" />
        <path d="M104 858 Q104 884 128 886 L150 886 Q152 868 146 858 Z" fill={SHOE} />
        <path d="M154 858 Q148 868 150 886 L174 886 Q198 884 196 858 Z" fill={SHOE} />
        <path d="M106 880 L148 880" stroke="#fff" strokeWidth="3" opacity="0.5" />
        <path d="M152 880 L194 880" stroke="#fff" strokeWidth="3" opacity="0.5" />

        <g transform={`translate(0 ${breathe * 0.3})`}>
          {/* belt */}
          <rect x="94" y="508" width="112" height="16" rx="3" fill="#3B2A20" />
          <rect x="143" y="509" width="14" height="14" rx="2" fill="#B9A27A" />

          {/* torso (t-shirt) */}
          <path d="M92 266 Q150 244 208 266 Q218 300 214 380 Q212 450 206 512 L94 512 Q88 450 86 380 Q82 300 92 266 Z" fill={shirt} />
          <path d="M196 272 Q214 300 212 380 Q210 450 204 512 L186 512 Q194 450 194 380 Q196 310 186 276 Z" fill="#000" opacity="0.10" />
          <path d="M120 330 Q128 420 124 500" stroke="#000" strokeWidth="3" opacity="0.08" fill="none" />
          <path d="M182 320 Q176 410 184 500" stroke="#000" strokeWidth="4" opacity="0.10" fill="none" />
          {/* collar */}
          <path d="M126 252 Q150 290 174 252 Q150 266 126 252 Z" fill={SKIN_DARK} />
          <path d="M124 250 Q150 296 176 250" stroke="#000" strokeWidth="5" opacity="0.18" fill="none" />
          <circle cx="182" cy="330" r="9" fill={b.colors.accent2} opacity="0.85" />

          {/* arms */}
          {drawArm(-1, L)}
          {drawArm(1, R)}

          {/* neck */}
          <path d="M126 200 L174 200 L176 258 Q150 272 124 258 Z" fill={SKIN} />
          <path d="M126 222 Q150 244 174 222 L174 238 Q150 256 126 238 Z" fill={SKIN_DARK} opacity="0.55" />

          {/* head */}
          <g transform={`translate(150 226) scale(1.15) translate(-150 -214) rotate(${headTilt} 150 200)`}>
            {/* ears */}
            <ellipse cx="97" cy="150" rx="10" ry="17" fill={SKIN_DARK} />
            <ellipse cx="203" cy="150" rx="10" ry="17" fill={SKIN_DARK} />
            <ellipse cx="98" cy="150" rx="5" ry="10" fill={SKIN} />
            <ellipse cx="202" cy="150" rx="5" ry="10" fill={SKIN} />
            {/* face */}
            <path d="M100 128 Q100 80 150 78 Q200 80 200 128 Q202 170 186 194 Q170 214 150 216 Q130 214 114 194 Q98 170 100 128 Z" fill="url(#sp-face)" />
            {/* stubble / short beard */}
            <path d="M104 150 Q108 196 132 210 Q150 218 168 210 Q192 196 196 150 Q192 186 172 196 Q150 204 128 196 Q108 186 104 150 Z" fill={HAIR} opacity="0.55" />
            <path d="M134 184 Q150 178 166 184 Q160 190 150 189 Q140 190 134 184 Z" fill={HAIR} opacity="0.6" />
            {/* hair */}
            <path d="M98 132 Q92 70 140 60 Q176 54 196 74 Q210 92 202 132 Q198 106 184 96 Q164 104 136 98 Q112 100 104 112 Q100 120 98 132 Z" fill="url(#sp-hair)" />
            <path d="M120 74 Q150 62 182 76" stroke="#5A4A40" strokeWidth="4" opacity="0.6" fill="none" strokeLinecap="round" />
            {/* eyebrows */}
            <path d="M114 120 Q126 112 140 118" stroke={HAIR} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M160 118 Q174 112 186 120" stroke={HAIR} strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* eyes */}
            {[127, 173].map((cx) => (
              <g key={cx}>
                <ellipse cx={cx} cy="137" rx="11" ry={7.5 * (1 - 0.92 * blink)} fill="#FAF6F0" />
                {blink < 0.5 ? (
                  <>
                    <circle cx={cx + 1} cy="137" r="5.6" fill="#4A2E1C" />
                    <circle cx={cx + 1} cy="137" r="2.8" fill="#120C08" />
                    <circle cx={cx - 1} cy="135" r="1.6" fill="#fff" />
                  </>
                ) : null}
                <path d={`M${cx - 12} ${137 - 6 * (1 - blink)} Q${cx} ${130 - 4 * (1 - blink) + 8 * blink} ${cx + 12} ${137 - 6 * (1 - blink)}`} stroke="#2A1C14" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </g>
            ))}
            {/* nose */}
            <path d="M150 140 Q146 160 142 166 Q150 172 158 166" stroke={SKIN_DARK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M152 142 Q156 156 156 162" stroke={SKIN_LIGHT} strokeWidth="3" fill="none" opacity="0.7" strokeLinecap="round" />
            {/* mouth */}
            {open < 0.08 ? (
              <>
                <path d="M136 187 Q150 193 164 187" stroke={LIPS} strokeWidth="4.5" fill="none" strokeLinecap="round" />
                <path d="M140 193 Q150 197 160 193" stroke={LIPS} strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round" />
              </>
            ) : (
              <>
                <ellipse cx="150" cy={189 + 3 * open} rx={14 - 2 * open} ry={3 + 9 * open} fill="#3A1A14" stroke={LIPS} strokeWidth="3" />
                {open > 0.3 ? <rect x={140} y={186} width="20" height={2 + 2 * open} rx="1" fill="#F4EEE6" /> : null}
                {open > 0.5 ? <ellipse cx="150" cy={193 + 6 * open} rx="7" ry={2 + 3 * open} fill="#C9615A" /> : null}
              </>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
