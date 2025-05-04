'use server';

/**
 * @fileOverview Initializes the Genkit AI instance with the Google AI plugin.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with the Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // Read API key from environment variables
    }),
  ],
  logLevel: 'debug', // Set log level for detailed debugging info
  enableTracingAndMetrics: true, // Enable tracing and metrics for monitoring
});
