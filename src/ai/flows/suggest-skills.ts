'use server';

/**
 * @fileOverview An AI agent that suggests skills based on existing skills and interests.
 *
 * - suggestSkills - A function that suggests skills to add to a user's profile.
 * - SuggestSkillsInput - The input type for the suggestSkills function.
 * - SuggestSkillsOutput - The return type for the suggestSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSkillsInputSchema = z.object({
  existingSkills: z
    .array(z.string())
    .describe('A list of skills the user already possesses.'),
  interests: z
    .string()
    .describe('A description of the user\'s interests and goals.'),
});

export type SuggestSkillsInput = z.infer<typeof SuggestSkillsInputSchema>;

const SuggestSkillsOutputSchema = z.object({
  suggestedSkills: z
    .array(z.string())
    .describe('A list of suggested skills the user could add to their profile.'),
});

export type SuggestSkillsOutput = z.infer<typeof SuggestSkillsOutputSchema>;

export async function suggestSkills(input: SuggestSkillsInput): Promise<SuggestSkillsOutput> {
  return suggestSkillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSkillsPrompt',
  input: {schema: SuggestSkillsInputSchema},
  output: {schema: SuggestSkillsOutputSchema},
  prompt: `You are a career counselor who helps people identify new skills to learn.

Given a user's existing skills and interests, suggest a list of skills they could add to their profile.

Existing Skills: {{existingSkills}}
Interests: {{interests}}

Suggested Skills:`,
});

const suggestSkillsFlow = ai.defineFlow(
  {
    name: 'suggestSkillsFlow',
    inputSchema: SuggestSkillsInputSchema,
    outputSchema: SuggestSkillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
