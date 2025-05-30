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
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    EMAIL_FROM: z.string(),
  })
  .parse(process.env);
export default env;
