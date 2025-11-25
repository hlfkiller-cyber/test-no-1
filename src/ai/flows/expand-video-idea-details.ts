'use server';

/**
 * @fileOverview Expands a video idea into a detailed breakdown, including script outline, thumbnail concepts, title suggestions, and a video description draft.
 *
 * - expandVideoIdeaDetails - A function that takes a video idea as input and returns a detailed breakdown.
 * - ExpandVideoIdeaDetailsInput - The input type for the expandVideoIdeaDetails function.
 * - ExpandVideoIdeaDetailsOutput - The return type for the expandVideoIdeaDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpandVideoIdeaDetailsInputSchema = z.object({
  niche: z.string().describe('The video niche or topic.'),
  idea: z.string().describe('The video idea to expand on.'),
});
export type ExpandVideoIdeaDetailsInput = z.infer<
  typeof ExpandVideoIdeaDetailsInputSchema
>;

const ExpandVideoIdeaDetailsOutputSchema = z.object({
  scriptOutline: z.string().describe('A detailed script outline for the video.'),
  thumbnailConcepts: z
    .string()
    .describe('Thumbnail concepts for the video.'),
  titleSuggestions: z.array(z.string()).describe('Suggested titles for the video.'),
  videoDescriptionDraft: z
    .string()
    .describe('A draft of the video description.'),
});
export type ExpandVideoIdeaDetailsOutput = z.infer<
  typeof ExpandVideoIdeaDetailsOutputSchema
>;

export async function expandVideoIdeaDetails(
  input: ExpandVideoIdeaDetailsInput
): Promise<ExpandVideoIdeaDetailsOutput> {
  return expandVideoIdeaDetailsFlow(input);
}

const expandVideoIdeaDetailsPrompt = ai.definePrompt({
  name: 'expandVideoIdeaDetailsPrompt',
  input: {schema: ExpandVideoIdeaDetailsInputSchema},
  output: {schema: ExpandVideoIdeaDetailsOutputSchema},
  prompt: `You are a creative video strategist who excels at providing detailed breakdowns for video ideas, focusing on script outlines, thumbnail concepts, title suggestions, and video descriptions.

  Given the following video niche and idea, provide a detailed breakdown:

  Niche: {{{niche}}}
  Idea: {{{idea}}}

  Your breakdown should include:
  - A detailed script outline that covers the key points and structure of the video. The script outline should be a multi-line string, with each line representing a scene or a talking point.
  - Creative and engaging thumbnail concepts designed to capture viewer attention.
  - A list of catchy title suggestions optimized for search and click-through rates.
  - A compelling video description draft that summarizes the video and encourages viewers to watch.
  Make sure the title suggestions are returned as a JSON array of strings.
  Make sure the response is in JSON format.
  `,
});

const expandVideoIdeaDetailsFlow = ai.defineFlow(
  {
    name: 'expandVideoIdeaDetailsFlow',
    inputSchema: ExpandVideoIdeaDetailsInputSchema,
    outputSchema: ExpandVideoIdeaDetailsOutputSchema,
  },
  async input => {
    const {output} = await expandVideoIdeaDetailsPrompt(input);
    return output!;
  }
);
