import { z } from "zod";

export const MomoConfigSchema = z
  .object({
    scope: z.string().startsWith("@").optional().default("@momo"),
    packageScope: z.string().startsWith("@").optional(),
    author: z.string().optional().default("Anonymous"),
    license: z.string().optional().default("MIT"),
    manager: z.enum(["npm", "yarn", "pnpm", "bun"]).optional().default("pnpm"),
  })
  .passthrough();

export type MomoConfig = z.infer<typeof MomoConfigSchema>;
