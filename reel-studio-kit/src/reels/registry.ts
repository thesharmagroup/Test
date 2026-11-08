// Every reel the studio and the renderer know about. `npm run new -- <id>` adds a line here.
import type React from "react";
import type { ReelProps } from "../components";
import type { Word } from "../timing";
import { PRESETS } from "../presets";
import * as demo from "./demo/Reel";
import * as r_recharge_mehnga from "./recharge-mehnga/Reel";
import * as r_recharge_paper from "./recharge-paper/Reel";
import * as r_canada_pr from "./canada-pr/Reel";
// <new-reel-imports>

export type ReelEntry = {
  id: string;
  Component: React.FC<ReelProps>;
  durationInFrames: number;
  /** Extra compositions of the same reel with other props, e.g. another avatar style or brand preset. */
  variants?: { suffix: string; props: ReelProps }[];
};

export const REELS: ReelEntry[] = [
  {
    id: "Demo",
    Component: demo.Reel,
    durationInFrames: demo.durationInFrames,
    variants: [
      { suffix: "Illustrated", props: { avatar: "illustrated" } },
      { suffix: "Pixel", props: { avatar: "pixel" } },
      { suffix: "BoldDark", props: { brand: PRESETS.boldDark } },
      { suffix: "SoftPastel", props: { brand: PRESETS.softPastel } },
    ],
  },
  { id: "recharge-mehnga", Component: r_recharge_mehnga.Reel, durationInFrames: r_recharge_mehnga.durationInFrames },
  { id: "recharge-paper", Component: r_recharge_paper.Reel, durationInFrames: r_recharge_paper.durationInFrames },
  { id: "canada-pr", Component: r_canada_pr.Reel, durationInFrames: r_canada_pr.durationInFrames },
  // <new-reel-entries>
];

export type { Word };
