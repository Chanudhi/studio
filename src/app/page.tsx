
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat } from 'lucide-react';
import IngredientForm from '@/components/fridge-chef/IngredientForm';
import RecipeList from '@/components/fridge-chef/RecipeList';
import RecipeDetailModal from '@/components/fridge-chef/RecipeDetailModal';
import type { SuggestFormState, RecipeDetailsState } from '@/app/actions';
import { getRecipeDetailsAction } from '@/app/actions';
import type { RecipeDetail } from '@/ai/flows/suggest-recipes';
import type { FetchRecipeDetailsOutput } from '@/ai/flows/fetch-recipe-details-flow';
import { useToast } from "@/hooks/use-toast";


export default function FridgeChefPage() {
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(Date.now());

  const [selectedRecipeDetails, setSelectedRecipeDetails] = useState<FetchRecipeDetailsOutput | null>(null);
  const [isRecipeDetailModalOpen, setIsRecipeDetailModalOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleFormSubmitResult = useCallback((state: SuggestFormState) => {
    setIsLoadingSuggestions(false);
    if (state.error) {
      setSuggestionError(state.error);
      setRecipes([]);
      setSuggestionMessage(null);
    } else {
      setRecipes(state.recipes || []);
      setSuggestionError(null);
      setSuggestionMessage(state.message || null);
      // if (state.recipes && state.recipes.length > 0) {
      //   // setFormKey(Date.now()); 
      // }
    }
  }, []); 

  const handleViewRecipe = useCallback(async (recipeName: string) => {
    setIsFetchingDetails(true);
    setDetailError(null);
    setSelectedRecipeDetails(null); // Clear previous details
    setIsRecipeDetailModalOpen(true); // Open modal to show loading state

    const result: RecipeDetailsState = await getRecipeDetailsAction(recipeName);
    
    setIsFetchingDetails(false);
    if (result.error) {
      setDetailError(result.error);
      toast({
        title: "Error Fetching Recipe",
        description: result.error,
        variant: "destructive",
      });
      // Keep modal open to show error, or close it:
      // setIsRecipeDetailModalOpen(false); 
    } else if (result.recipeDetails) {
      setSelectedRecipeDetails(result.recipeDetails);
      setDetailError(null);
    } else {
      const errMsg = "Recipe details not found, or an unexpected error occurred.";
      setDetailError(errMsg);
      toast({
        title: "Recipe Not Found",
        description: errMsg,
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-8 shadow-md bg-card border-b border-border">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <ChefHat className="w-16 h-16 text-primary mb-2" />
          <h1 className="text-5xl font-bold text-primary">FridgeChef</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your personal AI chef for ingredients on hand!
          </p>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <IngredientForm
            key={formKey}
            onFormSubmitResult={handleFormSubmitResult}
            setIsLoading={setIsLoadingSuggestions}
          />
          <RecipeList 
            recipes={recipes} 
            isLoading={isLoadingSuggestions} 
            error={suggestionError} 
            message={suggestionMessage}
            onViewRecipe={handleViewRecipe}
          />
        </div>
      </main>

      <RecipeDetailModal
        isOpen={isRecipeDetailModalOpen}
        onOpenChange={setIsRecipeDetailModalOpen}
        recipeDetails={selectedRecipeDetails}
        isLoading={isFetchingDetails}
        error={detailError}
      />

      <footer className="py-6 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FridgeChef. Cook with what you have!</p>
        </div>
      </footer>
    </div>
  );
}
