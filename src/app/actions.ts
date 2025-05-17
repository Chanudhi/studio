
"use server";

import { suggestRecipes, type SuggestRecipesInput, type SuggestRecipesOutput } from "@/ai/flows/suggest-recipes";
import { z } from "zod";

const ActionInputSchema = z.object({
  ingredients: z.string().min(3, "Please enter at least one ingredient (minimum 3 characters)."),
  dietaryRestrictions: z.string().optional(),
  cuisinePreferences: z.string().optional(),
});

export interface FormState {
  recipes?: string[];
  error?: string;
  message?: string;
}

export async function getRecipeSuggestionsAction(
  prevState: FormState | undefined, // Can be undefined for initial state
  formData: FormData
): Promise<FormState> {
  const rawFormData = {
    ingredients: formData.get("ingredients") as string,
    dietaryRestrictions: formData.get("dietaryRestrictions") as string | undefined,
    cuisinePreferences: formData.get("cuisinePreferences") as string | undefined,
  };

  const validatedFields = ActionInputSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    // Get first error for simplicity
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
    console.error("Error fetching recipes:", error);
    return { error: "Failed to generate recipes. The culinary AI might be busy. Please try again." };
  }
}
