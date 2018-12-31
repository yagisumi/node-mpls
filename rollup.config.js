import typescript from "rollup-plugin-typescript2"

export default {
  input: "./src/mpls.ts",
  output: {
    file: "./lib/mpls.js",
    format: "cjs",
    sourcemap: true,
    sourcemapExcludeSources: true,
  },

  plugins: [
    typescript({
      tsconfig: "./src/tsconfig.json",
      tsconfigOverride: {
        compilerOptions: {
          module: "es2015",
          sourceMap: true,
          declaration: false,
        },
      },
    }),
  ],
}
