
'use server';
/**
 * @fileOverview Recipe suggestion flow.
 *
 * - suggestRecipes - A function that suggests recipes based on ingredients.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available.'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Dietary restrictions, e.g., vegetarian, gluten-free.'),
  cuisinePreferences: z
    .string()
    .optional()
    .describe('Cuisine preferences, e.g., Italian, Mexican.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z
    .array(z.string())
    .describe('A list of recipe suggestions based on the provided ingredients and preferences. If no recipes are found, this should be an empty array.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const suggestRecipesPrompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `You are a recipe suggestion AI. Your task is to suggest recipes based on a list of available ingredients, dietary restrictions, and cuisine preferences.
You MUST respond with a JSON object matching the specified output schema.
The JSON object should have a key "recipes", which is an array of strings. Each string should be a recipe name.
If no recipes can be found based on the input, the "recipes" array MUST be empty (e.g., { "recipes": [] }).
Do not include numbering like "1." or "-" in the recipe names themselves within the JSON array. Ensure recipe names are valid strings and not null.

Available ingredients: {{{ingredients}}}
Optional dietary restrictions: {{{dietaryRestrictions}}}
Optional cuisine preferences: {{{cuisinePreferences}}}
`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await suggestRecipesPrompt(input);
    // Ensure output is not null/undefined and recipes is an array, even if empty.
    // The Zod schema validation should handle this, but a fallback can be added if needed.
    if (!output || !Array.isArray(output.recipes)) {
      return { recipes: [] }; // Fallback to empty array if output is malformed
    }
    return output;
  }
);

