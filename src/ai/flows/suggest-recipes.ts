
'use server';
/**
 * @fileOverview Recipe suggestion flow.
 *
 * - suggestRecipes - A function that suggests recipes based on ingredients.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 * - RecipeDetail - The type for individual recipe details including name and image URL.
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

const RecipeDetailSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  imageUrl: z.string().url().describe('A URL to an image for the recipe (can be a data URI or a web URL).'),
  // Future enhancements could include:
  // description: z.string().optional().describe('A brief description of the recipe.'),
  // prepTime: z.string().optional().describe('Estimated preparation time.'),
});
export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z
    .array(RecipeDetailSchema)
    .describe('A list of recipe suggestions including their names and image URLs. If no recipes are found, this should be an empty array.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

// Step 1: Prompt for recipe names
const suggestRecipeNamesPrompt = ai.definePrompt({
  name: 'suggestRecipeNamesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: z.object({ recipeNames: z.array(z.string()).describe("An array of unique recipe names based on the input. Aim for 2-3 diverse suggestions if possible.") })},
  prompt: `You are a recipe suggestion AI. Your task is to suggest recipe names based on a list of available ingredients, dietary restrictions, and cuisine preferences.
The recipe names MUST be concise and suitable for searching on a recipe database like TheMealDB. Aim for common dish names or simple descriptions (e.g., "Chicken Stir Fry", "Tomato Soup", "Pasta Carbonara"). Avoid overly long or highly specific, unique names that are unlikely to be found in a general recipe database.
You MUST respond with a JSON object matching the specified output schema.
The JSON object should have a key "recipeNames", which is an array of strings. Each string should be a recipe name.
If no recipes can be found based on the input, the "recipeNames" array MUST be empty (e.g., { "recipeNames": [] }).
Do not include numbering like "1." or "-" in the recipe names themselves within the JSON array. Ensure recipe names are valid strings and not null.

Available ingredients: {{{ingredients}}}
Optional dietary restrictions: {{{dietaryRestrictions}}}
Optional cuisine preferences: {{{cuisinePreferences}}}
`,
});

// Step 2: Internal flow to generate an image for a given recipe name
const GenerateRecipeImageInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to generate an image for.'),
});

const GenerateRecipeImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('A data URI of the generated image for the recipe, or a placeholder URL if generation failed.'),
});

const generateRecipeImageInternalFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageInternalFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async (input) => {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `Generate a vibrant, appetizing, and photo-realistic image of a dish called: "${input.recipeName}". The image should show the food prepared and plated attractively. Focus on clear lighting and good composition.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (media?.url) {
        return { imageUrl: media.url };
      } else {
        console.warn(`Image generation did not return a URL for ${input.recipeName}. Falling back to placeholder.`);
        const placeholderSize = 400 + (input.recipeName.length % 5) * 20; // Simple variation
        return { imageUrl: `https://placehold.co/${placeholderSize}x${placeholderSize - 100}.png` };
      }
    } catch (error) {
      console.error(`Error during image generation for ${input.recipeName}:`, error);
      const placeholderSize = 400 + (input.recipeName.length % 5) * 20;
      return { imageUrl: `https://placehold.co/${placeholderSize}x${placeholderSize - 100}.png` };
    }
  }
);

// Main flow: Suggests recipes with names and generated images
const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async (input) => {
    const recipeNamesResponse = await suggestRecipeNamesPrompt(input);

    if (!recipeNamesResponse.output || !recipeNamesResponse.output.recipeNames || recipeNamesResponse.output.recipeNames.length === 0) {
      return { recipes: [] };
    }

    // Generate images for each recipe name in parallel
    const recipeDetailsPromises = recipeNamesResponse.output.recipeNames.map(async (name) => {
      try {
        const imageOutput = await generateRecipeImageInternalFlow({ recipeName: name });
        return {
          name: name,
          imageUrl: imageOutput.imageUrl,
        };
      } catch (err) {
        // This catch is an additional safety net, though generateRecipeImageInternalFlow should also handle its errors.
        console.error(`Error processing recipe image for ${name}:`, err);
        const placeholderSize = 400 + (name.length % 5) * 20;
        return {
          name: name,
          imageUrl: `https://placehold.co/${placeholderSize}x${placeholderSize - 100}.png`, // Fallback
        };
      }
    });

    const recipesWithDetails = await Promise.all(recipeDetailsPromises);
    return { recipes: recipesWithDetails };
  }
);
