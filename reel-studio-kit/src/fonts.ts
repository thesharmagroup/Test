// Fonts, loaded once from local files in public/fonts (no internet needed at
// render time). Remotion waits for them before it renders a frame.
// The sans files are the Google Fonts variable fonts (latin subset), so every
// weight in the range works. Want another font? Drop its .woff2 in public/fonts
// and add it to FILES below with its family name.
import { continueRender, delayRender, staticFile } from "remotion";

type Face = { family: string; file: string; weight?: string; style?: "normal" | "italic" };

const FILES = {
  Inter: { family: "Inter", file: "fonts/Inter.woff2", weight: "100 900" },
  SpaceGrotesk: { family: "Space Grotesk", file: "fonts/SpaceGrotesk.woff2", weight: "300 700" },
  Nunito: { family: "Nunito", file: "fonts/Nunito.woff2", weight: "200 1000" },
  DMSerif: { family: "DM Serif Display", file: "fonts/DMSerifDisplay.woff2", weight: "400" },
} as const satisfies Record<string, Face>;

// Extra faces of a family that is already in FILES (no FONTS key of their own).
const EXTRA: Face[] = [{ family: "DM Serif Display", file: "fonts/DMSerifDisplay-Italic.woff2", weight: "400", style: "italic" }];

if (typeof document !== "undefined") {
  for (const { family, file, weight = "400", style = "normal" } of [...Object.values(FILES), ...EXTRA] as Face[]) {
    const handle = delayRender(`Loading ${family} ${style} font`);
    const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight, style });
    face
      .load()
      .then((f) => (document.fonts as unknown as Set<FontFace>).add(f))
      .catch((e) => console.error(`Could not load ${family}`, e))
      .finally(() => continueRender(handle));
  }
}

export const FONTS = {
  Inter: FILES.Inter.family,
  SpaceGrotesk: FILES.SpaceGrotesk.family,
  Nunito: FILES.Nunito.family,
  DMSerif: FILES.DMSerif.family,
} as const;

export type FontName = keyof typeof FONTS;
