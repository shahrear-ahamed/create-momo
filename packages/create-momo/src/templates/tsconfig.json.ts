export const getBaseTsConfig = () => {
  return {
    extends: "./packages/config-typescript/base.json",
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@/*": ["./packages/*/src", "./apps/*/src"],
      },
    },
    exclude: ["node_modules", "dist"],
  };
};
