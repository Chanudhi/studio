
'use server';
/**
 * @fileOverview Flow for fetching detailed recipe information from TheMealDB API.
 *
 * - fetchRecipeDetails - A function that fetches details for a given recipe name.
 * - FetchRecipeDetailsInput - The input type for the fetchRecipeDetails function.
 * - FetchRecipeDetailsOutput - The return type for the fetchRecipeDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for fetching recipe details
const FetchRecipeDetailsInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to fetch details for.'),
});
export type FetchRecipeDetailsInput = z.infer<typeof FetchRecipeDetailsInputSchema>;

// Define the output schema for the fetched recipe details
const FetchRecipeDetailsOutputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients for the recipe.'),
  instructions: z.string().describe('The cooking instructions for the recipe.'),
  prepTime: z.string().optional().describe('Estimated preparation time (often not available from TheMealDB).'),
  cookTime: z.string().optional().describe('Estimated cooking time (often not available from TheMealDB).'),
  servings: z.string().optional().describe('Number of servings (often not available from TheMealDB).'),
  sourceUrl: z.string().url().optional().describe('The original URL of the recipe if available.'),
  imageUrl: z.string().url().optional().describe('URL of an image for the recipe from TheMealDB.')
});
export type FetchRecipeDetailsOutput = z.infer<typeof FetchRecipeDetailsOutputSchema>;

const fetchExternalRecipeApiTool = ai.defineTool(
  {
    name: 'fetchExternalRecipeApiTool',
    description: 'Fetches detailed recipe information from TheMealDB API based on a recipe name.',
    inputSchema: FetchRecipeDetailsInputSchema,
    outputSchema: FetchRecipeDetailsOutputSchema,
  },
  async (input) => {
    const recipeName = input.recipeName;
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipeName)}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`TheMealDB API request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (!data.meals || data.meals.length === 0) {
        throw new Error(`No recipe details found for "${recipeName}" on TheMealDB.`);
      }

      const meal = data.meals[0]; // Assuming the first result is the most relevant

      const ingredients: string[] = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}` as keyof typeof meal] as string;
        const measure = meal[`strMeasure${i}` as keyof typeof meal] as string;
        if (ingredient && ingredient.trim() !== "") {
          ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`.trim());
        }
      }

      return {
        recipeName: meal.strMeal as string,
        ingredients: ingredients,
        instructions: meal.strInstructions as string || 'No instructions provided.',
        sourceUrl: meal.strSource as string || meal.strYoutube as string || undefined,
        imageUrl: meal.strMealThumb as string || undefined,
        // prepTime, cookTime, servings are not directly available or reliably parseable from TheMealDB for all recipes
        prepTime: undefined, 
        cookTime: undefined,
        servings: undefined,
      };
    } catch (error) {
      console.error(`Error fetching recipe from TheMealDB for "${recipeName}":`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch details for "${recipeName}" from TheMealDB: ${error.message}`);
      }
      throw new Error(`An unknown error occurred while fetching details for "${recipeName}" from TheMealDB.`);
    }
  }
);

const fetchRecipeDetailsFlowInternal = ai.defineFlow(
  {
    name: 'fetchRecipeDetailsFlowInternal',
    inputSchema: FetchRecipeDetailsInputSchema,
    outputSchema: FetchRecipeDetailsOutputSchema,
  },
  async (input) => {
    try {
      const recipeDetails = await fetchExternalRecipeApiTool(input);
      return recipeDetails;
    } catch (error) {
      console.error(`Error in fetchRecipeDetailsFlow for "${input.recipeName}":`, error);
      throw error; // Re-throw the error to be caught by the caller (e.g., server action)
    }
  }
);

export async function fetchRecipeDetails(input: FetchRecipeDetailsInput): Promise<FetchRecipeDetailsOutput> {
  return fetchRecipeDetailsFlowInternal(input);
}
