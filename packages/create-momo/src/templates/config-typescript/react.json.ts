export const getReactConfig = () => {
  return {
    extends: "./base.json",
    display: "React",
    compilerOptions: {
      lib: ["dom", "dom.iterable", "esnext"],
      module: "esnext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
    },
  };
};
