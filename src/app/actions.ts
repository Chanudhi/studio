
"use server";

import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput, type RecipeDetail } from "@/ai/flows/suggest-recipes";
import { fetchRecipeDetails, type FetchRecipeDetailsInput, type FetchRecipeDetailsOutput } from "@/ai/flows/fetch-recipe-details-flow";
import { z } from "zod";

const SuggestActionInputSchema = z.object({
  ingredients: z.string().min(3, "Please enter at least one ingredient (minimum 3 characters)."),
  dietaryRestrictions: z.string().optional().transform(val => val === "" || val === null ? undefined : val),
  cuisinePreferences: z.string().optional().transform(val => val === "" || val === null ? undefined : val),
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
  } catch (e) {
    const error = e as any; // To access potential .message or other props
    console.error("Error in getRecipeSuggestionsAction (raw error object):", error);
    // For more detailed logging, you might stringify if it's an object:
    // if (typeof error === 'object' && error !== null) {
    //   console.error("Error details (stringified):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    // }


    let clientErrorMessage = "An unexpected error occurred while suggesting recipes. Please try again later.";

    if (typeof error?.message === 'string' && error.message.length > 0) {
        // Avoid sending overly technical or very long error messages to the client.
        if (error.message.length < 250 && !error.message.includes('\n') && !error.message.toLowerCase().includes('internal') && !error.message.toLowerCase().includes('server')) {
            clientErrorMessage = error.message;
        } else {
            // Log the detailed message for developers, but give user a more generic one
            console.error("Original error message was too long, complex, or internal for client:", error.message);
            clientErrorMessage = "The AI chef faced a technical difficulty. Please try again, or check ingredients for unusual characters.";
        }
    } else if (typeof error === 'string' && error.length > 0) {
        if (error.length < 250 && !error.includes('\n')) {
            clientErrorMessage = error;
        } else {
            console.error("Original error string was too long or complex for client:", error);
            clientErrorMessage = "The AI chef encountered an unexpected issue. Please try again.";
        }
    }
    
    return { error: clientErrorMessage };
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
      errorMessage = error.message; 
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return { error: errorMessage };
  }
}
