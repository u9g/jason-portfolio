import midnightSkyImg from "../assets/midnightskyimage.png";
import vueLogo from "../assets/vue.svg";
import ceriumImg from "../assets/ceriumlogoimage2.png";

// Logo image to display next to a job/project entry, keyed by the entry's slug.
export const entryLogos: Record<string, string> = {
  "midnight-sky": midnightSkyImg,
  "dataset-ai": "https://raw.githubusercontent.com/brendanballon/sfsymbols-svg/master/symbols/pencil.and.outline.svg",
  "Vue-technology": vueLogo,
  unoroyale: "https://raw.githubusercontent.com/u9g/unoroyale/main/public/logo.svg",
  learntensors: "https://raw.githubusercontent.com/u9g/learntensors/main/public/favicon.svg",
  "color-picker": "https://raw.githubusercontent.com/u9g/color-picker/main/logo.svg",
  cerium: ceriumImg,
  portfolio: "https://raw.githubusercontent.com/u9g/jason-portfolio/main/public/favicon.svg",
};

// Slugs whose logo should render at half the default size (e.g. simple
// glyph icons that look overwhelming at the full project-logo width).
export const halfSizeLogos = new Set(["dataset-ai", "Vue-technology"]);
