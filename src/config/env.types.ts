import type { z } from "zod";
import { EnvSchema } from "./env.mjs";

export type Env = z.infer<typeof EnvSchema>;
