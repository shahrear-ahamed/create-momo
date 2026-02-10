export const getNodeConfig = () => {
  return {
    extends: "./base.json",
    display: "Node.js",
    compilerOptions: {
      lib: ["esnext"],
      module: "node16",
      moduleResolution: "node16",
    },
  };
};
