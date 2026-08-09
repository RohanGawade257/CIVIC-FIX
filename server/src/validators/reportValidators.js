const { z } = require("zod");
const { REPORT_CATEGORIES } = require("../constants/reportCategories");

const reportCoordinatesSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

const createReportSchema = z
  .object({
    category: z.enum(Object.values(REPORT_CATEGORIES)),
    title: z.string().trim().min(4).max(160),
    description: z.string().trim().min(10).max(2000),
    location: z
      .object({
        coordinates: reportCoordinatesSchema,
        displayAddress: z.string().trim().max(300).optional(),
      })
      .strict(),
  })
  .strict();

module.exports = {
  createReportSchema,
  reportCoordinatesSchema,
};
