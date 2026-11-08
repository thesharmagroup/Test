// Background music bed, ducked under the voice.
// `voice` is the per-frame loudness array (public/reels/<id>/mouth.json): when the voice
// is loud the music dips to `ducked`, in pauses it rises to `level`. Fades in and out.
import React from "react";
import { Audio, interpolate, staticFile, useVideoConfig } from "remotion";

type Props = {
  src: string;
  voice?: number[];
  level?: number;
  ducked?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
};

export const Music: React.FC<Props> = ({ src, voice, level = 0.16, ducked = 0.07, fadeInFrames = 15, fadeOutFrames = 45 }) => {
  const { durationInFrames } = useVideoConfig();
  // Smooth the loudness so the music does not pump on every syllable.
  const smooth = React.useMemo(() => {
    if (!voice?.length) return [];
    const out: number[] = [];
    let acc = 0;
    for (const v of voice) {
      const target = Math.min(1, v * 2.5);
      acc += (target > acc ? 0.35 : 0.06) * (target - acc);
      out.push(acc);
    }
    return out;
  }, [voice]);
  return (
    <Audio
      src={staticFile(src)}
      volume={(f) => {
        const duck = smooth.length ? smooth[Math.min(f, smooth.length - 1)] : 1;
        const base = level - (level - ducked) * duck;
        const fade = Math.min(
          interpolate(f, [0, fadeInFrames], [0, 1], { extrapolateRight: "clamp" }),
          interpolate(f, [durationInFrames - fadeOutFrames, durationInFrames], [1, 0], { extrapolateLeft: "clamp" }),
        );
        return base * fade;
      }}
    />
  );
};
