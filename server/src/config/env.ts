import { z } from "zod";

const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.string().default("8081"),
    CLIENT_ORIGIN: z.string(),
  })
  .parse(process.env);
export default env;
