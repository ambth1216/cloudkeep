import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").optional(),
  type: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  folderId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
