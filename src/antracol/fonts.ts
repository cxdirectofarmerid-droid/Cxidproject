import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

const faces: { weight: string; style: "normal" | "italic"; file: string }[] = [
  { weight: "300", style: "normal", file: "montserrat-latin-300-normal.woff2" },
  { weight: "600", style: "normal", file: "montserrat-latin-600-normal.woff2" },
  { weight: "700", style: "normal", file: "montserrat-latin-700-normal.woff2" },
  { weight: "900", style: "normal", file: "montserrat-latin-900-normal.woff2" },
  { weight: "400", style: "italic", file: "montserrat-latin-400-italic.woff2" },
  { weight: "500", style: "italic", file: "montserrat-latin-500-italic.woff2" },
];

for (const f of faces) {
  loadFont({
    family: "Montserrat",
    url: staticFile(`fonts/${f.file}`),
    weight: f.weight,
    style: f.style,
  });
}
