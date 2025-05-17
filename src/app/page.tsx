
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat } from 'lucide-react';
import IngredientForm from '@/components/fridge-chef/IngredientForm';
import RecipeList from '@/components/fridge-chef/RecipeList';
import type { FormState } from '@/app/actions';
import type { RecipeDetail } from '@/ai/flows/suggest-recipes'; // Import RecipeDetail

export default function FridgeChefPage() {
  const [recipes, setRecipes] = useState<RecipeDetail[]>([]); // Updated to RecipeDetail[]
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(Date.now());

  const handleFormSubmitResult = useCallback((state: FormState) => {
    setIsLoading(false);
    if (state.error) {
      setError(state.error);
      setRecipes([]);
      setMessage(null);
    } else {
      setRecipes(state.recipes || []);
      setError(null);
      setMessage(state.message || null);
      if (state.recipes && state.recipes.length > 0) {
        // Optionally reset form on success
        // setFormKey(Date.now()); 
      }
    }
  }, []); 

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
            setIsLoading={setIsLoading}
          />
          <RecipeList recipes={recipes} isLoading={isLoading} error={error} message={message} />
        </div>
      </main>

      <footer className="py-6 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FridgeChef. Cook with what you have!</p>
        </div>
      </footer>
    </div>
  );
}
