import { createEnv } from "@t3-oss/env-core";
import { clientSchema, runtimeEnv, serverSchema } from "./schema.js";

export const env = createEnv({
  server: serverSchema.shape,
  client: clientSchema.shape,
  runtimeEnv: runtimeEnv,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
