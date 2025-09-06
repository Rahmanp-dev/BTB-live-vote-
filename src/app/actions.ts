'use server';

import { generatePresenterDescription } from '@/ai/flows/generate-presenter-description';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Presenter name must be at least 2 characters.'),
  product: z.string().min(2, 'Product/topic must be at least 2 characters.'),
  category: z.string().min(2, 'Category must be at least 2 characters.'),
  existingDescription: z.string().optional(),
});

export type FormState = {
  message: string;
  description?: string;
  fields?: {
    name?: string;
    product?: string;
    category?: string;
    existingDescription?: string;
  };
  issues?: string[];
};

export async function handleGenerateDescription(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData);
  const parsed = formSchema.safeParse(data);

  const formValues = {
    name: formData.get('name')?.toString() ?? '',
    product: formData.get('product')?.toString() ?? '',
    category: formData.get('category')?.toString() ?? '',
    existingDescription: formData.get('existingDescription')?.toString() ?? '',
  };

  if (!parsed.success) {
    const issues = parsed.error.issues.map(issue => issue.message);
    return {
      message: 'Invalid form data.',
      issues,
      fields: formValues,
    };
  }

  try {
    const result = await generatePresenterDescription(parsed.data);
    return {
      message: 'Description generated successfully.',
      description: result.description,
      fields: formValues,
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      message: `Error generating description: ${error}`,
      fields: formValues,
    };
  }
}
