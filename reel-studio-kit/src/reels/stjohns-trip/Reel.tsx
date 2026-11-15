// Reel "stjohns-trip": cinematic travel reel, Toronto -> St. John's, NL. Music only, no voice.
// Everything comes from public/travel/stjohns/clips.json, so adding a photo or video is:
//   1. copy the file into public/travel/stjohns/
//   2. add a line to "clips" in clips.json: { "src": "travel/stjohns/<file>", "beats": 4 }
//      optional: "kicker"/"title"/"pos" ("top" | "bottom") for a location title,
//                "trimStart" (seconds, videos), "whoosh": true, "end": true (the closing shot)
//   3. npm run render -- stjohns-trip
// One beat = 60/bpm seconds (0.6 s at 100 bpm); cuts land on the beat of the music bed.
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { brand as myBrand } from "../../brand";
import { Music, ReelFrame, SfxTrack, type ReelProps, type SfxCue } from "../../components";
import { FPS, SAFE, SAFE_BOX } from "../../layout";
import { SANS, SERIF } from "../recharge-paper/paper";
import manifest from "../../../public/travel/stjohns/clips.json";

type Clip = {
  src: string;
  beats: number;
  trimStart?: number;
  kicker?: string;
  title?: string;
  pos?: "top" | "bottom";
  whoosh?: boolean;
  end?: boolean;
};

const CLIPS = manifest.clips as Clip[];
const BEAT = Math.round((60 / manifest.bpm) * FPS); // frames per beat (18 at 100 bpm)
const FADE = 6; // crossfade frames
const TAIL = 12; // black at the very end

// Start frame of every clip, cut on the beat.
const STARTS = CLIPS.reduce<number[]>((acc, c, i) => [...acc, i === 0 ? 0 : acc[i - 1] + CLIPS[i - 1].beats * BEAT], []);
export const durationInFrames = STARTS[STARTS.length - 1] + CLIPS[CLIPS.length - 1].beats * BEAT + TAIL;

const isVideo = (src: string) => /\.(mp4|mov|webm)$/i.test(src);

const SFX: SfxCue[] = CLIPS.flatMap((c, i) => (c.whoosh ? [{ name: "whoosh" as const, at: Math.max(0, STARTS[i] - 8), volume: 0.22 }] : []));

/** One photo or video filling the frame, with a slow push-in (Ken Burns) and a crossfade in. */
const Shot: React.FC<{ clip: Clip; index: number; frames: number }> = ({ clip, index, frames }) => {
  const f = useCurrentFrame();
  const fadeIn = index === 0 ? 1 : interpolate(f, [0, FADE], [0, 1], { extrapolateRight: "clamp" });
  // alternate zoom in / zoom out and a small drift so consecutive shots don't move the same way
  const zIn = index % 2 === 0;
  const scale = interpolate(f, [0, frames + FADE], zIn ? [1.0, 1.07] : [1.07, 1.0]);
  const drift = interpolate(f, [0, frames + FADE], [0, index % 3 === 0 ? -14 : 14]);
  const fill: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
  return (
    <AbsoluteFill data-el="shot" data-kind="content" data-fullbleed="" style={{ opacity: fadeIn, overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${drift}px)` }}>
        {isVideo(clip.src) ? (
          <OffthreadVideo src={staticFile(clip.src)} muted startFrom={Math.round((clip.trimStart ?? 0) * FPS)} style={fill} />
        ) : (
          <Img src={staticFile(clip.src)} style={fill} />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Clean location title: small spaced kicker + big serif name, fades and rises in. */
const LocationTitle: React.FC<{ kicker?: string; title: string; pos?: "top" | "bottom"; frames: number; big?: boolean }> = ({ kicker, title, pos = "top", frames, big }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = big ? 1 : interpolate(f, [frames - 8, frames + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = (1 - inP) * 24;
  const top = pos === "top" ? SAFE.top + 70 : undefined;
  const bottom = pos === "bottom" ? SAFE.bottom + 60 : undefined;
  return (
    <>
      <AbsoluteFill
        style={{
          background: pos === "top" ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 38%)" : "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 38%)",
          opacity: inP * outP,
        }}
      />
      <div
        data-el="title"
        data-kind="content"
        style={{ position: "absolute", left: SAFE_BOX.x, width: SAFE_BOX.width, top, bottom, textAlign: "center", opacity: inP * outP, transform: `translateY(${y}px)`, color: "#fff", textShadow: "0 4px 24px rgba(0,0,0,0.45)" }}
      >
        {kicker ? <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: big ? 30 : 28, letterSpacing: 9, textTransform: "uppercase", opacity: 0.92 }}>{kicker}</div> : null}
        <div style={{ fontFamily: SERIF, fontSize: big ? 112 : 84, lineHeight: 1.04, marginTop: 10 }}>{title}</div>
        <div style={{ width: 90, height: 3, background: "#fff", margin: "22px auto 0", opacity: 0.85, transform: `scaleX(${inP})` }} />
      </div>
    </>
  );
};

const FadeToBlack: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(f, [0, TAIL + 18], [0, 1], { extrapolateRight: "clamp" }) }} />;
};

export const Reel: React.FC<ReelProps> = ({ brand = myBrand, debugSafeZones, probe }) => (
  <ReelFrame brand={{ ...brand, colors: { ...brand.colors, bg: "#000" } }} debugSafeZones={debugSafeZones} probe={probe}>
    <Music src={manifest.music} level={1} fadeInFrames={10} fadeOutFrames={40} />
    <SfxTrack cues={SFX} />
    {CLIPS.map((c, i) => {
      const frames = c.beats * BEAT + (c.end ? TAIL : 0);
      return (
        <Sequence key={i} from={STARTS[i]} durationInFrames={frames + (i < CLIPS.length - 1 ? FADE : 0)} name={c.src.split("/").pop()}>
          <Shot clip={c} index={i} frames={frames} />
          {c.end ? (
            <LocationTitle kicker={manifest.kicker} title={manifest.title} pos="top" frames={frames} big />
          ) : c.title ? (
            <LocationTitle kicker={c.kicker} title={c.title} pos={c.pos} frames={c.beats * BEAT} />
          ) : null}
        </Sequence>
      );
    })}
    <Sequence from={durationInFrames - TAIL - 18}>
      <FadeToBlack />
    </Sequence>
  </ReelFrame>
);
