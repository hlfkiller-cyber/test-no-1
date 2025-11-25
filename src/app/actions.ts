'use server';

import { generateVideoIdeas, type GenerateVideoIdeasInput, type GenerateVideoIdeasOutput } from '@/ai/flows/generate-video-ideas';
import { expandVideoIdeaDetails, type ExpandVideoIdeaDetailsInput, type ExpandVideoIdeaDetailsOutput } from '@/ai/flows/expand-video-idea-details';

export async function handleGenerateIdeas(input: GenerateVideoIdeasInput): Promise<GenerateVideoIdeasOutput> {
  try {
    const result = await generateVideoIdeas(input);
    return result;
  } catch (error) {
    console.error('Error generating video ideas:', error);
    throw new Error('Failed to generate video ideas.');
  }
}

export async function handleExpandIdea(input: ExpandVideoIdeaDetailsInput): Promise<ExpandVideoIdeaDetailsOutput> {
    try {
        const result = await expandVideoIdeaDetails(input);
        return result;
    } catch (error) {
        console.error('Error expanding video idea:', error);
        throw new Error('Failed to expand video idea.');
    }
}
