import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import path from "path";

const projectRoot = path.resolve(__dirname);

/** @type {import('rollup').RollupOptions} */
const config = {
  input: {
    allegro: "src/marketplaces/allegro/index.ts",
    olx: "src/marketplaces/olx/index.ts",
  },
  output: {
    dir: "build/marketplaces",
    format: "cjs",
  },
  plugins: [
    typescript(),
    nodeResolve(),
    alias({ entries: { "@app": path.resolve(projectRoot, "src") } }),
  ],
};

export default config;
