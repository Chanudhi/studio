
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/fetch-recipe-details-flow.ts'; // Add the new flow
