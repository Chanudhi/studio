
"use server";

import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput, type RecipeDetail } from "@/ai/flows/suggest-recipes";
import { fetchRecipeDetails, type FetchRecipeDetailsInput, type FetchRecipeDetailsOutput } from "@/ai/flows/fetch-recipe-details-flow";
import { z } from "zod";

const SuggestActionInputSchema = z.object({
  ingredients: z.string().min(3, "Please enter at least one ingredient (minimum 3 characters)."),
  dietaryRestrictions: z.string().optional().transform(val => val === "" ? undefined : val),
  cuisinePreferences: z.string().optional().transform(val => val === "" ? undefined : val),
});

export interface SuggestFormState {
  recipes?: RecipeDetail[];
  error?: string;
  message?: string;
}

export async function getRecipeSuggestionsAction(
  prevState: SuggestFormState | undefined,
  formData: FormData
): Promise<SuggestFormState> {
  const rawFormData = {
    ingredients: formData.get("ingredients") as string,
    dietaryRestrictions: formData.get("dietaryRestrictions") as string | null,
    cuisinePreferences: formData.get("cuisinePreferences") as string | null,
  };

  const processedFormData = {
    ingredients: rawFormData.ingredients,
    dietaryRestrictions: rawFormData.dietaryRestrictions === null ? undefined : rawFormData.dietaryRestrictions,
    cuisinePreferences: rawFormData.cuisinePreferences === null ? undefined : rawFormData.cuisinePreferences,
  };

  const validatedFields = SuggestActionInputSchema.safeParse(processedFormData);

  if (!validatedFields.success) {
    const firstErrorField = Object.keys(validatedFields.error.flatten().fieldErrors)[0] as keyof typeof validatedFields.error.flatten().fieldErrors;
    const errorMessage = validatedFields.error.flatten().fieldErrors[firstErrorField]?.[0] || "Invalid input.";
    
    return {
      error: errorMessage,
    };
  }

  try {
    const output: SuggestRecipesOutput = await suggestRecipes(validatedFields.data as SuggestRecipesInput);
    if (output.recipes && output.recipes.length > 0) {
      return { recipes: output.recipes, message: "Here are your recipe suggestions!" };
    }
    return { recipes: [], message: "No recipes found for these ingredients. Try different options!" };
  } catch (error) {
    console.error("Error fetching recipe suggestions:", error);
    let errorMessage = "Failed to generate recipes. The culinary AI might be busy. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return { error: errorMessage };
  }
}

// Schema for fetching recipe details
const RecipeDetailsActionInputSchema = z.object({
  recipeName: z.string().min(1, "Recipe name cannot be empty."),
});

export interface RecipeDetailsState {
  recipeDetails?: FetchRecipeDetailsOutput;
  error?: string;
}

export async function getRecipeDetailsAction(
  recipeName: string
): Promise<RecipeDetailsState> {
  const validatedFields = RecipeDetailsActionInputSchema.safeParse({ recipeName });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.recipeName?.[0] || "Invalid recipe name.",
    };
  }

  try {
    const output: FetchRecipeDetailsOutput = await fetchRecipeDetails(validatedFields.data as FetchRecipeDetailsInput);
    return { recipeDetails: output };
  } catch (error) {
    console.error(`Error fetching details for recipe "${recipeName}":`, error);
    let errorMessage = `Failed to fetch details for "${recipeName}". Please try again.`;
    if (error instanceof Error) {
      errorMessage = error.message; // Use the error message from the flow
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return { error: errorMessage };
  }
}
