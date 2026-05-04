const preset = require("../../jest.preset.js");

/** @type {import('jest').Config} */
module.exports = {
  ...preset,
  coverageDirectory: "../../coverage/apps/web",
  displayName: "web",
};
