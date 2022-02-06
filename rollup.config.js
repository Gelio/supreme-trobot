import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import alias from "@rollup/plugin-alias";
import replace from "@rollup/plugin-replace";
import path from "path";
import dotenv from "dotenv";

const projectRoot = path.resolve(__dirname);

const inputFiles = {
  "marketplaces/allegro": "src/marketplaces/allegro/page/content-script.ts",
  "service-worker": "src/worker/service-worker.ts",
};

const snowpackEnvironmentVariables = getSnowpackEnvironmentVariables();

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
        ...snowpackEnvironmentVariables,
        "process.env.NODE_ENV": false,
        preventAssignment: true,
      }),
    ],
  };

  return config;
});

function getSnowpackEnvironmentVariables() {
  const environmentVariables = dotenv.config();
  if (environmentVariables.error) {
    console.warn(
      ".env file not detected. Skipping inlining environment variables. This will cause runtime errors."
    );
    console.warn(environmentVariables.error);
    return {};
  }

  const snowpackEnvironmentVariables = {};

  Object.keys(environmentVariables.parsed)
    .filter((name) => name.startsWith("SNOWPACK_PUBLIC_"))
    .forEach((name) => {
      snowpackEnvironmentVariables[`import.meta.env.${name}`] = JSON.stringify(
        environmentVariables.parsed[name]
      );
    });

  return snowpackEnvironmentVariables;
}
