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
      app: z.boolean().optional(),
      package: z.boolean().optional(),
    })
    .optional(),
});

export type AddComponentArgs = z.infer<typeof AddComponentSchema>;
