// Reel "recharge-paper": the recharge story in the "paper" look
// (cream grid, red accent, serif headings, numbered cards, character + kinetic words).
// Reuses the voice and word timings of recharge-mehnga.
import React from "react";
import { brand as myBrand } from "../../brand";
import { Avatar } from "../../avatars/Avatar";
import { useMouth } from "../../avatars/useMouth";
import type { PoseCue } from "../../avatars/SpritePlayer";
import { ReelFrame, SceneBlock, type ReelProps } from "../../components";
import { usePop } from "../../components/pop";
import { SAFE, SAFE_BOX } from "../../layout";
import { timing } from "../../timing";
import mouth from "../../../public/reels/recharge-mehnga/mouth.json";
import words from "../../../public/reels/recharge-mehnga/captions.words.json";
import { Body, Dots, GhostStack, Header, INK, InfoCard, KineticWords, NumberPill, PaperGrid, RED, SANS, SERIF, Stamp, Stat, paperBrand } from "./paper";

export const t = timing(words);
export const AUDIO = "reels/recharge-mehnga/vo.wav";
export const durationInFrames = t.duration();

// Word indexes (captions.words.json of recharge-mehnga).
const S = {
  hook: [0, t.at(8, 3.2)],
  hike: [t.at(8, 3.2), t.at(25, 8.8)],
  fiveG: [t.at(25, 8.8), t.at(46, 16.2)],
  arpu: [t.at(46, 16.2), t.at(57, 20.5)],
  airtel: [t.at(57, 20.5), t.at(74, 26.1)],
  result: [t.at(74, 26.1), t.at(87, 31.2)],
  twist: [t.at(87, 31.2), t.at(112, 38.7)],
  end: [t.at(112, 38.7), t.duration()],
} as const;

const poseCues: PoseCue[] = [
  { at: 0, pose: "shrug" },
  { at: 3.2, pose: "explain" },
  { at: 8.8, pose: "one" },
  { at: 12.5, pose: "point-right" },
  { at: 16.2, pose: "two" },
  { at: 20.5, pose: "present" },
  { at: 26.1, pose: "thinking" },
  { at: 29.4, pose: "thumbs-up" },
  { at: 31.2, pose: "finger-up" },
  { at: 35.2, pose: "shrug" },
  { at: 38.7, pose: "wave" },
];

const KEYWORDS = ["recharge", "249", "Jio", "Airtel", "25", "5G", "20", "billion", "ARPU", "kamai", "210", "300", "quarter", "233", "twist", "last", "15", "confirm", "follow"];

const PILL_TOP = 410;
const CARD_TOP = 510;
const CARD_LEFT = 150;
const AV = { x: SAFE.left, y: 1060, size: 480 };

const Slot: React.FC<{ scene: number; at: number; pill: React.ReactNode; children: React.ReactNode }> = ({ scene, at, pill, children }) => (
  <>
    <div style={{ position: "absolute", left: SAFE_BOX.x, top: PILL_TOP, width: SAFE_BOX.width }}>{pill}</div>
    <div style={{ position: "absolute", left: CARD_LEFT, top: CARD_TOP, width: 780 }}>
      <GhostStack at={at} />
      {children}
      <div style={{ width: 680, marginTop: 30 }}>
        <Dots count={7} active={scene} />
      </div>
    </div>
  </>
);

const FollowCard: React.FC<{ at: number; followAt: number; handle: string }> = ({ at, followAt, handle }) => {
  const card = usePop(at);
  const btn = usePop(followAt);
  return (
    <div data-el="endcard" data-kind="content" style={{ ...card.style, background: "#fff", borderRadius: 36, padding: "44px 48px", boxShadow: "0 30px 70px rgba(60,30,10,0.16)", textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontSize: 56, color: INK, lineHeight: 1.1 }}>Aise aur updates ke liye</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginTop: 30 }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: RED, color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: INK }}>{handle}</div>
      </div>
      <div style={{ ...btn.style, display: "inline-block", marginTop: 34 }}>
        <div style={{ background: INK, color: "#fff", fontFamily: SANS, fontWeight: 900, fontSize: 56, padding: "18px 56px", borderRadius: 60, letterSpacing: 2 }}>FOLLOW +</div>
      </div>
    </div>
  );
};

export const Reel: React.FC<ReelProps> = ({ brand = myBrand, avatar = "person", debugSafeZones, probe }) => {
  const m = useMouth(mouth, words);
  const pb = paperBrand(brand.handle);
  return (
    <ReelFrame brand={pb} audio={AUDIO} debugSafeZones={debugSafeZones} probe={probe}>
      <PaperGrid />
      <Header title="Recharge mehnga kyun hua?" handle={pb.handle} x={SAFE_BOX.x} y={SAFE.top + 16} width={SAFE_BOX.width} />

      <SceneBlock name="hook" from={S.hook[0]} to={S.hook[1]}>
        <Slot scene={0} at={0} pill={<NumberPill tag="JIO" text="1GB/day plan" at={0} />}>
          <InfoCard n="!" icon="₹" title="Naya daam" at={0} footer="Source: TechCrunch">
            <Stat prefix="₹" from={209} to={249} at={t.at(5, 1.8)} frames={20} label="pehle ₹209" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="hike" from={S.hike[0]} to={S.hike[1]}>
        <Slot scene={1} at={S.hike[0]} pill={<NumberPill tag="3 JULY" text="2024" at={S.hike[0]} />}>
          <InfoCard n="↑" icon="%" title="Jio + Airtel" at={S.hike[0]} footer="Source: Business Today">
            <Body at={t.at(16, 5.9)}>ke plans mehnge</Body>
            <Stat prefix="10–" from={10} to={25} suffix="%" at={t.at(19, 6.9)} label="tak" />
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="fiveG" from={S.fiveG[0]} to={S.fiveG[1]}>
        <Slot scene={2} at={S.fiveG[0]} pill={<NumberPill tag="#01" text="Wajah one" at={S.fiveG[0]} />}>
          <InfoCard n="01" icon="5G" title="5G spectrum" at={S.fiveG[0]} footer="Source: TechCrunch">
            <Body at={t.at(30, 11.2)}>Sirf airwaves par kharch</Body>
            <Stat prefix="$" to={20} from={0} suffix="B+" at={t.at(34, 12.6)} />
          </InfoCard>
          <Stamp text="paisa wapas chahiye" at={t.at(41, 15.1)} rotate={-6} style={{ position: "absolute", left: 250, top: 40 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="arpu" from={S.arpu[0]} to={S.arpu[1]}>
        <Slot scene={3} at={S.arpu[0]} pill={<NumberPill tag="#02" text="Wajah two" at={S.arpu[0]} />}>
          <InfoCard n="02" icon="ARPU" title="ARPU" at={S.arpu[0]} footer="Average Revenue Per User">
            <Body at={t.at(49, 18.1)}>Ek user se har mahine ki kamai</Body>
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="airtel" from={S.airtel[0]} to={S.airtel[1]}>
        <Slot scene={3} at={S.airtel[0]} pill={<NumberPill tag="#02" text="Wajah two" at={S.airtel[0] - 30} />}>
          <InfoCard n="02" icon="A" title="Airtel ARPU" at={S.airtel[0]} footer="Source: TechCrunch">
            <Stat prefix="₹" from={150} to={210} at={t.at(62, 22.5)} label="tha" />
            <Body at={t.at(69, 24.8)}>Target: ₹300 se upar</Body>
          </InfoCard>
        </Slot>
      </SceneBlock>

      <SceneBlock name="result" from={S.result[0]} to={S.result[1]}>
        <Slot scene={4} at={S.result[0]} pill={<NumberPill tag="RESULT" text="Hike ke baad" at={S.result[0]} />}>
          <InfoCard n="✓" icon="↑" title="1 quarter mein" at={S.result[0]} footer="Source: ThePrint / ANI">
            <Body at={t.at(77, 27.3)}>Airtel ka ARPU</Body>
            <Stat prefix="₹" from={211} to={233} at={t.at(82, 28.5)} frames={27} />
          </InfoCard>
          <Stamp text="+₹22" at={t.at(85, 30.4)} rotate={8} style={{ position: "absolute", left: 470, top: 330 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="twist" from={S.twist[0]} to={S.twist[1]}>
        <Slot scene={5} at={S.twist[0]} pill={<NumberPill tag="#03" text="Twist" at={S.twist[0]} />}>
          <InfoCard n="03" icon="?" title="Agla hike?" at={S.twist[0]} footer="Source: Digit, Cashify">
            <Body at={t.at(95, 34.2)}>Analysts ka andaaza</Body>
            <Stat prefix="10–" from={10} to={15} suffix="%" at={t.at(100, 35.8)} frames={12} />
          </InfoCard>
          <Stamp text="abhi confirm nahi" at={t.at(108, 37.5)} rotate={-7} style={{ position: "absolute", left: 290, top: 40 }} />
        </Slot>
      </SceneBlock>

      <SceneBlock name="end" from={S.end[0]} to={S.end[1]}>
        <div style={{ position: "absolute", left: SAFE_BOX.x + 40, top: PILL_TOP + 40, width: SAFE_BOX.width - 80 }}>
          <FollowCard at={S.end[0]} followAt={t.at(117, 40.3)} handle={pb.handle} />
        </div>
      </SceneBlock>

      {avatar !== "none" ? (
        <div style={{ position: "absolute", left: AV.x, top: AV.y }}>
          <Avatar style={avatar} mouth={m} cues={poseCues} size={AV.size} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 560, top: 1110, width: 400, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <KineticWords words={words} keywords={KEYWORDS} width={400} />
      </div>
    </ReelFrame>
  );
};
