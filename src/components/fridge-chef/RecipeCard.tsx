
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, ExternalLink } from "lucide-react";
import type { RecipeDetail } from "@/ai/flows/suggest-recipes";

type RecipeCardProps = {
  recipe: RecipeDetail;
  onViewRecipe: (recipeName: string) => void; // Callback to handle viewing full recipe
};

export default function RecipeCard({ recipe, onViewRecipe }: RecipeCardProps) {
  const aiHintKeywords = recipe.name.toLowerCase().split(" ").slice(0, 2).join(" ") || "food recipe";

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] w-full relative bg-muted/30">
          <Image
            src={recipe.imageUrl}
            alt={`Image of ${recipe.name}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={aiHintKeywords}
            className="rounded-t-lg"
            unoptimized={recipe.imageUrl.startsWith('data:image')}
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <CardTitle className="text-xl font-semibold mb-2 text-primary flex items-center">
          <Utensils className="w-5 h-5 mr-2 shrink-0" />
          {recipe.name}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm mb-4 flex-grow">
          Enjoy this AI-generated recipe idea and image! Click below for more details.
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground mt-auto pt-4 border-t border-border justify-between">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            <span>Prep time: N/A</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewRecipe(recipe.name)}
            className="text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            View Recipe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
