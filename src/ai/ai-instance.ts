
'use server';
/**
 * @fileOverview Initializes and configures the Genkit AI instance for the application.
 *
 * - ai: The configured Genkit instance using the Google AI plugin.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Configure Genkit with the Google AI plugin
// Ensure GOOGLE_API_KEY environment variable is set in .env
export const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug', // Optional: Set log level for debugging
  enableTracingAndMetrics: true, // Optional: Enable tracing and metrics
});
