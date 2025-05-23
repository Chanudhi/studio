
"use client";

import React from "react";
import RecipeCard from "./RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { RecipeDetail } from "@/ai/flows/suggest-recipes";

type RecipeListProps = {
  recipes: RecipeDetail[];
  isLoading: boolean;
  error: string | null;
  message?: string | null; 
  onViewRecipe: (recipeName: string) => void;
};

export default function RecipeList({ recipes, isLoading, error, message, onViewRecipe }: RecipeListProps) {
  if (isLoading) {
    return (
      <div className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm bg-card">
            <Skeleton className="h-[125px] w-full rounded-xl aspect-[3/2]" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-10">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Error Generating Recipes</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!recipes || recipes.length === 0) {
    if (message && !error) { 
       return (
        <Alert className="mt-10">
          <Info className="h-5 w-5" />
          <AlertTitle>Recipe Status</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }
    return null; 
  }
  
  return (
    <div className="mt-10">
      {message && !error && recipes.length > 0 && (
         <Alert variant="default" className="mb-6 bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
           <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
           <AlertTitle className="text-green-700 dark:text-green-300">Success!</AlertTitle>
           <AlertDescription className="text-green-600 dark:text-green-300/90">{message}</AlertDescription>
         </Alert>
       )}
      <h2 className="text-3xl font-semibold mb-6 text-center text-primary">Suggested Recipes</h2>
      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} onViewRecipe={onViewRecipe} />
        ))}
      </div>
    </div>
  );
}
