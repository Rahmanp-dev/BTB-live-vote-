// src/ai/flows/generate-presenter-description.ts
'use server';

/**
 * @fileOverview AI agent for generating engaging presenter descriptions.
 *
 * - generatePresenterDescription - A function that generates a presenter description.
 * - GeneratePresenterDescriptionInput - The input type for the generatePresenterDescription function.
 * - GeneratePresenterDescriptionOutput - The return type for the generatePresenterDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePresenterDescriptionInputSchema = z.object({
  name: z.string().describe('The name of the presenter.'),
  product: z.string().describe('The product the presenter is presenting.'),
  category: z.string().describe('The category of the product or presenter.'),
  existingDescription: z
    .string()
    .optional()
    .describe('The existing description of the presenter, if any.'),
});
export type GeneratePresenterDescriptionInput = z.infer<
  typeof GeneratePresenterDescriptionInputSchema
>;

const GeneratePresenterDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated description of the presenter.'),
});
export type GeneratePresenterDescriptionOutput = z.infer<
  typeof GeneratePresenterDescriptionOutputSchema
>;

export async function generatePresenterDescription(
  input: GeneratePresenterDescriptionInput
): Promise<GeneratePresenterDescriptionOutput> {
  return generatePresenterDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePresenterDescriptionPrompt',
  input: {schema: GeneratePresenterDescriptionInputSchema},
  output: {schema: GeneratePresenterDescriptionOutputSchema},
  prompt: `You are a marketing expert skilled at creating engaging and concise descriptions.

  Given the following information about a presenter, generate a compelling description to engage the audience.

  Name: {{name}}
  Product: {{product}}
  Category: {{category}}
  {{#if existingDescription}}
  Existing Description: {{existingDescription}}
  Refine the existing description to be more engaging.
  {{else}}
  Create a new description.
  {{/if}}
  Description should be no more than 100 words.
  `,
});

const generatePresenterDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePresenterDescriptionFlow',
    inputSchema: GeneratePresenterDescriptionInputSchema,
    outputSchema: GeneratePresenterDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
