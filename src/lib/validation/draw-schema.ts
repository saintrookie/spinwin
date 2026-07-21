import { z } from "zod";

export const createPrizeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(1000).optional(),
  quantity: z.number().int().positive().max(100000),
  displayOrder: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
});

export const updatePrizeSchema = createPrizeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const updateSettingsSchema = z.object({
  rollDurationMs: z.number().int().min(500).max(60000).optional(),
  rollSpeedMs: z.number().int().min(20).max(2000).optional(),
  soundEnabled: z.boolean().optional(),
  confettiEnabled: z.boolean().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const spinSchema = z.object({
  prizeId: z.string().uuid(),
  count: z.number().int().positive().max(1000).default(1),
});
