import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import replace from "@rollup/plugin-replace";
import path from "path";
import dotenv from "dotenv";

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
    replace({
      ...getSnowpackEnvironmentVariables(),
      preventAssignment: true,
    }),
  ],
};

export default config;

function getSnowpackEnvironmentVariables() {
  const environmentVariables = dotenv.config();
  const snowpackEnvironmentVariables = { ...environmentVariables.parsed };

  Object.keys(environmentVariables.parsed)
    .filter((name) => !name.startsWith("SNOWPACK_PUBLIC_"))
    .forEach((name) => {
      delete snowpackEnvironmentVariables[name];
    });

  return snowpackEnvironmentVariables;
}
