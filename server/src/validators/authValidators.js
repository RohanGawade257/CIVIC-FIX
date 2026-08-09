const { z } = require("zod");

const preferredLocationSchema = z
  .object({
    locality: z.string().trim().min(1).max(300).optional(),
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
  })
  .strict();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
  preferredLocation: preferredLocationSchema.optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
});

module.exports = {
  loginSchema,
  registerSchema,
};
