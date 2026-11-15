// Every reel the studio and the renderer know about. `npm run new -- <id>` adds a line here.
import type React from "react";
import type { ReelProps } from "../components";
import type { Word } from "../timing";
import { PRESETS } from "../presets";
import * as demo from "./demo/Reel";
import * as r_recharge_mehnga from "./recharge-mehnga/Reel";
import * as r_recharge_paper from "./recharge-paper/Reel";
import * as r_canada_pr from "./canada-pr/Reel";
import * as r_sask_pr from "./sask-pr/Reel";
import * as r_study_pr from "./study-pr/Reel";
import * as r_stjohns_trip from "./stjohns-trip/Reel";
import * as r_stjohns_flash from "./stjohns-flash/Reel";
import * as r_stjohns_vhs from "./stjohns-vhs/Reel";
import * as r_stjohns_polaroid from "./stjohns-polaroid/Reel";
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
  { id: "sask-pr", Component: r_sask_pr.Reel, durationInFrames: r_sask_pr.durationInFrames },
  { id: "study-pr", Component: r_study_pr.Reel, durationInFrames: r_study_pr.durationInFrames },
  { id: "stjohns-trip", Component: r_stjohns_trip.Reel, durationInFrames: r_stjohns_trip.durationInFrames },
  { id: "stjohns-flash", Component: r_stjohns_flash.Reel, durationInFrames: r_stjohns_flash.durationInFrames },
  { id: "stjohns-vhs", Component: r_stjohns_vhs.Reel, durationInFrames: r_stjohns_vhs.durationInFrames },
  { id: "stjohns-polaroid", Component: r_stjohns_polaroid.Reel, durationInFrames: r_stjohns_polaroid.durationInFrames },
  { id: "stjohns-flash-4k", Component: r_stjohns_flash.Reel4K, durationInFrames: r_stjohns_flash.durationInFrames },
  // <new-reel-entries>
];

export type { Word };
