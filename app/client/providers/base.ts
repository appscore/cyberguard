import { z } from "zod";

export const BaseConfigSchema = z.object({
  model_provider: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  embedding_model: z.string().nullable().optional(),
  embedding_dim: z.number().nullable().optional(),
  configured: z.boolean().nullable().optional(),
  api_key: z.string().nullable().optional(),
  id: z.string().nullable().optional(),
});
