'use server';

/**
 * @fileOverview Expands a content idea into a detailed breakdown, including script outline, thumbnail concepts, title suggestions, and a description draft.
 *
 * - expandContentIdeaDetails - A function that takes a content idea as input and returns a detailed breakdown.
 * - ExpandContentIdeaDetailsInput - The input type for the expandContentIdeaDetails function.
 * - ExpandContentIdeaDetailsOutput - The return type for the expandContentIdeaDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandContentIdeaDetailsInputSchema = z.object({
  topic: z.string().describe('The content topic, person, or tool.'),
  idea: z.string().describe('The content idea to expand on.'),
});
export type ExpandContentIdeaDetailsInput = z.infer<
  typeof ExpandContentIdeaDetailsInputSchema
>;

const ExpandContentIdeaDetailsOutputSchema = z.object({
  scriptOutline: z.string().describe('A detailed script outline for the content.'),
  thumbnailConcepts: z
    .string()
    .describe('Thumbnail concepts for the content.'),
  titleSuggestions: z.array(z.string()).describe('Suggested titles for the content.'),
  videoDescriptionDraft: z
    .string()
    .describe('A draft of the content description.'),
});
export type ExpandContentIdeaDetailsOutput = z.infer<
  typeof ExpandContentIdeaDetailsOutputSchema
>;

export async function expandContentIdeaDetails(
  input: ExpandContentIdeaDetailsInput
): Promise<ExpandContentIdeaDetailsOutput> {
  return expandContentIdeaDetailsFlow(input);
}

const expandContentIdeaDetailsPrompt = ai.definePrompt({
  name: 'expandContentIdeaDetailsPrompt',
  input: {schema: ExpandContentIdeaDetailsInputSchema},
  output: {schema: ExpandContentIdeaDetailsOutputSchema},
  prompt: `You are a creative content strategist who excels at providing detailed breakdowns for content ideas, focusing on script outlines, thumbnail concepts, title suggestions, and video descriptions.

  Given the following topic and idea, provide a detailed breakdown:

  Topic: {{{topic}}}
  Idea: {{{idea}}}

  Your breakdown should include:
  - A detailed script outline that covers the key points and structure of the video. The script outline should be a multi-line string, with each line representing a scene or a talking point.
  - Creative and engaging thumbnail concepts designed to capture viewer attention.
  - A list of catchy title suggestions optimized for search and click-through rates.
  - A compelling video description draft that summarizes the content and encourages engagement.
  Make sure the title suggestions are returned as a JSON array of strings.
  Make sure the response is in JSON format.
  `,
});

const expandContentIdeaDetailsFlow = ai.defineFlow(
  {
    name: 'expandContentIdeaDetailsFlow',
    inputSchema: ExpandContentIdeaDetailsInputSchema,
    outputSchema: ExpandContentIdeaDetailsOutputSchema,
  },
  async input => {
    const {output} = await expandContentIdeaDetailsPrompt(input);
    return output!;
  }
);
