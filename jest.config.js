import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(readFileSync(`${__dirname}/.swcrc`, "utf-8"));

export default {
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      { ...config /* custom configuration in Jest */ },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};
