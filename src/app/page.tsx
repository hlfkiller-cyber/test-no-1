
"use client";

import { useState, useEffect } from 'react';
import type { GenerateVideoIdeasOutput } from '@/ai/flows/generate-video-ideas';
import type { ExpandVideoIdeaDetailsOutput } from '@/ai/flows/expand-video-idea-details';
import { handleGenerateIdeas, handleExpandIdea } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, History, Trash2, Save } from 'lucide-react';
import { Header } from '@/components/app/header';
import { IdeaCard } from '@/components/app/idea-card';
import { IdeaDetailsDialog } from '@/components/app/idea-details-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { LoginDialog } from '@/components/app/login-dialog';

type Idea = GenerateVideoIdeasOutput['ideas'][0] & { id?: string };

const ANONYMOUS_SEARCH_LIMIT = 5;

export default function Home() {
    const [niche, setNiche] = useState('');
    const [lastSearchedNiche, setLastSearchedNiche] = useState('');
    const [ideas, setIdeas] = useState<Idea[] | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [expandedDetails, setExpandedDetails] = useState<ExpandVideoIdeaDetailsOutput | null>(null);
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
    const [isExpandingDetails, setIsExpandingDetails] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const onGenerateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!niche.trim()) {
            toast({ title: "Niche required", description: "Please enter a video niche to generate ideas.", variant: "destructive" });
            return;
        }

        if (!user) {
            const anonymousSearches = parseInt(localStorage.getItem('anonymousSearches') || '0', 10);
            if (anonymousSearches >= ANONYMOUS_SEARCH_LIMIT) {
                setShowLoginPrompt(true);
                return;
            }
            localStorage.setItem('anonymousSearches', (anonymousSearches + 1).toString());
        }
        
        setIsLoadingIdeas(true);
        setIdeas(null);
        setExpandedDetails(null);
        setSelectedIdea(null);
        setLastSearchedNiche(niche);

        try {
            const result = await handleGenerateIdeas({ niche });
            if(result.ideas.length === 0){
                toast({ title: "No ideas found", description: "The AI couldn't generate ideas for this niche. Try being more specific.", variant: "destructive" });
                setIdeas([]);
            } else {
                setIdeas(result.ideas);
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Generation Error", description: "Failed to generate ideas. Please try again later.", variant: "destructive" });
        } finally {
            setIsLoadingIdeas(false);
        }
    };
    
    const handleSaveIdea = async (idea: Idea, niche: string) => {
        if (!user || !firestore) {
            toast({ title: "Login Required", description: "Please log in to save your ideas.", variant: "destructive" });
            return;
        }

        if (!expandedDetails) {
            toast({ title: "Details Missing", description: "Please expand the idea before saving.", variant: "destructive" });
            return;
        }

        const videoIdeaRef = collection(firestore, 'users', user.uid, 'videoIdeas');
        
        const newVideoIdea = {
            userId: user.uid,
            niche: niche,
            title: idea.title,
            description: idea.description,
            scriptOutline: expandedDetails.scriptOutline,
            thumbnailConcept: expandedDetails.thumbnailConcepts,
            videoDescriptionDraft: expandedDetails.videoDescriptionDraft,
            createdAt: new Date().toISOString(),
        };

        try {
            await addDocumentNonBlocking(videoIdeaRef, newVideoIdea);
            toast({ title: "Idea Saved!", description: `"${idea.title}" has been saved to your collection.` });
        } catch (error) {
            console.error("Error saving idea:", error);
            toast({ title: "Save Error", description: "Could not save the idea. Please try again.", variant: "destructive" });
        }
    };


    const onExpandClick = async (idea: Idea, niche: string) => {
        setSelectedIdea(idea);
        setIsExpandingDetails(true);
        setExpandedDetails(null);
        
        try {
            const result = await handleExpandIdea({ niche: niche, idea: idea.title });
            setExpandedDetails(result);
        } catch (error) {
            console.error(error);
            toast({ title: "Expansion Error", description: "Failed to expand the idea. Please try again later.", variant: "destructive" });
            setSelectedIdea(null);
            setExpandedDetails(null);
        } finally {
            setIsExpandingDetails(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 pb-16">
                <Tabs defaultValue="generator" className="max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generator"><Wand2 className="mr-2"/> Generator</TabsTrigger>
                        <TabsTrigger value="history"><History className="mr-2"/> My Ideas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generator">
                        <div className="max-w-2xl mx-auto py-8">
                            <form onSubmit={onGenerateSubmit} className="flex flex-col sm:flex-row items-center gap-2 mb-8">
                                <Input
                                    type="text"
                                    value={niche}
                                    onChange={(e) => setNiche(e.target.value)}
                                    placeholder="e.g., 'Sustainable home gardening'"
                                    className="flex-grow text-base"
                                    aria-label="Video Niche Input"
                                />
                                <Button type="submit" disabled={isLoadingIdeas || isUserLoading} className="w-full sm:w-auto">
                                    {isLoadingIdeas ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <Wand2 />
                                    )}
                                    <span>Generate Ideas</span>
                                </Button>
                            </form>
                        </div>
                        
                        {isLoadingIdeas && (
                            <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <p className="text-muted-foreground">Searching for trending videos and sparking new ideas...</p>
                            </div>
                        )}
                        
                        {ideas && ideas.length > 0 && (
                            <div className="flex flex-col items-center">
                                <div className="w-full">
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold tracking-tight">5 Fresh Ideas for "{lastSearchedNiche}"</h2>
                                        <p className="text-muted-foreground mt-2">Here are some creative sparks. Click 'Expand Idea' for more details.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                        {ideas.map((idea, index) => (
                                            <IdeaCard
                                                key={index}
                                                idea={idea}
                                                onExpand={() => onExpandClick(idea, lastSearchedNiche)}
                                                isLoading={isExpandingDetails}
                                                isSelected={selectedIdea?.title === idea.title}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {ideas && ideas.length === 0 && !isLoadingIdeas && (
                            <div className="text-center py-16">
                                <p className="text-muted-foreground">No ideas were generated. Please try a different or more specific niche.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="history">
                       <SavedIdeasTab />
                    </TabsContent>
                </Tabs>
            </main>
            <IdeaDetailsDialog
                open={!!selectedIdea}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedIdea(null);
                    }
                }}
                ideaTitle={selectedIdea?.title || ''}
                details={expandedDetails}
                isLoading={isExpandingDetails}
                onSave={() => selectedIdea && handleSaveIdea(selectedIdea, lastSearchedNiche)}
                isSaving={false}
                isSaved={false}
            />
            <LoginDialog 
                open={showLoginPrompt} 
                onOpenChange={setShowLoginPrompt}
            />
        </div>
    );
}

function SavedIdeasTab() {
    const { user } = useUser();
    const firestore = useFirestore();

    const videoIdeasQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/videoIdeas`);
    }, [user, firestore]);

    const { data: savedIdeas, isLoading, error } = useCollection<Idea>(videoIdeasQuery);
    
    if (!user) {
        return (
             <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
                <History className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Log in to see your ideas</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Your saved video ideas will appear here once you log in.
                </p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-16">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Loading your saved ideas...</p>
            </div>
        )
    }
    
    if (error) {
         return (
            <div className="text-center py-16 text-red-500">
                <p>Error loading ideas: {error.message}</p>
            </div>
        )
    }

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Saved Ideas</h2>
                    <p className="text-muted-foreground mt-2">Browse your collection of video ideas.</p>
                </div>
            </div>
            
            {savedIdeas && savedIdeas.length === 0 ? (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <History className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Saved Ideas Yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Go to the 'Generator' tab to create and save some video ideas.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {savedIdeas?.map((idea, index) => (
                        <div key={idea.id || index}>
                            <h3 className="text-xl font-semibold">"{idea.title}"</h3>
                            <p className="text-sm text-muted-foreground mb-4">{idea.description}</p>
                        </div>
                    ))}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedIdeas?.map((idea, ideaIndex) => (
                           <IdeaCard
                                key={idea.id || ideaIndex}
                                idea={idea}
                                onExpand={() => { /* Implement expand for saved ideas */ }}
                                isSaved={true}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
