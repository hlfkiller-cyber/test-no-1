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

const AnalyzeTopicInputSchema = z.object({
  topic: z.string().describe('The user-provided topic.'),
});
type AnalyzeTopicInput = z.infer<typeof AnalyzeTopicInputSchema>;

const AnalyzeTopicOutputSchema = z.object({
  analyzedTopic: z.string().describe('A refined and clarified version of the topic, suitable for generating content ideas.'),
});
type AnalyzeTopicOutput = z.infer<typeof AnalyzeTopicOutputSchema>;

const analyzeTopicPrompt = ai.definePrompt({
  name: 'analyzeTopicPrompt',
  input: {schema: AnalyzeTopicInputSchema},
  output: {schema: AnalyzeTopicOutputSchema},
  prompt: `You are an expert at understanding user intent. Your task is to analyze the user's topic and refine it for a content idea generation system.

The user's topic is: {{{topic}}}

Clarify and enrich this topic. For example, if the user enters "React", you might refine it to "The popular JavaScript library for building user interfaces, React.js". If the user enters "MrBeast", you might refine it to "The famous YouTuber known for his extravagant stunts and philanthropy, MrBeast".

Return the refined topic in the 'analyzedTopic' field.
`,
});

const analyzeTopicFlow = ai.defineFlow(
  {
    name: 'analyzeTopicFlow',
    inputSchema: AnalyzeTopicInputSchema,
    outputSchema: AnalyzeTopicOutputSchema,
  },
  async input => {
    const {output} = await analyzeTopicPrompt(input);
    return output!;
  }
);


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
      // Placeholder: Replace with actual API call to fetch trending information.
      // For now, return some mock data.
      console.log(`getting trends for ${input.topic}`);
      return [
          `Trending story about ${input.topic} 1`,
          `Recent controversy involving ${input.topic}`,
          `New feature/update for ${input.topic}`
      ];
  }
);

const generateIdeasPrompt = ai.definePrompt({
  name: 'generateIdeasPrompt',
  input: {schema: z.object({ analyzedTopic: z.string() })},
  output: {schema: GenerateContentIdeasOutputSchema},
  tools: [getTopicTrendsTool],
  prompt: `You are a creative content strategist. Given a topic, person, or tool, you will generate 5 unique and engaging content ideas with brief descriptions. If it's a person, consider recent news, controversies, or popular opinions. If it's a tool, think about tutorials, comparisons, or interesting use cases. Use the getTopicTrends tool to get inspiration from current trends.

Topic: {{{analyzedTopic}}}

Generate 5 unique and engaging content ideas inspired by the topic and recent trends. Each idea should have a title and a brief description.

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
    // First, analyze the topic
    const analyzedResult = await analyzeTopicFlow({ topic: input.topic });
    
    // Then, use the analyzed topic to generate ideas
    const {output} = await generateIdeasPrompt({ analyzedTopic: analyzedResult.analyzedTopic });
    return output!;
  }
);
