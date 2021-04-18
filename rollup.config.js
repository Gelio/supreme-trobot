import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import replace from "@rollup/plugin-replace";
import path from "path";
import dotenv from "dotenv";

const projectRoot = path.resolve(__dirname);

const inputFiles = {
  "marketplaces/allegro": "src/marketplaces/allegro/index.ts",
  "marketplaces/olx": "src/marketplaces/olx/index.ts",
  "service-worker": "src/service-worker.ts",
};

/**
 * NOTE: use multiple configs to inline all dependencies in each output file,
 * without creating common chunks
 */
export default Object.keys(inputFiles).map((inputName) => {
  /** @type {import('rollup').RollupOptions} */
  const config = {
    input: {
      [inputName]: inputFiles[inputName],
    },
    output: {
      dir: "build",
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

  return config;
});

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
