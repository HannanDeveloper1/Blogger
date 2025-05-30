import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).+$/,
      {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }
    ),
});

export const loginSchema = z.object({
  email: z.string().nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

export const onboardingSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .regex(
      /^[a-z][a-z0-9-]*$/,
      "Username must start with a lowercase letter and only include lowercase letters, numbers, or dashes"
    ),
  profilePicture: z.string().url().optional(),
  about: z.string().max(160).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  socialLinks: z
    .array(z.object({ platform: z.string(), url: z.string().url() }))
    .optional(),
});

export const forgetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// We no longer need uid/token in the POST body—those come in req.query
export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|\\:;"'<>,.?/~`]).+$/,
      {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }
    ),
});
