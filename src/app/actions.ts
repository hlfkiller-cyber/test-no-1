'use server';

import { generateContentIdeas, type GenerateContentIdeasInput, type GenerateContentIdeasOutput } from '@/ai/flows/generate-video-ideas';
import { expandContentIdeaDetails, type ExpandContentIdeaDetailsInput, type ExpandContentIdeaDetailsOutput } from '@/ai/flows/expand-video-idea-details';
import { generateFantasyStory, type GenerateFantasyStoryInput, type GenerateFantasyStoryOutput } from '@/ai/flows/generate-fantasy-story';

export async function handleGenerateIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  try {
    const result = await generateContentIdeas(input);
    return result;
  } catch (error) {
    console.error('Error generating content ideas:', error);
    throw new Error('Failed to generate content ideas.');
  }
}

export async function handleExpandIdea(input: ExpandContentIdeaDetailsInput): Promise<ExpandContentIdeaDetailsOutput> {
    try {
        const result = await expandContentIdeaDetails(input);
        return result;
    } catch (error) {
        console.error('Error expanding content idea:', error);
        throw new Error('Failed to expand content idea.');
    }
}

export async function handleGenerateStory(input: GenerateFantasyStoryInput): Promise<GenerateFantasyStoryOutput> {
  try {
    const result = await generateFantasyStory(input);
    return result;
  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error('Failed to generate story.');
  }
}
