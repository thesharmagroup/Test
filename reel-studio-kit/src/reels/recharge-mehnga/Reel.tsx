// Reel "recharge-mehnga": Recharge itna mehnga kyun hua? (about 41 s, Hinglish)
// Every scene cut and pop is taken from a spoken word (public/reels/recharge-mehnga/captions.words.json).
import React from "react";
import { brand as myBrand } from "../../brand";
import { Avatar } from "../../avatars/Avatar";
import { useMouth } from "../../avatars/useMouth";
import type { PoseCue } from "../../avatars/SpritePlayer";
import { BigNumber, Card, EndCard, Karaoke, Line, ReelFrame, SceneBlock, Sticker, Title, type ReelProps } from "../../components";
import { AVATAR_BOX, CAPTION_BOTTOM, SAFE, SAFE_BOX } from "../../layout";
import { timing } from "../../timing";
import mouth from "../../../public/reels/recharge-mehnga/mouth.json";
import words from "../../../public/reels/recharge-mehnga/captions.words.json";

export const t = timing(words);
export const AUDIO = "reels/recharge-mehnga/vo.wav";
export const durationInFrames = t.duration();

// Word indexes (see captions.words.json): 8 "3" (July), 25 "Pehli", 46 "Doosri",
// 57 "Airtel", 74 "Hike", 87 "Lekin", 112 "Aise".
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

// Sprite avatars only (the default flat mascot ignores these).
const poseCues: PoseCue[] = [
  { at: 0, pose: "shrug" },
  { at: 3.2, pose: "explain" },
  { at: 8.8, pose: "one" },
  { at: 16.2, pose: "two" },
  { at: 20.5, pose: "present" },
  { at: 26.1, pose: "thumbs-up" },
  { at: 31.2, pose: "finger-up" },
  { at: 38.7, pose: "point-down" },
];

const box = (top: number): React.CSSProperties => ({ position: "absolute", left: SAFE_BOX.x, top, width: SAFE_BOX.width });

export const Reel: React.FC<ReelProps> = ({ brand = myBrand, avatar = "flat", debugSafeZones, probe }) => {
  const m = useMouth(mouth, words);
  return (
    <ReelFrame brand={brand} audio={AUDIO} debugSafeZones={debugSafeZones} probe={probe}>
      {/* 1. Hook */}
      <SceneBlock name="hook" from={S.hook[0]} to={S.hook[1]}>
        <div style={box(SAFE.top + 40)}>
          <Title text="₹209 ka recharge ab ₹249 kyun?" highlight="₹249" at={0} size={104} />
        </div>
        <Sticker text="+₹40" at={t.at(5, 1.8)} rotate={8} style={{ position: "absolute", left: 640, top: 700 }} />
      </SceneBlock>

      {/* 2. The July 2024 hike */}
      <SceneBlock name="hike" from={S.hike[0]} to={S.hike[1]}>
        <div style={box(300)}>
          <Card at={S.hike[0]}>
            <Line first at={S.hike[0]}>3 July 2024</Line>
            <div style={{ height: 28 }} />
            <BigNumber from={10} to={25} suffix="%" at={t.at(17, 6.3)} countFrames={18} label={<>tak<br />mehnge</>} size={200} tracked={false} />
          </Card>
        </div>
        <Sticker text="Jio + Airtel" at={t.at(12, 5.0)} rotate={-6} style={{ position: "absolute", left: 560, top: 250 }} />
      </SceneBlock>

      {/* 3. Reason 1: 5G */}
      <SceneBlock name="fiveG" from={S.fiveG[0]} to={S.fiveG[1]}>
        <div style={box(300)}>
          <Card at={S.fiveG[0]}>
            <Line first at={S.fiveG[0]}>Wajah 1: 5G</Line>
            <Line at={t.at(28, 10.3)}>Sirf 5G spectrum par</Line>
            <div style={{ height: 20 }} />
            <BigNumber prefix="$" to={20} suffix="B+" at={t.at(34, 12.6)} label="kharch" size={170} tracked={false} />
          </Card>
        </div>
        <Sticker text="paisa wapas chahiye" at={t.at(41, 15.1)} rotate={-5} style={{ position: "absolute", left: 300, top: 860 }} />
      </SceneBlock>

      {/* 4. Reason 2: what ARPU means */}
      <SceneBlock name="arpu" from={S.arpu[0]} to={S.arpu[1]}>
        <div style={box(300)}>
          <Card at={S.arpu[0]}>
            <Line first at={S.arpu[0]}>Wajah 2: ARPU</Line>
            <Line at={t.at(49, 18.1)}>= ek user se har mahine ki kamai</Line>
          </Card>
        </div>
      </SceneBlock>

      {/* 5. Airtel ARPU vs target */}
      <SceneBlock name="airtel" from={S.airtel[0]} to={S.airtel[1]}>
        <div style={box(300)}>
          <Card at={S.airtel[0]}>
            <Line first at={S.airtel[0]}>Airtel ka ARPU</Line>
            <div style={{ height: 20 }} />
            <BigNumber prefix="₹" to={210} at={t.at(62, 22.5)} label="tha" size={170} tracked={false} />
            <Line at={t.at(69, 24.8)}>Target: ₹300+</Line>
          </Card>
        </div>
      </SceneBlock>

      {/* 6. Result after the hike */}
      <SceneBlock name="result" from={S.result[0]} to={S.result[1]}>
        <div style={box(300)}>
          <Card at={S.result[0]}>
            <Line first at={S.result[0]}>Hike ke baad, sirf 1 quarter</Line>
            <div style={{ height: 20 }} />
            <BigNumber prefix="₹" from={211} to={233} at={t.at(82, 28.5)} countFrames={27} label="ARPU" size={170} tracked={false} />
          </Card>
        </div>
        <Sticker text="+₹22" at={t.at(85, 30.4)} rotate={7} style={{ position: "absolute", left: 640, top: 860 }} />
      </SceneBlock>

      {/* 7. Twist: another hike is forecast */}
      <SceneBlock name="twist" from={S.twist[0]} to={S.twist[1]}>
        <div style={box(SAFE.top + 40)}>
          <Title text="Ye last hike nahi hai" highlight="last hike" at={S.twist[0]} size={96} />
        </div>
        <div style={box(490)}>
          <Card at={t.at(95, 34.2)}>
            <Line first at={t.at(95, 34.2)}>Analysts ka andaaza:</Line>
            <div style={{ height: 20 }} />
            <BigNumber prefix="10–" from={10} to={15} suffix="%" at={t.at(100, 35.8)} countFrames={12} label="agla hike?" size={120} tracked={false} />
          </Card>
        </div>
        <Sticker text="abhi confirm nahi" at={t.at(108, 37.5)} rotate={-6} style={{ position: "absolute", left: 460, top: 900 }} />
      </SceneBlock>

      {/* 8. Follow CTA */}
      <SceneBlock name="end" from={S.end[0]} to={S.end[1]}>
        <div style={box(300)}>
          <EndCard keyword="FOLLOW" lead="Aise aur updates ke liye" label="" sub="" at={S.end[0]} />
        </div>
      </SceneBlock>

      {/* Always on: talking character + captions */}
      {avatar !== "none" ? (
        <div style={{ position: "absolute", left: AVATAR_BOX.x, top: AVATAR_BOX.y }}>
          <Avatar style={avatar} mouth={m} cues={poseCues} size={AVATAR_BOX.size} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: SAFE_BOX.x, width: SAFE_BOX.width, bottom: CAPTION_BOTTOM }}>
        <Karaoke words={words} perChunk={4} keywords={["5G", "ARPU", "twist", "follow"]} />
      </div>
    </ReelFrame>
  );
};
