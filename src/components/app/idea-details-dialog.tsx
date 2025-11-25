import type { ExpandContentIdeaDetailsOutput } from "@/ai/flows/expand-video-idea-details";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Save, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useUser } from "@/firebase";

interface IdeaDetailsDialogProps {
  details: ExpandContentIdeaDetailsOutput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaTitle: string;
  isLoading: boolean;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function IdeaDetailsDialog({ details, open, onOpenChange, ideaTitle, isLoading, onSave, isSaving, isSaved }: IdeaDetailsDialogProps) {
  const { user } = useUser();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{ideaTitle}</DialogTitle>
          <DialogDescription>
            Here's a detailed breakdown for your video idea.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground">Expanding idea details...</p>
            </div>
          ) : details && (
            <ScrollArea className="h-[60vh] pr-4">
              <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg">Script Outline</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {details.scriptOutline}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg">Title Suggestions</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {details.titleSuggestions.map((title, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-accent/50 text-accent-foreground border-accent">{title}</Badge>

                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg">Thumbnail Concepts</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {details.thumbnailConcepts}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg">Video Description Draft</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {details.videoDescriptionDraft}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>
          )}
        </div>
        {user && details && (
            <DialogFooter>
                <Button onClick={onSave} disabled={isSaving || isSaved}>
                    {isSaving ? <Loader2 className="animate-spin" /> : isSaved ? <CheckCircle /> : <Save />}
                    <span>{isSaving ? "Saving..." : isSaved ? "Saved!" : "Save to My Ideas"}</span>
                </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
