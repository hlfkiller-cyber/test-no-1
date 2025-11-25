'use server';

/**
 * @fileOverview Generates video ideas based on a given niche and trending videos.
 *
 * - generateVideoIdeas - A function that generates video ideas with descriptions.
 * - GenerateVideoIdeasInput - The input type for the generateVideoIdeas function.
 * - GenerateVideoIdeasOutput - The return type for the generateVideoIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoIdeasInputSchema = z.object({
  niche: z.string().describe('The video niche or topic to generate ideas for.'),
});
export type GenerateVideoIdeasInput = z.infer<typeof GenerateVideoIdeasInputSchema>;

const GenerateVideoIdeasOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe('The title of the video idea.'),
        description: z.string().describe('A brief description of the video idea.'),
      })
    )
    .describe('An array of video ideas with titles and descriptions.'),
});
export type GenerateVideoIdeasOutput = z.infer<typeof GenerateVideoIdeasOutputSchema>;

export async function generateVideoIdeas(input: GenerateVideoIdeasInput): Promise<GenerateVideoIdeasOutput> {
  return generateVideoIdeasFlow(input);
}

const trendingVideosTool = ai.defineTool(
  {
    name: 'getTrendingVideos',
    description: 'Retrieves trending videos for a given niche from an external API.',
    inputSchema: z.object({
        niche: z.string().describe('The video niche to search for.'),
    }),
    outputSchema: z.array(z.string()).describe('A list of trending video titles.'),
  },
  async (input) => {
      // Placeholder: Replace with actual API call to fetch trending videos.
      // For now, return some mock data.
      console.log(`getting trending videos for ${input.niche}`);
      return [
          `Trending Video 1 in ${input.niche}`,
          `Trending Video 2 in ${input.niche}`,
          `Trending Video 3 in ${input.niche}`
      ];
  }
);

const generateIdeasPrompt = ai.definePrompt({
  name: 'generateIdeasPrompt',
  input: {schema: GenerateVideoIdeasInputSchema},
  output: {schema: GenerateVideoIdeasOutputSchema},
  tools: [trendingVideosTool],
  prompt: `You are a creative video idea generator. Given a video niche you will generate 5 unique video ideas with brief descriptions. Use the getTrendingVideos tool to get inspiration from current trending videos.

Niche: {{{niche}}}

Generate 5 unique and engaging video ideas inspired by the niche and trending videos. Each idea should have a title and a brief description.

Make sure to output your response in the correct JSON format.
`,
});

const generateVideoIdeasFlow = ai.defineFlow(
  {
    name: 'generateVideoIdeasFlow',
    inputSchema: GenerateVideoIdeasInputSchema,
    outputSchema: GenerateVideoIdeasOutputSchema,
  },
  async input => {
    const {output} = await generateIdeasPrompt(input);
    return output!;
  }
);
