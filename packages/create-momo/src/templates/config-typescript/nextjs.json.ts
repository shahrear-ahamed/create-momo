export const getNextjsConfig = () => {
  return {
    extends: "./base.json",
    display: "Next.js",
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"],
      module: "esnext",
      moduleResolution: "bundler",
      noEmit: true,
      resolveJsonModule: true,
      jsx: "preserve",
      plugins: [{ name: "next" }],
    },
  };
};
