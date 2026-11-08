// Reel "canada-pr": Ontario PR situation for immigrants (as of 8 Nov 2026), ~60 s, Hinglish.
// Paper look + standing presenter + credited photos + music bed + SFX.
// Every cut, pop and sound is timed to a spoken word (public/reels/canada-pr/captions.words.json).
import React from "react";
import { brand as myBrand } from "../../brand";
import { Avatar } from "../../avatars/Avatar";
import { useMouth } from "../../avatars/useMouth";
import type { PoseCue } from "../../avatars/SpritePlayer";
import { Music, ReelFrame, SceneBlock, SfxTrack, type ReelProps, type SfxCue } from "../../components";
import { usePop } from "../../components/pop";
import { SAFE, SAFE_BOX } from "../../layout";
import { timing } from "../../timing";
import mouth from "../../../public/reels/canada-pr/mouth.json";
import words from "../../../public/reels/canada-pr/captions.words.json";
import { Body, Dots, GhostStack, Header, INK, InfoCard, KineticWords, NumberPill, PaperGrid, RED, SANS, SERIF, Stamp, Stat, kineticChunks, paperBrand, typeFrames } from "../recharge-paper/paper";

export const t = timing(words);
export const AUDIO = "reels/canada-pr/vo.wav";
export const durationInFrames = t.duration(0.6);

// Scene cuts on word indexes (see captions.words.json).
const at = (i: number) => t.at(i);
const S = {
  hook: [0, at(10)],
  streams: [at(10), at(27)],
  masters: [at(27), at(43)],
  next: [at(43), at(60)],
  noms: [at(60), at(69)],
  plan: [at(69), at(89)],
  students: [at(89), at(98)],
  goal: [at(98), at(110)],
  tight: [at(110), at(124)],
  good: [at(124), at(149)],
  advice: [at(149), at(170)],
  end: [at(170), durationInFrames],
} as const;
const SCENES = 11; // dots (end card has none)

// Card text lines: [word index, text]. Typed out with keyboard sound.
const L = {
  hook: [4, "PR ka seedha rasta"],
  streams: [19, "OINP ke saare streams"],
  masters1: [31, "graduate streams bhi"],
  masters2: [35, "Ontario se padhe students ke liye"],
  next: [48, "Focus: job offer"],
  noms: [62, "Ontario, 2026 ke liye"],
  plan: [80, "2029 tak, har saal"],
  students: [96, "naye students, per saal"],
  goal: [103, "population ka"],
  tight: [118, "PR ki race aur tight"],
  good1: [137, "Canada mein kaam kar rahe workers"],
  good2: [141, "time-limited PR measure"],
  good3: [145, "details abhi aani hain"],
  adv1: [155, "1. Status expire se pehle"],
  adv2: [160, "2. Apne options check karo"],
  adv3: [165, "3. Sirf licensed consultant"],
} as const satisfies Record<string, readonly [number, string]>;
const Line: React.FC<{ k: keyof typeof L }> = ({ k }) => <Body at={at(L[k][0])}>{L[k][1]}</Body>;

// Number count-ups: [word index, frames].
const COUNTS: [number, number][] = [
  [22, 16],
  [65, 26],
  [82, 26],
  [92, 22],
  [105, 10],
];

const KEYWORDS = [
  "Ontario", "PR", "band", "OINP", "9", "Masters", "PhD", "students", "job", "offer", "confirm", "14,119", "nominations",
  "November", "plan", "2029", "80", "50", "5", "percent", "race", "tight", "khabar", "2027", "workers", "measure",
  "status", "options", "licensed", "consultant", "follow",
];

const poseCues: PoseCue[] = [
  { at: 0, pose: "shrug" },
  { at: 3.4, pose: "explain" },
  { at: 9.6, pose: "one" },
  { at: 14.4, pose: "present" },
  { at: 19.8, pose: "point-right" },
  { at: 23.8, pose: "explain" },
  { at: 27.7, pose: "point-right" },
  { at: 31.1, pose: "two" },
  { at: 34.4, pose: "finger-up" },
  { at: 38.5, pose: "shrug" },
  { at: 43.1, pose: "thumbs-up" },
  { at: 47.0, pose: "present" },
  { at: 50.5, pose: "explain" },
  { at: 54.0, pose: "finger-up" },
  { at: 57.8, pose: "point-down" },
  { at: 58.4, pose: "wave" },
];

const { chunks, keyOf } = kineticChunks(words, KEYWORDS);
const SFX: SfxCue[] = [
  ...Object.values(S).map(([a]) => ({ name: "whoosh" as const, at: a })),
  ...[S.hook, S.streams, S.masters, S.next, S.noms, S.plan, S.students, S.goal, S.tight, S.good, S.advice].map(([a]) => ({ name: "click" as const, at: a + 3 })),
  ...Object.values(L).map(([i, text]) => ({ name: "typing" as const, at: at(i), frames: typeFrames(text) })),
  ...COUNTS.map(([i, frames]) => ({ name: "counter" as const, at: at(i), frames })),
  { name: "alert", at: at(6) },
  ...[at(8), at(33), at(56), at(122)].map((a) => ({ name: "stamp" as const, at: a })),
  { name: "success", at: at(126) },
  ...chunks.map((_, k) => keyOf[k]).filter((i) => i >= 0).map((i) => ({ name: "pop" as const, at: at(i), volume: 0.16 })),
  { name: "ding", at: S.end[0] + 4 },
  { name: "click", at: at(174), volume: 0.6 },
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
      <Header title="Canada PR: Ontario update" handle={pb.handle} x={SAFE_BOX.x} y={SAFE.top + 16} width={SAFE_BOX.width} />

      {avatar !== "none" ? (
        <div style={{ position: "absolute", left: AV.x, top: AV.y }}>
          <Avatar style={avatar} mouth={m} cues={poseCues} size={AV.size} />
        </div>
      ) : null}

      <SceneBlock name="hook" from={S.hook[0]} to={S.hook[1]}>
        <Slot scene={0} from={0} pill={<NumberPill tag="ONTARIO" text="Nov 2026" at={0} />}>
          <InfoCard n="!" icon="PR" title="OINP" at={0} image="images/canada-pr/ontario.jpg" credit="Photo: Spudgun67 · CC BY-SA 4.0" imageHeight={210} footer="Source: KPMG, Envoy (Jun 2026)">
            <Line k="hook" />
          </InfoCard>
          <Stamp text="band" at={at(8)} rotate={-8} style={{ position: "absolute", left: 230, top: 70 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="streams" from={S.streams[0]} to={S.streams[1]}>
        <Slot scene={1} from={S.streams[0]} pill={<NumberPill tag="30 MAY" text="2026" at={S.streams[0]} />}>
          <InfoCard n="01" icon="9" title="Streams band" at={S.streams[0]} footer="Source: KPMG (Jun 2026)">
            <Line k="streams" />
            <Stat from={0} to={9} at={at(22)} frames={16} label="streams revoked" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="masters" from={S.masters[0]} to={S.masters[1]}>
        <Slot scene={2} from={S.masters[0]} pill={<NumberPill tag="#01" text="Students" at={S.masters[0]} />}>
          <InfoCard n="02" icon="MA" title="Masters + PhD" at={S.masters[0]} image="images/canada-pr/uoft.jpg" credit="Photo: Maksim Sokolov · CC BY-SA 4.0" imageHeight={200} footer="Source: KPMG (Jun 2026)">
            <Line k="masters1" />
            <Line k="masters2" />
          </InfoCard>
          <Stamp text="band" at={at(33)} rotate={7} style={{ position: "absolute", left: 230, top: 60 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="next" from={S.next[0]} to={S.next[1]}>
        <Slot scene={3} from={S.next[0]} pill={<NumberPill tag="#02" text="Aage kya?" at={S.next[0]} />}>
          <InfoCard n="03" icon="?" title="Naye streams" at={S.next[0]} footer="Source: KPMG (Jun 2026)">
            <Line k="next" />
          </InfoCard>
          <Stamp text="confirm nahi" at={at(56)} rotate={-6} style={{ position: "absolute", left: 160, top: 30 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="noms" from={S.noms[0]} to={S.noms[1]}>
        <Slot scene={4} from={S.noms[0]} pill={<NumberPill tag="OINP" text="2026" at={S.noms[0]} />}>
          <InfoCard n="04" icon="ON" title="Nominations" at={S.noms[0]} footer="Source: KPMG (Jun 2026)">
            <Line k="noms" />
            <Stat from={0} to={14119} at={at(65)} frames={26} />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="plan" from={S.plan[0]} to={S.plan[1]}>
        <Slot scene={5} from={S.plan[0]} pill={<NumberPill tag="5 NOV" text="Naya plan" at={S.plan[0]} />}>
          <InfoCard n="05" icon="PR" title="PR target" at={S.plan[0]} image="images/canada-pr/parliament.jpg" credit="Photo: Saffron Blaze · CC BY-SA 3.0" imageHeight={200} footer="Source: IRCC, 5 Nov 2026">
            <Line k="plan" />
            <Stat from={300000} to={380000} at={at(82)} frames={26} />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="students" from={S.students[0]} to={S.students[1]}>
        <Slot scene={6} from={S.students[0]} pill={<NumberPill tag="#03" text="Students" at={S.students[0]} />}>
          <InfoCard n="06" icon="ST" title="Sirf itne" at={S.students[0]} image="images/canada-pr/flag.jpg" credit="Photo: Dietmar Rabich · CC BY-SA 4.0" imageHeight={200} footer="Source: IRCC 2027-2029 plan">
            <Stat from={100000} to={150000} at={at(92)} frames={22} />
            <Line k="students" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="goal" from={S.goal[0]} to={S.goal[1]}>
        <Slot scene={7} from={S.goal[0]} pill={<NumberPill tag="GOAL" text="2027 end" at={S.goal[0]} />}>
          <InfoCard n="07" icon="%" title="Temporary" at={S.goal[0]} footer="Source: IRCC levels plan">
            <Line k="goal" />
            <Stat prefix="< " from={10} to={5} suffix="%" at={at(105)} frames={10} />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="tight" from={S.tight[0]} to={S.tight[1]}>
        <Slot scene={8} from={S.tight[0]} pill={<NumberPill tag="MATLAB" text="Race tight" at={S.tight[0]} />}>
          <InfoCard n="!" icon="WP" title="Permit khatam?" at={S.tight[0]} footer="Hamara analysis">
            <Line k="tight" />
          </InfoCard>
          <Stamp text="tight" at={at(122)} rotate={7} style={{ position: "absolute", left: 300, top: 40 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="good" from={S.good[0]} to={S.good[1]}>
        <Slot scene={9} from={S.good[0]} pill={<NumberPill tag="GOOD NEWS" text="2027" at={S.good[0]} />}>
          <InfoCard n="✓" icon="2027" title="Workers ke liye" at={S.good[0]} image="images/canada-pr/toronto.jpg" credit="Photo: Wladyslaw · CC BY-SA 3.0" imageHeight={180} footer="Source: IRCC, 5 Nov 2026">
            <Line k="good1" />
            <Line k="good2" />
            <Line k="good3" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="advice" from={S.advice[0]} to={S.advice[1]}>
        <Slot scene={10} from={S.advice[0]} pill={<NumberPill tag="TIP" text="Ontario mein ho?" at={S.advice[0]} />}>
          <InfoCard n="→" icon="✓" title="Kya karein" at={S.advice[0]} footer="Ye legal advice nahi hai">
            <Line k="adv1" />
            <Line k="adv2" />
            <Line k="adv3" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="end" from={S.end[0]} to={S.end[1]}>
        <div style={{ position: "absolute", left: CARD_LEFT, top: PILL_TOP + 40, width: CARD_W }}>
          <FollowCard from={S.end[0]} followAt={at(174)} handle={pb.handle} />
        </div>
      </SceneBlock>

      <div style={{ position: "absolute", left: 470, top: 1110, width: 490, height: 410, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <KineticWords words={words} keywords={KEYWORDS} width={490} />
      </div>
    </ReelFrame>
  );
};
