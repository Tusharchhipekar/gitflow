import z from "zod";

export const SignupInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(1).optional(),
});

export const SigninInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.number().int(),
    email: z.string().email(),
    name: z.string(),
  }),
});

export const RepoInputSchema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
});

export const ListReposQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const CreateMessageInputSchema = z.object({
  content: z.string().min(1).max(4000),
});

export type SignupInput = z.infer<typeof SignupInputSchema>;
export type SigninInput = z.infer<typeof SigninInputSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RepoInput = z.infer<typeof RepoInputSchema>;
export type CreateRepoInput = z.infer<typeof RepoInputSchema>;
export type ListReposQueryInput = z.infer<typeof ListReposQuerySchema>;
export type CreateMessageInput = z.infer<typeof CreateMessageInputSchema>;
