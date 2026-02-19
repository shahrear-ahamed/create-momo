import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().optional(),
  cwd: z.string().optional(),
  version: z.string().optional(),
});

export type CreateProjectArgs = z.infer<typeof CreateProjectSchema>;

export const AddComponentSchema = z.object({
  type: z.string().optional(),
  options: z
    .object({
      app: z.union([z.boolean(), z.string()]).optional(),
      package: z.union([z.boolean(), z.string()]).optional(),
      dep: z.union([z.boolean(), z.string()]).optional(),
      toApp: z.string().optional(),
      toPkg: z.string().optional(),
      dev: z.boolean().optional(),
      root: z.boolean().optional(),
      flavor: z.string().optional(),
    })
    .optional(),
});

export type AddComponentArgs = z.infer<typeof AddComponentSchema>;
