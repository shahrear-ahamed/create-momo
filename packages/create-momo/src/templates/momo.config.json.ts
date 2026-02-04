export const getMomoConfig = (scope: string, packageManager: string) => {
  return {
    packageScope: scope,
    manager: packageManager,
  };
};
