// src/schemas/profile.schemas.ts
import { z } from "zod";

// Reusable schema for a street address array
const streetArraySchema = z
  .array(z.string().min(1, "Street line cannot be empty"))
  .min(1, "At least one street line is required");

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  about: z.string().max(160, "About cannot exceed 160 characters").optional(),

  // location is now an object with specific fields:
  location: z
    .object({
      city: z.string().min(1, "City is required").max(100),
      postalCode: z.string().min(1, "Postal code is required").max(20),
      street: streetArraySchema, // array of street lines
      country: z.string().min(1, "Country is required").max(100),
    })
    .optional(),

  website: z.string().url("Must be a valid URL").max(200).optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional(),

  // Updated socialLinks to an array of { platform, url }
  socialLinks: z
    .array(
      z.object({
        platform: z.enum([
          "twitter",
          "github",
          "linkedin",
          "facebook",
          "instagram",
          "youtube",
          "tiktok",
          "other",
        ]),
        url: z.string().url("Must be a valid URL"),
      })
    )
    .optional(),

  // Optional phone number with a basic regex for international format (e.g. +92-301-1234567)
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone number must be in international E.164 format, e.g., +923011234567"
    )
    .optional(),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "Page must be a positive integer")
    .transform(Number)
    .default("1"),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
    .transform(Number)
    .default("10"),
});
