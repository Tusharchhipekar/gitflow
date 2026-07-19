import { z } from "zod";

export const SectionPlanSchema = z.object({
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  pathHints: z.array(z.string().min(1)).min(1),
});

export const SectionPlanArraySchema = z.array(SectionPlanSchema).min(1);

export const PagePlanSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case"),
  title: z.string().min(1),
  order: z.number().int().nonnegative(),
  sourceFiles: z.array(z.string().min(1)).min(1),
});

export const PagePlanArraySchema = z.array(PagePlanSchema).min(1);

export type SectionPlan = z.infer<typeof SectionPlanSchema>;
export type PagePlan = z.infer<typeof PagePlanSchema>;
