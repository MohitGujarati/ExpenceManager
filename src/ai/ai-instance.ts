import {genkit} from 'genkit';
import { openai } from '@genkit-ai/openai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    openai({
      apiKey: process.env.OPENAI_API_KEY, // Use OPENAI_API_KEY from environment variables
    }),
  ],
  // Set the default model to an OpenAI model (e.g., gpt-3.5-turbo or gpt-4o-mini)
  // Adjust the model name as needed based on availability and preference
  model: 'openai/gpt-4o-mini',
});
