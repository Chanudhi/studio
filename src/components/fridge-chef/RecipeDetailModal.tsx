
"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Utensils, ListChecks, Link as LinkIcon, Info } from "lucide-react";
import type { FetchRecipeDetailsOutput } from "@/ai/flows/fetch-recipe-details-flow";

type RecipeDetailModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  recipeDetails: FetchRecipeDetailsOutput | null;
  isLoading: boolean;
  error: string | null;
};

export default function RecipeDetailModal({
  isOpen,
  onOpenChange,
  recipeDetails,
  isLoading,
  error,
}: RecipeDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pt-2">
          {isLoading && !recipeDetails && (
            <DialogTitle className="flex items-center justify-center text-xl">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
              Fetching Recipe Details...
            </DialogTitle>
          )}
          {error && (
             <DialogTitle className="text-xl text-destructive text-center">
                <AlertTriangle className="inline-block mr-2 h-6 w-6" /> Error
             </DialogTitle>
          )}
          {recipeDetails && !isLoading && (
            <DialogTitle className="text-2xl font-bold text-primary text-center">
              <Utensils className="inline-block mr-2 h-7 w-7" /> {recipeDetails.recipeName}
            </DialogTitle>
          )}
        </DialogHeader>

        <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Added padding for scrollbar */}
          <div className="py-4 space-y-6">
            {isLoading && !recipeDetails && (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Could not load recipe details</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {recipeDetails && !isLoading && (
              <>
                {recipeDetails.imageUrl && (
                  <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden shadow-md border border-border">
                    <Image
                      src={recipeDetails.imageUrl}
                      alt={`Image of ${recipeDetails.recipeName}`}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint="recipe food"
                    />
                  </div>
                )}

                {recipeDetails.ingredients && recipeDetails.ingredients.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold flex items-center text-foreground">
                      <ListChecks className="mr-2 h-5 w-5 text-primary" /> Ingredients
                    </h3>
                    <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground bg-muted/30 p-4 rounded-md border border-border">
                      {recipeDetails.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipeDetails.instructions && (
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      <Info className="mr-2 h-5 w-5 text-primary inline-block" /> Instructions
                    </h3>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-md border border-border">
                      {recipeDetails.instructions}
                    </p>
                  </div>
                )}
                
                {(recipeDetails.prepTime || recipeDetails.cookTime || recipeDetails.servings) && (
                    <div className="space-y-2 pt-2 border-t border-border">
                        <h3 className="text-lg font-semibold text-foreground">Additional Info:</h3>
                        <ul className="list-disc list-inside pl-4 text-muted-foreground">
                            {recipeDetails.prepTime && <li><strong>Prep Time:</strong> {recipeDetails.prepTime}</li>}
                            {recipeDetails.cookTime && <li><strong>Cook Time:</strong> {recipeDetails.cookTime}</li>}
                            {recipeDetails.servings && <li><strong>Servings:</strong> {recipeDetails.servings}</li>}
                        </ul>
                    </div>
                )}


                {recipeDetails.sourceUrl && (
                  <div className="pt-4 text-center border-t border-border">
                    <Button variant="link" asChild className="text-primary hover:text-primary/80">
                      <a href={recipeDetails.sourceUrl} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        View Original Source
                      </a>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
