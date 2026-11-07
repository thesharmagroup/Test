// Fonts, loaded once from local files in public/fonts (no internet needed at
// render time). Remotion waits for them before it renders a frame.
// The files are the Google Fonts variable fonts (latin subset), so every weight
// in the range works. Want another font? Drop its .woff2 in public/fonts and add
// it to FILES below with its family name.
import { continueRender, delayRender, staticFile } from "remotion";

const FILES = {
  Inter: { family: "Inter", file: "fonts/Inter.woff2" },
  SpaceGrotesk: { family: "Space Grotesk", file: "fonts/SpaceGrotesk.woff2" },
  Nunito: { family: "Nunito", file: "fonts/Nunito.woff2" },
} as const;

if (typeof document !== "undefined") {
  for (const { family, file } of Object.values(FILES)) {
    const handle = delayRender(`Loading ${family} font`);
    const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight: "100 900", style: "normal" });
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
} as const;

export type FontName = keyof typeof FONTS;
