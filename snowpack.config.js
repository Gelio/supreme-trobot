/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: "/", static: true },
    src: { url: "/dist" },
  },
  plugins: [
    // Force emitting CSS when rebuilding
    ["@snowpack/plugin-svelte", { compilerOptions: { css: true } }],
    "@snowpack/plugin-dotenv",
    [
      "@snowpack/plugin-typescript",
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? { tsc: "yarn pnpify tsc" } : {}),
      },
    ],
  ],
  alias: {
    "@app": "./src",
  },
  routes: [],
  optimize: {},
  packageOptions: {},
  devOptions: {},
  buildOptions: {
    metaUrlPath: "snowpack-meta",
  },
};
