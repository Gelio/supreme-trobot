import typescript from "@rollup/plugin-typescript";

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
  plugins: [typescript()],
};

export default config;
