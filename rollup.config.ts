import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";

export default {
  input: ["src/index.ts"],
  output: {
    file: `dist/index.js`,
    name: "calc",
    format: "iife",
    sourcemap: false,
  },
  plugins: [resolve(), commonjs(), typescript()],
};
