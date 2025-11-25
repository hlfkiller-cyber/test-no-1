import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lightbulb, ArrowRight, CheckCircle } from "lucide-react";
import type { GenerateContentIdeasOutput } from "@/ai/flows/generate-video-ideas";

type Idea = GenerateContentIdeasOutput['ideas'][0];

interface IdeaCardProps {
  idea: Idea;
  onExpand: () => void;
  isLoading?: boolean;
  isSelected?: boolean;
  isSaved?: boolean;
}

export function IdeaCard({ idea, onExpand, isLoading, isSelected, isSaved }: IdeaCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4 p-5">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
          <CardDescription className="mt-2 text-base leading-relaxed">{idea.description}</CardDescription>
        </div>

      </CardHeader>
      <CardFooter className="mt-auto bg-card border-t p-4">
        {isSaved ? (
           <Button variant="outline" className="w-full" disabled>
             <CheckCircle />
             <span>Saved</span>
           </Button>
        ) : (
            <Button onClick={onExpand} className="w-full" disabled={isLoading}>
            {(isLoading && isSelected) ? (
                <>
                <Loader2 className="animate-spin" />
                <span>Expanding...</span>
                </>
            ) : (
                <>
                <span>Expand Idea</span>
                <ArrowRight />
                </>
            )}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
