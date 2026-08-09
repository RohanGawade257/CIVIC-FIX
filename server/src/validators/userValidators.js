const { z } = require("zod");

const coordinatesSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

const preferredLocationSchema = z
  .object({
    locality: z.string().trim().min(1).max(120).optional(),
    coordinates: coordinatesSchema.optional(),
  })
  .strict()
  .refine((value) => value.locality !== undefined || value.coordinates !== undefined);

const notificationPreferencesSchema = z
  .object({
    statusUpdates: z.boolean().optional(),
    resolutionRequests: z.boolean().optional(),
  })
  .strict()
  .refine((value) => value.statusUpdates !== undefined || value.resolutionRequests !== undefined);

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    preferredLocation: preferredLocationSchema.nullable().optional(),
    notificationPreferences: notificationPreferencesSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);

module.exports = {
  updateProfileSchema,
};
