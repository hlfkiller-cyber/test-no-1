'use server';

/**
 * @fileOverview Generates content ideas based on a given topic, person, or tool.
 *
 * - generateContentIdeas - A function that generates content ideas with descriptions.
 * - GenerateContentIdeasInput - The input type for the generateContentIdeas function.
 * - GenerateContentIdeasOutput - The return type for the generateContentIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentIdeasInputSchema = z.object({
  topic: z.string().describe('The topic, person, or tool to generate ideas for.'),
});
export type GenerateContentIdeasInput = z.infer<typeof GenerateContentIdeasInputSchema>;

const GenerateContentIdeasOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe('The title of the content idea.'),
        description: z.string().describe('A brief description of the content idea.'),
      })
    )
    .describe('An array of content ideas with titles and descriptions.'),
});
export type GenerateContentIdeasOutput = z.infer<typeof GenerateContentIdeasOutputSchema>;

export async function generateContentIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  return generateContentIdeasFlow(input);
}

const getTopicTrendsTool = ai.defineTool(
  {
    name: 'getTopicTrends',
    description: 'Retrieves trending information, controversies, or recent news for a given topic, person, or tool from an external API.',
    inputSchema: z.object({
        topic: z.string().describe('The topic, person, or tool to search for.'),
    }),
    outputSchema: z.array(z.string()).describe('A list of trending topics or news headlines.'),
  },
  async (input) => {
      // This tool is a placeholder. The prompt is written to behave as if this tool provides real-time data.
      console.log(`(Placeholder) getting trends for ${input.topic}`);
      return [
          `Latest news about ${input.topic}`,
          `Recent controversy involving ${input.topic}`,
          `New update for ${input.topic}`
      ];
  }
);

const generateIdeasPrompt = ai.definePrompt({
  name: 'generateIdeasPrompt',
  input: {schema: GenerateContentIdeasInputSchema},
  output: {schema: GenerateContentIdeasOutputSchema},
  tools: [getTopicTrendsTool],
  prompt: `You are a creative content strategist with access to real-time news and trends. Your first step is to understand and clarify the user's topic. Then, given the topic, you must generate 5 unique and engaging content ideas. Your top priority is to focus on the most recent events, news, controversies, and discussions.

  For example, if the user enters "React", you should interpret it as "The popular JavaScript library for building user interfaces, React.js". If the user enters "MrBeast", you should interpret it as "The famous YouTuber known for his extravagant stunts and philanthropy, MrBeast".

  Use your knowledge of the absolute latest information to generate ideas. The getTopicTrends tool will give you a starting point, but you should expand on it with your broader, up-to-the-minute knowledge.

  User's Topic: {{{topic}}}

  Generate 5 content ideas that are timely and relevant, prioritizing recent happenings. Each idea must have a title and a brief description. Ensure the ideas are ordered from most recent/trending to oldest.

  Make sure to output your response in the correct JSON format.
`,
});

const generateContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateContentIdeasFlow',
    inputSchema: GenerateContentIdeasInputSchema,
    outputSchema: GenerateContentIdeasOutputSchema,
  },
  async (input: GenerateContentIdeasInput) => {
    const {output} = await generateIdeasPrompt(input);
    return output!;
  }
);
