// Sound effects. Files live in public/sfx/ (made by `npm run sfx`, no samples or licences).
//   <Sfx name="whoosh" at={frame} />                    one-shot
//   <Sfx name="typing" at={frame} frames={20} />          loop file, cut after 20 frames
// Use absolute frames, like the rest of the kit. Keep effects well under the voice.
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

export type SfxName = "click" | "whoosh" | "pop" | "stamp" | "typing" | "counter" | "ding" | "success" | "alert";

const DEFAULT_VOLUME: Record<SfxName, number> = {
  click: 0.45,
  whoosh: 0.32,
  pop: 0.2,
  stamp: 0.55,
  typing: 0.32,
  counter: 0.22,
  ding: 0.35,
  success: 0.4,
  alert: 0.35,
};

export type SfxCue = { name: SfxName; at: number; frames?: number; volume?: number };

export const Sfx: React.FC<SfxCue> = ({ name, at, frames, volume }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={frames ? Math.max(1, Math.round(frames)) : undefined} layout="none" name={`sfx:${name}`}>
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume ?? DEFAULT_VOLUME[name]} />
  </Sequence>
);

/** A whole list of cues, e.g. built once per reel. */
export const SfxTrack: React.FC<{ cues: SfxCue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sfx key={i} {...c} />
    ))}
  </>
);
