import {genkit} from 'genkit';
import { googleAI } from '@genkit-ai/googleai'; // Import googleAI plugin

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // Use GOOGLE_API_KEY from environment variables
    }),
  ],
  // Set the default model to a Gemini model (e.g., gemini-1.5-flash)
  // Adjust the model name as needed based on availability and preference
  model: 'googleai/gemini-1.5-flash',
});
