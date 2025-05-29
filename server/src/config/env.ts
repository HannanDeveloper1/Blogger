import { z } from "zod";

const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.string().default("8081"),
    CLIENT_ORIGIN: z.string(),
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    REDIS_URL: z.string(),
    ACCESS_TOKEN_EXP_MINS: z.string().default("15"),
    REFRESH_TOKEN_EXP_DAYS: z.string().default("30"),
  })
  .parse(process.env);
export default env;
