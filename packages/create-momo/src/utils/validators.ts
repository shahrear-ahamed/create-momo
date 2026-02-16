import { z } from "zod";

export const validators = {
  projectName: (name: string | undefined): string | undefined => {
    if (!name) return "Project name cannot be empty";

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
      return result.error.issues[0]?.message || "Invalid project name";
    }
    return undefined;
  },

  scopeName: (scope: string | undefined): string | undefined => {
    if (!scope) return "Scope cannot be empty";

    const schema = z
      .string()
      .regex(/^@[a-z0-9-~][a-z0-9-._~]*$/, "Scope must start with @ and be a valid npm scope");
    const result = schema.safeParse(scope);
    if (!result.success) {
      return result.error.issues[0]?.message || "Invalid scope name";
    }
    return undefined;
  },
};
