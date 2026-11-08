// Reel "sask-pr": Saskatchewan PR kaise milta hai (SINP), as of 8 Nov 2026, ~59 s, Hinglish.
// Paper look + standing presenter + credited photos + music bed + SFX.
// Every cut, pop and sound is timed to a spoken word (public/reels/sask-pr/captions.words.json).
import React from "react";
import { brand as myBrand } from "../../brand";
import { Avatar } from "../../avatars/Avatar";
import { useMouth } from "../../avatars/useMouth";
import type { PoseCue } from "../../avatars/SpritePlayer";
import { Music, ReelFrame, SceneBlock, SfxTrack, type ReelProps, type SfxCue } from "../../components";
import { usePop } from "../../components/pop";
import { SAFE, SAFE_BOX } from "../../layout";
import { timing } from "../../timing";
import mouth from "../../../public/reels/sask-pr/mouth.json";
import words from "../../../public/reels/sask-pr/captions.words.json";
import { Body, Dots, GhostStack, Header, INK, InfoCard, KineticWords, NumberPill, PaperGrid, RED, SANS, SERIF, Stamp, Stat, kineticChunks, paperBrand, typeFrames } from "../recharge-paper/paper";

export const t = timing(words);
export const AUDIO = "reels/sask-pr/vo.wav";
export const durationInFrames = t.duration(1.4);

// Scene cuts on word indexes (see captions.words.json).
const at = (i: number) => t.at(i);
const S = {
  hook: [0, at(9)],
  sinp: [at(9), at(22)],
  priority: [at(22), at(37)],
  cap: [at(37), at(55)],
  job: [at(55), at(76)],
  req: [at(76), at(94)],
  pgwp: [at(94), at(116)],
  draws: [at(116), at(128)],
  twist: [at(128), at(142)],
  fee: [at(142), at(156)],
  end: [at(156), durationInFrames],
} as const;
const SCENES = 10; // dots (end card has none)

// Card text lines: [word index, text]. Typed out with keyboard sound.
const L = {
  hook: [3, "PR ka rasta"],
  sinp: [14, "2026 ka quota, nominations"],
  pri1: [31, "Healthcare · Agriculture"],
  pri2: [33, "Trades · Mining · Tech"],
  cap: [37, "Food · Retail · Trucking"],
  job1: [59, "1. Sask employer, full-time"],
  job2: [65, "2. Employer: EPA approve"],
  job3: [71, "3. Phir aap apply"],
  req1: [85, "1 saal experience"],
  req2: [90, "CLB 4 English"],
  pgwp1: [97, "6 mahine, usi employer ke saath"],
  pgwp2: [105, "Sask college grads: Student stream"],
  draws: [117, "EOI draws ka schedule"],
  twist: [132, "Nomination mila toh"],
  fee1: [142, "Fee: $500"],
  fee2: [147, "Sirf official site"],
  fee3: [150, "ya licensed consultant"],
} as const satisfies Record<string, readonly [number, string]>;
const Line: React.FC<{ k: keyof typeof L }> = ({ k }) => <Body at={at(L[k][0])}>{L[k][1]}</Body>;

// Number count-ups: [word index, frames].
const COUNTS: [number, number][] = [
  [18, 30],
  [43, 12],
  [83, 14],
  [140, 14],
];

const KEYWORDS = [
  "Saskatchewan", "PR", "khula", "SINP", "5,261", "nominations", "priority", "healthcare", "agriculture", "trades", "mining", "tech",
  "trucking", "25", "cap", "jaldi", "job", "offer", "EPA", "apply", "110", "60", "experience", "CLB", "PGWP", "6", "mahine",
  "Student", "draws", "schedule", "600", "points", "Express", "500", "official", "licensed", "consultant", "follow",
];

const poseCues: PoseCue[] = [
  { at: 0, pose: "present" },
  { at: 3.2, pose: "explain" },
  { at: 6.6, pose: "point-right" },
  { at: 10.1, pose: "one" },
  { at: 12.4, pose: "present" },
  { at: 16.7, pose: "explain" },
  { at: 19.6, pose: "finger-up" },
  { at: 22.5, pose: "point-right" },
  { at: 26.0, pose: "one" },
  { at: 27.9, pose: "two" },
  { at: 29.2, pose: "explain" },
  { at: 31.3, pose: "point-right" },
  { at: 33.8, pose: "finger-up" },
  { at: 36.2, pose: "explain" },
  { at: 39.4, pose: "point-right" },
  { at: 42.2, pose: "shrug" },
  { at: 46.2, pose: "finger-up" },
  { at: 49.9, pose: "thumbs-up" },
  { at: 50.9, pose: "explain" },
  { at: 53.4, pose: "thinking" },
  { at: 56.4, pose: "point-down" },
  { at: 57.2, pose: "wave" },
];

const { chunks, keyOf } = kineticChunks(words, KEYWORDS);
const SFX: SfxCue[] = [
  ...Object.values(S).map(([a]) => ({ name: "whoosh" as const, at: a })),
  ...Object.entries(S)
    .filter(([k]) => k !== "end")
    .map(([, [a]]) => ({ name: "click" as const, at: a + 3 })),
  ...Object.values(L).map(([i, text]) => ({ name: "typing" as const, at: at(i), frames: typeFrames(text) })),
  ...COUNTS.map(([i, frames]) => ({ name: "counter" as const, at: at(i), frames })),
  ...[at(7), at(52), at(126)].map((a) => ({ name: "stamp" as const, at: a })),
  { name: "alert", at: at(124) },
  { name: "success", at: at(140) },
  ...chunks.map((_, k) => keyOf[k]).filter((i) => i >= 0).map((i) => ({ name: "pop" as const, at: at(i), volume: 0.16 })),
  { name: "ding", at: S.end[0] + 4 },
  { name: "click", at: at(160), volume: 0.6 },
];

const PILL_TOP = 400;
const CARD_TOP = 496;
const CARD_LEFT = 460;
const CARD_W = 500;
const AV = { x: 80, y: 520, size: 1020 };

const Slot: React.FC<{ scene: number; from: number; pill: React.ReactNode; children: React.ReactNode }> = ({ scene, from, pill, children }) => (
  <>
    <div style={{ position: "absolute", left: CARD_LEFT, top: PILL_TOP, width: CARD_W }}>{pill}</div>
    <div style={{ position: "absolute", left: CARD_LEFT, top: CARD_TOP, width: CARD_W }}>
      <GhostStack at={from} />
      {children}
      <div style={{ width: CARD_W, marginTop: 24 }}>
        <Dots count={SCENES} active={scene} />
      </div>
    </div>
  </>
);

const FollowCard: React.FC<{ from: number; followAt: number; handle: string }> = ({ from, followAt, handle }) => {
  const card = usePop(from);
  const btn = usePop(followAt);
  return (
    <div data-el="endcard" data-kind="content" style={{ ...card.style, background: "#fff", borderRadius: 36, padding: "40px 40px", boxShadow: "0 30px 70px rgba(60,30,10,0.16)", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 44, color: INK, lineHeight: 1.1 }}>Aise updates ke liye</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 26 }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: RED, color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: INK }}>{handle}</div>
      </div>
      <div style={{ ...btn.style, display: "inline-block", marginTop: 30 }}>
        <div style={{ background: INK, color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 44, padding: "16px 46px", borderRadius: 60, letterSpacing: 2 }}>FOLLOW +</div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 22, color: `${INK}99`, marginTop: 26 }}>Ye legal advice nahi hai.</div>
    </div>
  );
};

export const Reel: React.FC<ReelProps> = ({ brand = myBrand, avatar = "standing", debugSafeZones, probe }) => {
  const m = useMouth(mouth, words);
  const pb = paperBrand(brand.handle);
  return (
    <ReelFrame brand={pb} audio={AUDIO} debugSafeZones={debugSafeZones} probe={probe}>
      <PaperGrid />
      <Music src="music/explainer-bed.wav" voice={mouth} level={0.34} ducked={0.17} />
      <SfxTrack cues={SFX} />
      <Header title="Saskatchewan PR guide" handle={pb.handle} x={SAFE_BOX.x} y={SAFE.top + 16} width={SAFE_BOX.width} />

      {avatar !== "none" ? (
        <div style={{ position: "absolute", left: AV.x, top: AV.y }}>
          <Avatar style={avatar} mouth={m} cues={poseCues} size={AV.size} />
        </div>
      ) : null}

      <SceneBlock name="hook" from={S.hook[0]} to={S.hook[1]}>
        <Slot scene={0} from={0} pill={<NumberPill tag="SASK" text="Nov 2026" at={0} />}>
          <InfoCard n="!" icon="PR" title="Saskatchewan" at={0} image="images/sask-pr/legislature.jpg" credit="Photo: Quintin Soloviev · CC BY 4.0" imageHeight={220} footer="Source: saskatchewan.ca">
            <Line k="hook" />
          </InfoCard>
          <Stamp text="khula" at={at(7)} rotate={-8} style={{ position: "absolute", left: 270, top: 70 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="sinp" from={S.sinp[0]} to={S.sinp[1]}>
        <Slot scene={1} from={S.sinp[0]} pill={<NumberPill tag="SINP" text="2026" at={S.sinp[0]} />}>
          <InfoCard n="01" icon="SK" title="SINP quota" at={S.sinp[0]} footer="Source: SINP stats, Q3 2026">
            <Line k="sinp" />
            <Stat from={0} to={5261} at={at(18)} frames={30} />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="priority" from={S.priority[0]} to={S.priority[1]}>
        <Slot scene={2} from={S.priority[0]} pill={<NumberPill tag="50%+" text="seats" at={S.priority[0]} />}>
          <InfoCard n="02" icon="★" title="Priority sectors" at={S.priority[0]} image="images/sask-pr/wheat.jpg" credit="Photo: Bruce Guenter · CC BY 2.0" imageHeight={200} footer="Source: SINP FAQ">
            <Line k="pri1" />
            <Line k="pri2" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="cap" from={S.cap[0]} to={S.cap[1]}>
        <Slot scene={3} from={S.cap[0]} pill={<NumberPill tag="CAP" text="max 25%" at={S.cap[0]} />}>
          <InfoCard n="03" icon="%" title="Capped sectors" at={S.cap[0]} footer="Source: SINP FAQ, stats">
            <Line k="cap" />
            <Stat from={0} to={25} suffix="%" at={at(43)} frames={12} label="ka cap" />
          </InfoCard>
          <Stamp text="full" at={at(52)} rotate={7} style={{ position: "absolute", left: 320, top: 40 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="job" from={S.job[0]} to={S.job[1]}>
        <Slot scene={4} from={S.job[0]} pill={<NumberPill tag="#1" text="Seedha rasta" at={S.job[0]} />}>
          <InfoCard n="04" icon="JOB" title="Job offer" at={S.job[0]} image="images/sask-pr/regina.jpg" credit="Photo: Quintin Soloviev · CC BY 4.0" imageHeight={180} footer="Source: SINP Employment Offer">
            <Line k="job1" />
            <Line k="job2" />
            <Line k="job3" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="req" from={S.req[0]} to={S.req[1]}>
        <Slot scene={5} from={S.req[0]} pill={<NumberPill tag="CHAHIYE" text="Minimum" at={S.req[0]} />}>
          <InfoCard n="05" icon="✓" title="Requirements" at={S.req[0]} footer="Source: saskatchewan.ca">
            <Stat from={0} to={60} suffix="/110" at={at(83)} frames={14} label="points" />
            <Line k="req1" />
            <Line k="req2" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="pgwp" from={S.pgwp[0]} to={S.pgwp[1]}>
        <Slot scene={6} from={S.pgwp[0]} pill={<NumberPill tag="PGWP" text="Students" at={S.pgwp[0]} />}>
          <InfoCard n="06" icon="ST" title="Students" at={S.pgwp[0]} image="images/sask-pr/usask.jpg" credit="Photo: SriMesh · CC BY-SA 3.0" imageHeight={180} footer="Source: SINP Employment Offer, FAQ">
            <Line k="pgwp1" />
            <Line k="pgwp2" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="draws" from={S.draws[0]} to={S.draws[1]}>
        <Slot scene={7} from={S.draws[0]} pill={<NumberPill tag="LEKIN" text="Bina job offer?" at={S.draws[0]} />}>
          <InfoCard n="!" icon="EOI" title="Draws" at={S.draws[0]} footer="Official site pe koi draw nahi dikhta">
            <Line k="draws" />
          </InfoCard>
          <Stamp text="abhi nahi" at={at(126)} rotate={-6} style={{ position: "absolute", left: 230, top: 40 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="twist" from={S.twist[0]} to={S.twist[1]}>
        <Slot scene={8} from={S.twist[0]} pill={<NumberPill tag="BIG" text="Express Entry" at={S.twist[0]} />}>
          <InfoCard n="✓" icon="EE" title="CRS boost" at={S.twist[0]} image="images/sask-pr/saskatoon.jpg" credit="Photo: EriedgenArc · CC BY-SA 4.0" imageHeight={180} footer="Source: IRCC CRS criteria">
            <Line k="twist" />
            <Stat prefix="+" from={0} to={600} at={at(140)} frames={14} label="CRS points" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="fee" from={S.fee[0]} to={S.fee[1]}>
        <Slot scene={9} from={S.fee[0]} pill={<NumberPill tag="TIP" text="Dhyan rakho" at={S.fee[0]} />}>
          <InfoCard n="→" icon="$" title="Apply se pehle" at={S.fee[0]} footer="Ye legal advice nahi hai">
            <Line k="fee1" />
            <Line k="fee2" />
            <Line k="fee3" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="end" from={S.end[0]} to={S.end[1]}>
        <div style={{ position: "absolute", left: CARD_LEFT, top: PILL_TOP + 40, width: CARD_W }}>
          <FollowCard from={S.end[0]} followAt={at(160)} handle={pb.handle} />
        </div>
      </SceneBlock>

      <div style={{ position: "absolute", left: 470, top: 1110, width: 490, height: 410, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <KineticWords words={words} keywords={KEYWORDS} width={490} />
      </div>
    </ReelFrame>
  );
};
