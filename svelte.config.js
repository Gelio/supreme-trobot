/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const autoPreprocess = require("svelte-preprocess");

module.exports = {
  preprocess: autoPreprocess({
    defaults: {
      script: "typescript",
    },
  }),
};
