
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Utensils, Clock } from "lucide-react";

type RecipeCardProps = {
  recipeName: string;
};

export default function RecipeCard({ recipeName }: RecipeCardProps) {
  // Generate a consistent placeholder image based on recipe name length or hash (simple version)
  const width = 600 + (recipeName.length % 5) * 10; // Vary width slightly
  const height = 400 + (recipeName.length % 5) * 10; // Vary height slightly

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-[3/2] w-full relative">
          <Image
            src={`https://placehold.co/${width}x${height}.png`}
            alt={`Placeholder image for ${recipeName}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="food recipe"
            className="rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6 flex flex-col flex-grow">
        <CardTitle className="text-xl font-semibold mb-2 text-primary flex items-center">
          <Utensils className="w-5 h-5 mr-2 shrink-0" />
          {recipeName}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm mb-4 flex-grow">
          Detailed ingredients and instructions are not available from the current AI. Enjoy this recipe idea!
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          <span>Prep time: N/A</span>
        </div>
      </CardContent>
    </Card>
  );
}
