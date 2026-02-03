import { z } from "zod";

export const validators = {
  projectName: (name: string): string | undefined => {
    const schema = z
      .string()
      .min(1, "Project name cannot be empty")
      .max(214, "Project name is too long")
      .regex(
        /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
        "Project name must be a valid npm package name (lowercase, no spaces, allowed special chars: -_.)",
      )
      .refine((val) => !["node_modules", "favicon.ico"].includes(val), {
        message: "Project name is reserved",
      });

    const result = schema.safeParse(name);
    if (!result.success) {
      return result.error.errors[0]?.message || "Invalid project name";
    }
    return undefined; // Return undefined if valid (clack convention)
  },

  scopeName: (scope: string): string | undefined => {
    const schema = z
      .string()
      .regex(
        /^@[a-z0-9-~][a-z0-9-._~]*$/,
        "Scope must start with @ and be a valid npm scope",
      );
    const result = schema.safeParse(scope);
    if (!result.success) {
      return result.error.errors[0]?.message || "Invalid scope name";
    }
    return undefined;
  },
};
