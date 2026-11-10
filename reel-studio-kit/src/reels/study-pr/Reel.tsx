// Reel "study-pr": 12th pass from India (1 yr hotel front desk) coming to Ontario: ECE ya PSW? (as of 10 Nov 2026), ~59 s, Hinglish.
// Paper look + standing presenter + credited photos + music bed + SFX. No follow CTA: ends on a "check before admission" card.
// Every cut, pop and sound is timed to a spoken word (public/reels/study-pr/captions.words.json).
import React from "react";
import { brand as myBrand } from "../../brand";
import { Avatar } from "../../avatars/Avatar";
import { useMouth } from "../../avatars/useMouth";
import type { PoseCue } from "../../avatars/SpritePlayer";
import { Music, ReelFrame, SceneBlock, SfxTrack, type ReelProps, type SfxCue } from "../../components";
import { usePop } from "../../components/pop";
import { SAFE, SAFE_BOX } from "../../layout";
import { timing } from "../../timing";
import mouth from "../../../public/reels/study-pr/mouth.json";
import words from "../../../public/reels/study-pr/captions.words.json";
import { Body, Dots, GhostStack, Header, INK, InfoCard, KineticWords, NumberPill, PaperGrid, RED, SANS, SERIF, Stamp, Stat, kineticChunks, paperBrand, typeFrames } from "../recharge-paper/paper";

export const t = timing(words);
export const AUDIO = "reels/study-pr/vo.wav";
export const durationInFrames = t.duration(1.4);

// Scene cuts on word indexes (see captions.words.json).
const at = (i: number) => t.at(i);
const S = {
  hook: [0, at(9)],
  desk: [at(9), at(28)],
  ece: [at(28), at(46)],
  ecejob: [at(46), at(59)],
  psw: [at(59), at(76)],
  pgwp: [at(76), at(85)],
  pswjob: [at(85), at(99)],
  exp: [at(99), at(108)],
  owp: [at(108), at(127)],
  warn: [at(127), at(136)],
  verdict: [at(136), at(146)],
  end: [at(146), durationInFrames],
} as const;
const SCENES = 11; // dots (closing card has none)

// Card text lines: [word index, text]. Typed out with keyboard sound.
const L = {
  hook: [5, "ECE ya PSW?"],
  desk: [16, "1 saal front desk = TEER 4"],
  ece: [33, "2 saal · Ontario College Diploma"],
  ecejob1: [47, "Early childhood educator"],
  ecejob2: [52, "Express Entry: Education"],
  psw1: [64, "1 saal ka certificate"],
  psw2: [69, "Centennial, international fees"],
  pgwp: [79, "Program jitna lamba"],
  pswjob1: [86, "Hospital / long-term care"],
  pswjob2: [97, "Express Entry: Healthcare"],
  exp: [105, "full-time kaam, usi job mein"],
  owp1: [116, "1. Ontario job offer"],
  owp2: [118, "2. Usi job mein 6 mahine"],
  owp3: [124, "3. CLB 6 English"],
  warn: [129, "Public-private partnership campus"],
  ver1: [137, "Lamba + safe: ECE"],
  ver2: [142, "Jaldi + sasta: PSW"],
} as const satisfies Record<string, readonly [number, string]>;
const Line: React.FC<{ k: keyof typeof L }> = ({ k }) => <Body at={at(L[k][0])}>{L[k][1]}</Body>;

// Number count-ups: [word index, frames].
const COUNTS: [number, number][] = [
  [40, 10],
  [69, 22],
  [103, 14],
];

const KEYWORDS = [
  "Ontario", "ECE", "PSW", "TEER", "count", "Childhood", "Diploma", "PGWP", "educator", "education", "category", "Personal",
  "Support", "certificate", "Centennial", "18,000", "jitna", "hospital", "long-term", "33102", "healthcare", "12", "mahine",
  "full-time", "Workforce", "Priority", "offer", "CLB", "public-private", "campus", "safe", "jaldi", "sasta", "Admission",
  "status", "check",
];

const poseCues: PoseCue[] = [
  { at: 0, pose: "shrug" },
  { at: 3.9, pose: "finger-up" },
  { at: 6.8, pose: "point-right" },
  { at: 9.8, pose: "one" },
  { at: 12.5, pose: "explain" },
  { at: 15.3, pose: "point-right" },
  { at: 16.9, pose: "present" },
  { at: 21.1, pose: "two" },
  { at: 23.6, pose: "explain" },
  { at: 26.6, pose: "point-right" },
  { at: 27.4, pose: "shrug" },
  { at: 31.5, pose: "explain" },
  { at: 34.5, pose: "point-right" },
  { at: 37.5, pose: "finger-up" },
  { at: 40.8, pose: "present" },
  { at: 43.2, pose: "one" },
  { at: 44.5, pose: "two" },
  { at: 46.9, pose: "thinking" },
  { at: 49.0, pose: "point-right" },
  { at: 50.9, pose: "explain" },
  { at: 53.0, pose: "thumbs-up" },
  { at: 54.9, pose: "point-down" },
  { at: 57.2, pose: "finger-up" },
];

const { chunks, keyOf } = kineticChunks(words, KEYWORDS);
const SFX: SfxCue[] = [
  ...Object.values(S).map(([a]) => ({ name: "whoosh" as const, at: a })),
  ...Object.entries(S)
    .filter(([k]) => k !== "end")
    .map(([, [a]]) => ({ name: "click" as const, at: a + 3 })),
  ...Object.values(L).map(([i, text]) => ({ name: "typing" as const, at: at(i), frames: typeFrames(text) })),
  ...COUNTS.map(([i, frames]) => ({ name: "counter" as const, at: at(i), frames })),
  ...[at(25), at(83), at(133)].map((a) => ({ name: "stamp" as const, at: a })),
  { name: "alert", at: at(129) },
  { name: "success", at: at(141) },
  ...chunks.map((_, k) => keyOf[k]).filter((i) => i >= 0).map((i) => ({ name: "pop" as const, at: at(i), volume: 0.16 })),
  { name: "ding", at: S.end[0] + 4 },
  { name: "click", at: at(154), volume: 0.6 },
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

// Closing card (no follow CTA): the one thing to do before taking admission.
const CheckCard: React.FC<{ from: number; checkAt: number }> = ({ from, checkAt }) => {
  const card = usePop(from);
  const btn = usePop(checkAt);
  return (
    <div data-el="endcard" data-kind="content" style={{ ...card.style, background: "#fff", borderRadius: 36, padding: "40px 40px", boxShadow: "0 30px 70px rgba(60,30,10,0.16)", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 46, color: INK, lineHeight: 1.1 }}>Admission se pehle</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: INK, marginTop: 22, lineHeight: 1.25 }}>
        College ka PGWP status
        <br />
        aur CIP code
      </div>
      <div style={{ ...btn.style, display: "inline-block", marginTop: 30 }}>
        <div style={{ background: RED, color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 42, padding: "16px 46px", borderRadius: 60, letterSpacing: 2 }}>CHECK KARO ✓</div>
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
      <Header title="Ontario: ECE vs PSW" handle={pb.handle} x={SAFE_BOX.x} y={SAFE.top + 16} width={SAFE_BOX.width} />

      {avatar !== "none" ? (
        <div style={{ position: "absolute", left: AV.x, top: AV.y }}>
          <Avatar style={avatar} mouth={m} cues={poseCues} size={AV.size} />
        </div>
      ) : null}

      <SceneBlock name="hook" from={S.hook[0]} to={S.hook[1]}>
        <Slot scene={0} from={0} pill={<NumberPill tag="12th" text="Ontario" at={0} />}>
          <InfoCard n="?" icon="ON" title="Kya padhein?" at={0} image="images/study-pr/college.jpg" credit="Photo: Canmenwalker · CC BY 4.0" imageHeight={220} footer="Info: 10 Nov 2026">
            <Line k="hook" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="desk" from={S.desk[0]} to={S.desk[1]}>
        <Slot scene={1} from={S.desk[0]} pill={<NumberPill tag="PEHLE" text="Ek baat" at={S.desk[0]} />}>
          <InfoCard n="!" icon="NOC" title="Front desk" at={S.desk[0]} footer="Source: IRCC, Express Entry">
            <Line k="desk" />
          </InfoCard>
          <Stamp text="EE: count nahi" at={at(25)} rotate={-7} style={{ position: "absolute", left: 110, top: 60 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="ece" from={S.ece[0]} to={S.ece[1]}>
        <Slot scene={2} from={S.ece[0]} pill={<NumberPill tag="#1" text="ECE" at={S.ece[0]} />}>
          <InfoCard n="01" icon="ECE" title="Early Childhood Ed." at={S.ece[0]} footer="Source: Seneca, IRCC">
            <Line k="ece" />
            <Stat from={0} to={3} suffix=" saal" at={at(40)} frames={10} label="PGWP" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="ecejob" from={S.ecejob[0]} to={S.ecejob[1]}>
        <Slot scene={3} from={S.ecejob[0]} pill={<NumberPill tag="NOC" text="42202" at={S.ecejob[0]} />}>
          <InfoCard n="02" icon="JOB" title="ECE ki job" at={S.ecejob[0]} footer="Source: IRCC categories">
            <Line k="ecejob1" />
            <Line k="ecejob2" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="psw" from={S.psw[0]} to={S.psw[1]}>
        <Slot scene={4} from={S.psw[0]} pill={<NumberPill tag="#2" text="PSW" at={S.psw[0]} />}>
          <InfoCard n="03" icon="PSW" title="Personal Support" at={S.psw[0]} footer="Source: Centennial College">
            <Line k="psw1" />
            <Line k="psw2" />
            <Stat prefix="$" from={0} to={18000} at={at(69)} frames={22} />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="pgwp" from={S.pgwp[0]} to={S.pgwp[1]}>
        <Slot scene={5} from={S.pgwp[0]} pill={<NumberPill tag="LEKIN" text="PGWP" at={S.pgwp[0]} />}>
          <InfoCard n="!" icon="WP" title="PGWP chhota" at={S.pgwp[0]} footer="Source: IRCC PGWP">
            <Line k="pgwp" />
          </InfoCard>
          <Stamp text="sirf ~1 saal" at={at(83)} rotate={7} style={{ position: "absolute", left: 180, top: 40 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="pswjob" from={S.pswjob[0]} to={S.pswjob[1]}>
        <Slot scene={6} from={S.pswjob[0]} pill={<NumberPill tag="NOC" text="33102" at={S.pswjob[0]} />}>
          <InfoCard n="04" icon="JOB" title="PSW ki job" at={S.pswjob[0]} image="images/study-pr/hospital.jpg" credit="Photo: Wladyslaw · CC BY-SA 3.0" imageHeight={180} footer="Source: Job Bank, IRCC">
            <Line k="pswjob1" />
            <Line k="pswjob2" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="exp" from={S.exp[0]} to={S.exp[1]}>
        <Slot scene={7} from={S.exp[0]} pill={<NumberPill tag="EE" text="Experience" at={S.exp[0]} />}>
          <InfoCard n="05" icon="✓" title="Express Entry" at={S.exp[0]} footer="Source: IRCC categories">
            <Stat from={0} to={12} suffix=" mahine" at={at(103)} frames={14} />
            <Line k="exp" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="owp" from={S.owp[0]} to={S.owp[1]}>
        <Slot scene={8} from={S.owp[0]} pill={<NumberPill tag="OINP" text="Naya stream" at={S.owp[0]} />}>
          <InfoCard n="06" icon="ON" title="Workforce Priority" at={S.owp[0]} image="images/canada-pr/ontario.jpg" credit="Photo: Spudgun67 · CC BY-SA 4.0" imageHeight={170} footer="Source: ontario.ca (Oct 2026)">
            <Line k="owp1" />
            <Line k="owp2" />
            <Line k="owp3" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="warn" from={S.warn[0]} to={S.warn[1]}>
        <Slot scene={9} from={S.warn[0]} pill={<NumberPill tag="DHYAN" text="Campus" at={S.warn[0]} />}>
          <InfoCard n="!" icon="⚠" title="Galat campus" at={S.warn[0]} footer="Source: IRCC PGWP eligibility">
            <Line k="warn" />
          </InfoCard>
          <Stamp text="no PGWP" at={at(133)} rotate={-6} style={{ position: "absolute", left: 270, top: 40 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="verdict" from={S.verdict[0]} to={S.verdict[1]}>
        <Slot scene={10} from={S.verdict[0]} pill={<NumberPill tag="VERDICT" text="ECE vs PSW" at={S.verdict[0]} />}>
          <InfoCard n="✓" icon="VS" title="Kaunsa lein?" at={S.verdict[0]} footer="Ye legal advice nahi hai">
            <Line k="ver1" />
            <Line k="ver2" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="end" from={S.end[0]} to={S.end[1]}>
        <div style={{ position: "absolute", left: CARD_LEFT, top: PILL_TOP + 40, width: CARD_W }}>
          <CheckCard from={S.end[0]} checkAt={at(154)} />
        </div>
      </SceneBlock>

      <div style={{ position: "absolute", left: 470, top: 1110, width: 490, height: 410, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <KineticWords words={words} keywords={KEYWORDS} width={490} />
      </div>
    </ReelFrame>
  );
};
