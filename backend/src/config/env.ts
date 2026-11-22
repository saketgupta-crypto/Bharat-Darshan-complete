import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  FRONTEND_URL: z.string().url(),
  // Gemini (server-side only). GEMINI_MODEL has no default on purpose: pick a currently supported free-tier model from https://ai.google.dev/gemini-api/docs/models
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().optional().default(""),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().min(5000).max(120_000).default(60_000),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(1024).max(65_536).default(16_000),
  // Optional Google Search grounding (separate call; may not be free/available for every model or tier).
  GEMINI_GROUNDING: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
  // Free/open travel-data providers (all overridable; you may self-host them).
  NOMINATIM_URL: z.string().url().default("https://nominatim.openstreetmap.org"),
  OVERPASS_URL: z.string().url().default("https://overpass-api.de/api/interpreter"),
  OSRM_URL: z.string().default("https://router.project-osrm.org"), // empty string disables road routing
  WIKIPEDIA_API_URL: z.string().url().default("https://en.wikipedia.org/api/rest_v1"),
  // OSM policies require an identifying User-Agent with contact info.
  TRAVEL_DATA_USER_AGENT: z.string().min(5).default("BharatDarshan/1.0 (set TRAVEL_DATA_USER_AGENT with your contact email)"),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  // RESEND_API_KEY: z.string().optional().default(""),
  // EMAIL_FROM: z.string().optional().default(""),
  SMTP_HOST: z.string().default("smtp-relay.brevo.com"),

SMTP_PORT: z.coerce.number().default(2525),

SMTP_SECURE: z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true"),

SMTP_USER: z.string().optional().default(""),

SMTP_PASS: z.string().optional().default(""),

SMTP_FROM_NAME: z.string().default("Bharat Darshan"),

SMTP_FROM_EMAIL: z.string().email().optional().or(z.literal("")).default(""),
  SEED_SUPER_ADMIN_EMAIL: z.string().optional().default(""),
  SEED_SUPER_ADMIN_PASSWORD: z.string().optional().default(""),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
