
'use server';

/**
 * @fileOverview Initializes the Genkit AI instance with the Google AI plugin.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai'; // Import googleAI

export const ai = genkit({
  plugins: [
    googleAI({
      // Ensure the API key is read from environment variables
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  logLevel: 'debug', // Set log level for detailed debugging info
  enableTracingAndMetrics: true, // Enable tracing and metrics for monitoring
});
