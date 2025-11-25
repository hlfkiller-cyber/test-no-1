'use server';

/**
 * @fileOverview Generates a fantasy story based on a user's prompt.
 *
 * - generateFantasyStory - A function that generates a fantasy story.
 * - GenerateFantasyStoryInput - The input type for the generateFantasyStory function.
 * - GenerateFantasyStoryOutput - The return type for the generateFantasyStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFantasyStoryInputSchema = z.object({
  prompt: z.string().describe('The user prompt for the story.'),
});
export type GenerateFantasyStoryInput = z.infer<typeof GenerateFantasyStoryInputSchema>;

const GenerateFantasyStoryOutputSchema = z.object({
  story: z.string().describe('The generated fantasy story.'),
});
export type GenerateFantasyStoryOutput = z.infer<typeof GenerateFantasyStoryOutputSchema>;

export async function generateFantasyStory(input: GenerateFantasyStoryInput): Promise<GenerateFantasyStoryOutput> {
  return generateFantasyStoryFlow(input);
}

const generateStoryPrompt = ai.definePrompt({
  name: 'generateFantasyStoryPrompt',
  input: {schema: GenerateFantasyStoryInputSchema},
  output: {schema: GenerateFantasyStoryOutputSchema},
  prompt: `You are a master storyteller, specializing in weaving captivating fantasy tales.
  
  A user will provide you with a prompt, which could be a character, a setting, a situation, or just a few words. Your task is to take that prompt and expand it into a short, engaging fantasy story.

  The story should have a clear beginning, middle, and end. It should be rich with imaginative details, vivid descriptions, and a touch of magic or wonder.

  User's Prompt: {{{prompt}}}

  Craft a fantasy story based on this prompt. Make sure the response is in JSON format.
`,
});

const generateFantasyStoryFlow = ai.defineFlow(
  {
    name: 'generateFantasyStoryFlow',
    inputSchema: GenerateFantasyStoryInputSchema,
    outputSchema: GenerateFantasyStoryOutputSchema,
  },
  async (input: GenerateFantasyStoryInput) => {
    const {output} = await generateStoryPrompt(input);
    return output!;
  }
);
