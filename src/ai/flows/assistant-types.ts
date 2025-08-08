import { z } from 'genkit';

export const AssistantInputSchema = z.object({
  userId: z.string(),
  message: z.string(),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;
