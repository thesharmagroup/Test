// "Paper" look: cream grid paper, red accent, serif headings, numbered cards
// sliding in over a blurred stack, progress dots, and big kinetic words next
// to the character. Reusable for other reels: import from here.
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Brand } from "../../brand";
import { FONTS } from "../../fonts";
import { usePop } from "../../components/pop";
import type { Word } from "../../timing";

export const RED = "#D3242C";
export const INK = "#1C1715";
export const PAPER = "#EFE6DA";
export const SERIF = FONTS.DMSerif;
export const SANS = FONTS.Inter;

export const paperBrand = (handle: string): Brand => ({
  colors: { bg: PAPER, surface: "#FFFFFF", text: INK, accent: RED, accent2: INK },
  font: "Inter",
  radius: 32,
  shadow: true,
  handle,
});

/** Grid paper background. */
export const PaperGrid: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: PAPER,
      backgroundImage: `linear-gradient(${INK}12 2px, transparent 2px), linear-gradient(90deg, ${INK}12 2px, transparent 2px)`,
      backgroundSize: "64px 64px",
      backgroundPosition: "-2px -2px",
    }}
  />
);

/** Red bar + serif series title + handle, top left. */
export const Header: React.FC<{ title: string; handle: string; x: number; y: number; width: number }> = ({ title, handle, x, y, width }) => (
  <div data-el="title" data-kind="content" style={{ position: "absolute", left: x, top: y, width, display: "flex", gap: 22 }}>
    <div style={{ width: 9, background: RED, borderRadius: 2 }} />
    <div>
      <div style={{ fontFamily: SERIF, fontSize: 62, lineHeight: 1.05, color: INK }}>{title}</div>
      <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 600, color: RED, marginTop: 6 }}>{handle}</div>
    </div>
  </div>
);

/** "#01  Wajah one" pill above a card. */
export const NumberPill: React.FC<{ tag: string; text: string; at: number }> = ({ tag, text, at }) => {
  const { style } = usePop(at);
  return (
    <div data-el="pill" data-kind="content" style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ background: RED, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 38, padding: "8px 24px", borderRadius: 40 }}>{tag}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: INK }}>{text}</div>
    </div>
  );
};

/** Slide in from the right with a soft spring; returns style + progress. */
const useSlide = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 120, mass: 0.9 } });
  return {
    p,
    style: {
      opacity: interpolate(frame - at, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      transform: `translateX(${(1 - p) * 420}px) rotate(${(1 - p) * 6}deg)`,
    } as React.CSSProperties,
  };
};

/** Blurred cards stacked behind the main one, peeking out on the right. */
export const GhostStack: React.FC<{ at: number }> = ({ at }) => {
  const { style } = useSlide(at - 4);
  return (
    <div style={{ ...style, position: "absolute", inset: 0 }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 250 + i * 80,
            top: 60 + i * 24,
            width: 320,
            height: 380,
            background: "#FFFFFF",
            borderRadius: 32,
            opacity: 0.55 - i * 0.15,
            filter: "blur(6px)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.10)",
            transform: `rotate(${4 + i * 3}deg)`,
          }}
        />
      ))}
    </div>
  );
};

/** The numbered white card: red number dot, dark icon tile, underlined title, body, footer. */
export const InfoCard: React.FC<{
  n: string;
  icon: string;
  title: string;
  at: number;
  footer?: string;
  children?: React.ReactNode;
  width?: number;
}> = ({ n, icon, title, at, footer, children, width = 500 }) => {
  const { style } = useSlide(at);
  return (
    <div
      data-el="card"
      data-kind="content"
      style={{
        ...style,
        position: "relative",
        width,
        background: "#FFFFFF",
        borderRadius: 36,
        padding: "36px 46px 30px 40px",
        boxShadow: "0 30px 70px rgba(60, 30, 10, 0.16), 0 6px 14px rgba(0,0,0,0.06)",
        fontFamily: SANS,
        color: INK,
      }}
    >
      <div style={{ position: "absolute", right: 18, top: 40, bottom: 40, width: 9, background: RED, borderRadius: 6 }} />
      <div style={{ position: "absolute", left: -18, top: -18, width: 66, height: 66, borderRadius: 33, background: RED, color: "#fff", fontWeight: 800, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(0,0,0,0.15)" }}>{n}</div>
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 30,
          background: INK,
          color: "#fff",
          fontWeight: 800,
          fontSize: icon.length > 2 ? 26 : 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ marginTop: 20, fontSize: 54, fontWeight: 900, letterSpacing: -1.5, lineHeight: 1 }}>
        <span style={{ borderBottom: `7px solid ${RED}`, paddingBottom: 2 }}>{title}</span>
      </div>
      <div style={{ marginTop: 18 }}>{children}</div>
      {footer ? (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `3px solid ${INK}14`, fontSize: 26, fontWeight: 600, opacity: 0.75 }}>{footer}</div>
      ) : null}
    </div>
  );
};

/** Pop-in that never scales above 100% (no overshoot), for text inside a card. */
const usePopIn = (at: number) => {
  const { progress, style } = usePop(at);
  return { ...style, transform: `translateY(${(1 - progress) * 30}px) scale(${Math.min(1, 0.6 + 0.4 * progress)})` } as React.CSSProperties;
};

/** Serif body line inside a card; pops on its word. */
export const Body: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const style = usePopIn(at);
  return <div style={{ ...style, transformOrigin: "left center", fontFamily: SERIF, fontSize: 40, lineHeight: 1.15, color: `${INK}CC` }}>{children}</div>;
};

/** Big red number line inside a card; counts up from `from`. */
export const Stat: React.FC<{ at: number; to: number; from?: number; prefix?: string; suffix?: string; frames?: number; label?: string }> = ({
  at,
  to,
  from,
  prefix = "",
  suffix = "",
  frames = 18,
  label,
}) => {
  const frame = useCurrentFrame();
  const style = usePopIn(at);
  const v = interpolate(frame - at, [0, frames], [from ?? to, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ ...style, transformOrigin: "left center", display: "flex", alignItems: "baseline", gap: 18, marginTop: 6 }}>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: prefix.length + suffix.length > 3 ? 78 : 88, color: RED, letterSpacing: -2, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
        {prefix}
        {Math.round(v)}
        {suffix}
      </div>
      {label ? <div style={{ fontFamily: SERIF, fontSize: 40, color: INK }}>{label}</div> : null}
    </div>
  );
};

/** Progress dots under the card; the active one is a red pill. */
export const Dots: React.FC<{ count: number; active: number }> = ({ count, active }) => (
  <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
    {Array.from({ length: count }, (_, i) => (
      <div key={i} style={{ width: i === active ? 44 : 14, height: 14, borderRadius: 7, background: i === active ? RED : `${INK}30` }} />
    ))}
  </div>
);

/** Tilted red stamp, e.g. "abhi confirm nahi". */
export const Stamp: React.FC<{ text: string; at: number; rotate?: number; style?: React.CSSProperties }> = ({ text, at, rotate = -7, style }) => {
  const pop = usePop(at);
  return (
    <div data-el="sticker" data-kind="content" data-overlap-ok="card" style={{ ...style, ...pop.style, transform: `${pop.style.transform} rotate(${rotate * pop.progress}deg)` }}>
      <div style={{ border: `5px solid ${RED}`, color: RED, background: "#FFFFFFEE", fontFamily: SANS, fontWeight: 900, fontSize: 34, padding: "8px 22px", borderRadius: 14, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {text}
      </div>
    </div>
  );
};

const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

// Filler words that never become the big red word.
const STOP = new Set("ab ka ki ke ko ne se hai hain tha aur ye wo yaani ek par mein sirf tak kar diye kiye ho gaya liye rupaye lagbhag abhi nahi hua laga rahe hona karo chahiye wapas kehti ke baad".split(" "));

/**
 * Kinetic captions next to the character: 1-3 words at a time, stacked.
 * The key word of each chunk is big, bold, red and uppercase; the rest are small serif.
 */
export const KineticWords: React.FC<{ words: Word[]; keywords: string[]; width: number; maxPerChunk?: number }> = ({ words, keywords, width, maxPerChunk = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const keys = new Set(keywords.map(clean));

  // Chunks break on punctuation or after maxPerChunk words.
  const chunks: number[][] = [];
  let cur: number[] = [];
  words.forEach((w, i) => {
    cur.push(i);
    if (/[.,?!:]$/.test(w.word) || cur.length >= maxPerChunk) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);

  const idx = chunks.findIndex((c, k) => t >= words[c[0]].start - 0.05 && (k === chunks.length - 1 || t < words[chunks[k + 1][0]].start - 0.05));
  if (idx < 0) return null;
  const chunk = chunks[idx];
  // Hold the last chunk a little after speech ends, then clear.
  if (t > words[chunk[chunk.length - 1]].end + 0.6) return null;

  // Key word: a listed keyword, else a number, else the longest word.
  const score = (i: number) => {
    const c = clean(words[i].word);
    return (keys.has(c) ? 100 : 0) + (/\d/.test(c) ? 50 : 0) + c.length;
  };
  const candidates = chunk.filter((i) => !STOP.has(clean(words[i].word)));
  const key = candidates.length ? candidates.reduce((a, b) => (score(b) > score(a) ? b : a), candidates[0]) : -1;

  return (
    <div data-el="captions" data-kind="caption" style={{ width, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      {chunk.map((i) => {
        const w = words[i];
        const shown = t >= w.start - 0.03;
        const p = spring({ frame: frame - Math.round(w.start * fps), fps, config: { damping: 11, stiffness: 190, mass: 0.7 } });
        const text = w.word.replace(/[,.:]$/, "");
        const isKey = i === key;
        const size = isKey ? Math.min(132, Math.floor(width / Math.max(3, text.length * 0.86))) : 62;
        return (
          <div
            key={i}
            style={{
              opacity: shown ? 1 : 0,
              transform: `translateY(${(1 - p) * 24}px) scale(${0.7 + 0.3 * p})`,
              fontFamily: isKey ? SANS : SERIF,
              fontWeight: isKey ? 900 : 400,
              fontSize: size,
              lineHeight: isKey ? 1 : 1.1,
              letterSpacing: isKey ? -1 : 0,
              color: isKey ? RED : INK,
              textTransform: isKey ? "uppercase" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};
