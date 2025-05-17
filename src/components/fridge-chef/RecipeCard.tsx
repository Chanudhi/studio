
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, Clock } from "lucide-react";
import type { RecipeDetail } from "@/ai/flows/suggest-recipes"; // Import RecipeDetail

type RecipeCardProps = {
  recipe: RecipeDetail; // Updated from recipeName: string
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  // The AI hint could be more dynamic if needed, e.g., based on primary ingredients if available
  const aiHintKeywords = recipe.name.toLowerCase().split(" ").slice(0, 2).join(" ") || "food recipe";

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] w-full relative bg-muted/30"> {/* Added background for loading state */}
          <Image
            src={recipe.imageUrl} // Use imageUrl from recipe object
            alt={`Image of ${recipe.name}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint={aiHintKeywords} // Use dynamic keywords
            className="rounded-t-lg"
            unoptimized={recipe.imageUrl.startsWith('data:image')} // Important for data URIs if they are large
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <CardTitle className="text-xl font-semibold mb-2 text-primary flex items-center">
          <Utensils className="w-5 h-5 mr-2 shrink-0" />
          {recipe.name} {/* Use name from recipe object */}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm mb-4 flex-grow">
          {/* This could be populated if description is added to RecipeDetail */}
          Enjoy this AI-generated recipe idea and image! Full details coming soon.
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          {/* This could be populated if prepTime is added to RecipeDetail */}
          <span>Prep time: N/A</span>
        </div>
      </CardContent>
    </Card>
  );
}
